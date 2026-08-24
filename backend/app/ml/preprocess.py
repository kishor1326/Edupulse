from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd

FEATURE_NAMES = [
    "attendance",
    "marks",
    "assignment_completion",
    "previous_performance",
    "participation",
    "backlogs",
    "study_hours"
]

FEATURE_LABELS = {
    "attendance": "Attendance Rate",
    "marks": "Current Academic Marks",
    "assignment_completion": "Assignment Completion",
    "previous_performance": "Previous Semester Performance",
    "participation": "Classroom & Lab Participation",
    "backlogs": "Active Backlogs",
    "study_hours": "Weekly Study Hours"
}

def validate_and_sanitize_input(data: Dict[str, Any]) -> Dict[str, float]:
    """
    Validates input features, handles missing values with safe domain defaults,
    and clamps values to realistic bounds.
    """
    sanitized = {}
    
    # Core features with required bounds [0, 100]
    for feat in ["attendance", "marks", "assignment_completion", "previous_performance", "participation"]:
        val = data.get(feat)
        if val is None or not isinstance(val, (int, float)) or np.isnan(val):
            val = 70.0  # safe median default if missing
        else:
            val = max(0.0, min(100.0, float(val)))
        sanitized[feat] = val
        
    # Backlogs [0, 20]
    backlogs = data.get("backlogs")
    if backlogs is None or not isinstance(backlogs, (int, float)) or np.isnan(backlogs):
        backlogs = 0
    else:
        backlogs = max(0, min(20, int(backlogs)))
    sanitized["backlogs"] = float(backlogs)
    
    # Study hours [0, 100]
    study_hours = data.get("study_hours")
    if study_hours is None or not isinstance(study_hours, (int, float)) or np.isnan(study_hours):
        study_hours = 15.0
    else:
        study_hours = max(0.0, min(100.0, float(study_hours)))
    sanitized["study_hours"] = float(study_hours)
    
    return sanitized

def prepare_feature_array(data: Dict[str, Any]) -> np.ndarray:
    """
    Converts sanitized feature dictionary to a 2D numpy array [1, num_features]
    aligned with FEATURE_NAMES order.
    """
    sanitized = validate_and_sanitize_input(data)
    features = [sanitized[f] for f in FEATURE_NAMES]
    return np.array([features], dtype=np.float32)

def prepare_dataframe(data_list: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Converts a list of student records to a validated DataFrame.
    """
    sanitized_records = [validate_and_sanitize_input(d) for d in data_list]
    return pd.DataFrame(sanitized_records, columns=FEATURE_NAMES)
