from typing import Dict, Any, List, Tuple
import numpy as np
import shap
from app.ml.preprocess import FEATURE_NAMES, FEATURE_LABELS

def explain_prediction(
    explainer: shap.TreeExplainer,
    feature_array: np.ndarray,
    feature_dict: Dict[str, float],
    predicted_risk_level: str,
    predicted_risk_score: float
) -> Tuple[List[Dict[str, Any]], str]:
    """
    Uses SHAP TreeExplainer to calculate feature attributions and produces:
    1. Top contributing risk factors with magnitude and direction
    2. A dynamic human-readable explanation strictly grounded on SHAP values
    """
    # Calculate SHAP values
    shap_values = explainer.shap_values(feature_array)
    
    # Check shape: for multi-class classifier, shap_values is a list of arrays per class,
    # or an array of shape (samples, features, classes).
    # Class 0: LOW, Class 1: MEDIUM, Class 2: HIGH
    # We focus on the attribution towards HIGH risk (Class 2) or the predicted class.
    if isinstance(shap_values, list):
        # Class 2 corresponds to HIGH risk attribution
        high_risk_shap = shap_values[2][0] if len(shap_values) > 2 else shap_values[1][0]
    elif len(shap_values.shape) == 3:
        high_risk_shap = shap_values[0, :, 2] if shap_values.shape[2] > 2 else shap_values[0, :, 1]
    else:
        high_risk_shap = shap_values[0]

    factors = []
    for idx, feat_name in enumerate(FEATURE_NAMES):
        raw_val = feature_dict.get(feat_name, 0.0)
        shap_val = float(high_risk_shap[idx])
        abs_impact = abs(shap_val)
        
        # Impact direction: positive SHAP on high-risk class increases risk
        if shap_val > 0.001:
            direction = "increases_risk"
        elif shap_val < -0.001:
            direction = "decreases_risk"
        else:
            direction = "neutral"
            
        factors.append({
            "feature_name": feat_name,
            "feature_label": FEATURE_LABELS.get(feat_name, feat_name.replace("_", " ").title()),
            "feature_value": round(float(raw_val), 1),
            "impact_value": round(shap_val, 4),
            "abs_impact": abs_impact,
            "impact_direction": direction
        })

    # Sort factors by absolute impact descending
    factors.sort(key=lambda x: x["abs_impact"], reverse=True)

    # Classify impact magnitude based on relative rank and values
    max_impact = factors[0]["abs_impact"] if factors and factors[0]["abs_impact"] > 0 else 1.0
    for f in factors:
        rel_ratio = f["abs_impact"] / max_impact
        if rel_ratio >= 0.65:
            f["impact_magnitude"] = "High Impact"
        elif rel_ratio >= 0.30:
            f["impact_magnitude"] = "Medium Impact"
        else:
            f["impact_magnitude"] = "Low Impact"

    # Generate grounded human-readable explanation
    explanation = generate_narrative_explanation(
        predicted_risk_level,
        predicted_risk_score,
        factors,
        feature_dict
    )

    return factors, explanation

def generate_narrative_explanation(
    risk_level: str,
    risk_score: float,
    factors: List[Dict[str, Any]],
    feature_dict: Dict[str, float]
) -> str:
    """
    Constructs an evidence-backed narrative explanation from top SHAP factors.
    """
    top_risk_drivers = [f for f in factors if f["impact_direction"] == "increases_risk"][:3]
    top_protective = [f for f in factors if f["impact_direction"] == "decreases_risk"][:2]

    driver_phrases = []
    for f in top_risk_drivers:
        name = f["feature_name"]
        val = f["feature_value"]
        if name == "attendance":
            driver_phrases.append(f"critically low attendance ({val}%)")
        elif name == "marks":
            driver_phrases.append(f"lagging academic marks ({val}%)")
        elif name == "assignment_completion":
            driver_phrases.append(f"poor assignment submission rate ({val}%)")
        elif name == "previous_performance":
            driver_phrases.append(f"weak historical semester performance ({val}%)")
        elif name == "participation":
            driver_phrases.append(f"minimal classroom & lab engagement ({val}%)")
        elif name == "backlogs":
            driver_phrases.append(f"{int(val)} active backlog(s)")
        elif name == "study_hours":
            driver_phrases.append(f"limited study hours ({val} hrs/week)")

    protective_phrases = []
    for f in top_protective:
        name = f["feature_name"]
        val = f["feature_value"]
        if name == "attendance":
            protective_phrases.append(f"satisfactory attendance ({val}%)")
        elif name == "marks":
            protective_phrases.append(f"steady exam scores ({val}%)")
        elif name == "assignment_completion":
            protective_phrases.append(f"consistent assignment completion ({val}%)")
        elif name == "participation":
            protective_phrases.append(f"positive classroom participation ({val}%)")

    if risk_level == "HIGH":
        if driver_phrases:
            reasons = ", ".join(driver_phrases[:-1]) + (" and " + driver_phrases[-1] if len(driver_phrases) > 1 else driver_phrases[0])
            narrative = f"The model estimates a HIGH dropout risk ({risk_score:.0f}%) primarily driven by {reasons}. Prompt faculty intervention and academic counselling are strongly advised."
        else:
            narrative = f"The model estimates a HIGH dropout risk ({risk_score:.0f}%) based on cumulative academic warning signs across multiple metrics."
    elif risk_level == "MEDIUM":
        if driver_phrases:
            reasons = ", ".join(driver_phrases)
            narrative = f"The student is classified as MEDIUM risk ({risk_score:.0f}%), showing vulnerability in {reasons}. Targeted academic mentoring and monitoring are recommended."
        else:
            narrative = f"The student is in the MEDIUM risk category ({risk_score:.0f}%). Routine progress check-ins are suggested to prevent further risk escalation."
    else:  # LOW
        if protective_phrases:
            strengths = ", ".join(protective_phrases)
            narrative = f"The student demonstrates LOW dropout risk ({risk_score:.0f}%), supported by strong indicators including {strengths}."
        else:
            narrative = f"The student exhibits healthy academic standing with LOW dropout risk ({risk_score:.0f}%)."

    return narrative
