from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class OverviewStats(BaseModel):
    total_students: int
    low_risk_count: int
    medium_risk_count: int
    high_risk_count: int
    interventions_needed_count: int
    interventions_completed_count: int
    average_attendance: float
    average_marks: float
    high_risk_percentage: float
    intervention_completion_rate: float

class RiskDistributionItem(BaseModel):
    name: str  # "LOW", "MEDIUM", "HIGH"
    value: int
    percentage: float
    color: str

class DepartmentRiskItem(BaseModel):
    department: str
    total: int
    low_risk: int
    medium_risk: int
    high_risk: int
    avg_attendance: float
    avg_marks: float

class RiskTrendItem(BaseModel):
    date: str
    low: int
    medium: int
    high: int
    total_assessed: int

class ScatterPoint(BaseModel):
    student_id: str
    name: str
    department: str
    attendance: float
    marks: float
    risk_score: float
    risk_level: str

class ModelPerformanceMetrics(BaseModel):
    model_name: str
    features: List[str]
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    confusion_matrix: List[List[int]]
    classes: List[str]
    training_samples: int
    test_samples: int
    last_trained: str
    feature_importances: List[Dict[str, Any]]
