import os
import json
from typing import Dict, Any, Tuple, Optional
import numpy as np
import joblib
import shap
from app.core.config import settings
from app.ml.preprocess import validate_and_sanitize_input, prepare_feature_array, FEATURE_NAMES
from app.ml.explain import explain_prediction
from app.ml.train import MODEL_PATH, SCALER_PATH, METADATA_PATH, train_and_save_model

_model = None
_scaler = None
_explainer = None
_metadata = None

def get_or_load_model():
    global _model, _scaler, _explainer, _metadata
    if _model is None or _scaler is None or _explainer is None:
        if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
            print("Model artifacts not found. Training model now...")
            train_and_save_model()
            
        _model = joblib.load(MODEL_PATH)
        _scaler = joblib.load(SCALER_PATH)
        _explainer = shap.TreeExplainer(_model)
        
        if os.path.exists(METADATA_PATH):
            with open(METADATA_PATH, "r") as f:
                _metadata = json.load(f)
                
    return _model, _scaler, _explainer, _metadata

def predict_student_risk(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executes model inference and SHAP explainability for a given student's academic profile.
    Returns:
    - risk_level: "LOW" | "MEDIUM" | "HIGH"
    - risk_probability: float (0.0 to 1.0)
    - risk_score: float (0.0 to 100.0)
    - top_risk_factors: list of factors with impact magnitude and direction
    - explanation: grounded human-readable explanation
    """
    model, scaler, explainer, _ = get_or_load_model()
    
    sanitized = validate_and_sanitize_input(input_data)
    feature_arr = np.array([[sanitized[f] for f in FEATURE_NAMES]], dtype=np.float32)
    feature_scaled = scaler.transform(feature_arr)
    
    # Probabilities for [LOW (0), MEDIUM (1), HIGH (2)]
    probs = model.predict_proba(feature_scaled)[0]
    
    prob_low = float(probs[0]) if len(probs) > 0 else 0.0
    prob_medium = float(probs[1]) if len(probs) > 1 else 0.0
    prob_high = float(probs[2]) if len(probs) > 2 else 0.0
    
    # Calculate composite continuous risk score (0 to 100)
    # Weighted combination: 0*prob_low + 50*prob_medium + 100*prob_high
    raw_risk_score = (prob_medium * 50.0) + (prob_high * 100.0)
    risk_score = max(0.0, min(100.0, float(raw_risk_score)))
    risk_probability = float(prob_high + (0.5 * prob_medium))
    
    # Determine risk level based on configurable thresholds
    if risk_score / 100.0 <= settings.RISK_THRESHOLD_LOW:
        risk_level = "LOW"
    elif risk_score / 100.0 > settings.RISK_THRESHOLD_HIGH:
        risk_level = "HIGH"
    else:
        risk_level = "MEDIUM"
        
    # SHAP feature attributions and grounded explanation
    factors, explanation = explain_prediction(
        explainer=explainer,
        feature_array=feature_scaled,
        feature_dict=sanitized,
        predicted_risk_level=risk_level,
        predicted_risk_score=risk_score
    )
    
    return {
        "risk_level": risk_level,
        "risk_probability": round(risk_probability, 4),
        "risk_score": round(risk_score, 1),
        "top_risk_factors": factors,
        "explanation": explanation,
        "sanitized_features": sanitized
    }

def get_model_metadata() -> Dict[str, Any]:
    _, _, _, metadata = get_or_load_model()
    if metadata is None and os.path.exists(METADATA_PATH):
        with open(METADATA_PATH, "r") as f:
            metadata = json.load(f)
    return metadata or {}
