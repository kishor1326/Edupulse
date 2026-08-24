import os
import json
from datetime import datetime, timezone
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import shap
from app.ml.preprocess import FEATURE_NAMES, FEATURE_LABELS
from app.ml.evaluate import calculate_metrics

MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
MODEL_PATH = os.path.join(MODEL_DIR, "dropout_model.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
METADATA_PATH = os.path.join(MODEL_DIR, "metadata.json")

def generate_synthetic_dataset(n_samples: int = 1600, random_state: int = 42) -> pd.DataFrame:
    """
    Generates a realistic synthetic college student dataset with natural correlations
    between attendance, marks, assignments, study habits, backlogs, and dropout risk.
    """
    np.random.seed(random_state)
    
    # 1. Base academic aptitude and engagement distribution
    latent_capability = np.random.normal(loc=68, scale=16, size=n_samples)
    latent_capability = np.clip(latent_capability, 15, 98)
    
    latent_engagement = np.random.normal(loc=70, scale=18, size=n_samples)
    latent_engagement = np.clip(latent_engagement, 10, 100)
    
    # 2. Features influenced by latent variables + individual noise
    attendance = 0.7 * latent_engagement + 0.3 * latent_capability + np.random.normal(0, 8, n_samples)
    attendance = np.clip(attendance, 10.0, 100.0)
    
    previous_perf = 0.8 * latent_capability + np.random.normal(0, 7, n_samples)
    previous_perf = np.clip(previous_perf, 15.0, 100.0)
    
    marks = 0.5 * latent_capability + 0.3 * attendance + np.random.normal(0, 8, n_samples)
    marks = np.clip(marks, 10.0, 100.0)
    
    assignment_comp = 0.6 * latent_engagement + 0.3 * marks + np.random.normal(0, 9, n_samples)
    assignment_comp = np.clip(assignment_comp, 5.0, 100.0)
    
    participation = 0.7 * latent_engagement + np.random.normal(0, 12, n_samples)
    participation = np.clip(participation, 0.0, 100.0)
    
    # Backlogs (negatively correlated with performance and attendance)
    backlog_prob = np.clip((100 - marks) / 100.0 * 0.7 + (100 - attendance) / 100.0 * 0.3, 0, 0.95)
    backlogs = np.random.poisson(lam=backlog_prob * 2.8, size=n_samples)
    backlogs = np.clip(backlogs, 0, 8)
    
    # Study hours (positively correlated with engagement and performance)
    study_hours = (latent_engagement * 0.25) + np.random.normal(5, 3, n_samples)
    study_hours = np.clip(study_hours, 2.0, 40.0)
    
    # 3. Ground truth risk score formula (0 to 100 composite risk index)
    risk_index = (
        (100.0 - attendance) * 0.30 +
        (100.0 - marks) * 0.28 +
        (100.0 - assignment_comp) * 0.15 +
        (100.0 - previous_perf) * 0.12 +
        (100.0 - participation) * 0.07 +
        (backlogs * 8.5) +
        (np.maximum(0, 20.0 - study_hours) * 0.8) +
        np.random.normal(0, 4.5, n_samples)
    )
    
    # Target classification:
    # 0 = LOW risk (risk_index < 38)
    # 1 = MEDIUM risk (38 <= risk_index < 60)
    # 2 = HIGH risk (risk_index >= 60)
    target = np.zeros(n_samples, dtype=int)
    target[(risk_index >= 38) & (risk_index < 60)] = 1
    target[risk_index >= 60] = 2
    
    df = pd.DataFrame({
        "attendance": np.round(attendance, 1),
        "marks": np.round(marks, 1),
        "assignment_completion": np.round(assignment_comp, 1),
        "previous_performance": np.round(previous_perf, 1),
        "participation": np.round(participation, 1),
        "backlogs": backlogs,
        "study_hours": np.round(study_hours, 1),
        "target": target
    })
    
    return df

def train_and_save_model() -> dict:
    """
    Executes full ML training pipeline:
    Dataset -> Preprocessing -> Train/Test Split -> Random Forest -> Evaluation -> Artifact Persistence.
    """
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    # 1. Generate / load training dataset
    df = generate_synthetic_dataset(n_samples=1800, random_state=42)
    
    X = df[FEATURE_NAMES]
    y = df["target"]
    
    # 2. Train-Test Split (80-20 stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    # 3. Scaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 4. Train Random Forest Classifier
    rf_model = RandomForestClassifier(
        n_estimators=150,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
        class_weight="balanced"
    )
    rf_model.fit(X_train_scaled, y_train)
    
    # 5. Evaluate on test set
    y_pred = rf_model.predict(X_test_scaled)
    metrics = calculate_metrics(y_test.values, y_pred)
    
    # Feature importances
    feature_importances = []
    for feat, imp in zip(FEATURE_NAMES, rf_model.feature_importances_):
        feature_importances.append({
            "feature": feat,
            "label": FEATURE_LABELS.get(feat, feat),
            "importance": round(float(imp), 4)
        })
    feature_importances.sort(key=lambda x: x["importance"], reverse=True)
    
    # 6. Save model, scaler and metadata
    joblib.dump(rf_model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    
    metadata = {
        "model_name": "Random Forest Classifier",
        "model_version": "1.0.0",
        "features": FEATURE_NAMES,
        "classes": ["LOW", "MEDIUM", "HIGH"],
        "accuracy": metrics["accuracy"],
        "precision": metrics["precision"],
        "recall": metrics["recall"],
        "f1_score": metrics["f1_score"],
        "confusion_matrix": metrics["confusion_matrix"],
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "last_trained": datetime.now(timezone.utc).isoformat(),
        "feature_importances": feature_importances
    }
    
    with open(METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"ML Model training complete! Accuracy: {metrics['accuracy']:.4f}, F1: {metrics['f1_score']:.4f}")
    return metadata

if __name__ == "__main__":
    train_and_save_model()
