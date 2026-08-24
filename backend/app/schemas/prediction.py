from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class PredictRequest(BaseModel):
    student_id: Optional[str] = Field(None, description="Optional existing student institutional ID or DB ID")
    name: Optional[str] = Field(None, description="Optional student name")
    department: Optional[str] = Field("CSE", description="Department name")
    attendance: float = Field(..., ge=0.0, le=100.0, description="Attendance percentage")
    marks: float = Field(..., ge=0.0, le=100.0, description="Current marks percentage")
    assignment_completion: float = Field(..., ge=0.0, le=100.0, description="Assignment completion percentage")
    previous_performance: float = Field(..., ge=0.0, le=100.0, description="Previous performance score")
    participation: float = Field(..., ge=0.0, le=100.0, description="Participation score")
    backlogs: Optional[int] = Field(0, ge=0, description="Academic backlogs")
    study_hours: Optional[float] = Field(15.0, ge=0.0, le=100.0, description="Weekly study hours")
    save_to_db: Optional[bool] = Field(True, description="Whether to persist prediction in database if student exists")

class RiskFactorItem(BaseModel):
    feature_name: str
    feature_label: str
    feature_value: float
    impact_value: float
    impact_magnitude: str  # "High Impact", "Medium Impact", "Low Impact"
    impact_direction: str  # "increases_risk" or "decreases_risk"

class RecommendationItem(BaseModel):
    recommendation: str
    priority: str          # "Critical", "High", "Medium", "Low"
    category: str          # "Attendance", "Academic", "Engagement", "Faculty Follow-up"

class PredictResponse(BaseModel):
    id: Optional[int] = None
    student_id: Optional[str] = None
    student_db_id: Optional[int] = None
    student_name: Optional[str] = None
    risk_level: str        # "LOW", "MEDIUM", "HIGH"
    risk_probability: float # 0.0 to 1.0
    risk_score: float      # 0 to 100
    top_risk_factors: List[RiskFactorItem]
    explanation: str
    recommendations: List[RecommendationItem]
    created_at: Optional[datetime] = None

class PredictionHistoryItem(BaseModel):
    id: int
    student_id_code: str
    student_name: str
    department: str
    risk_level: str
    risk_probability: float
    risk_score: float
    explanation: str
    predicted_by: str
    created_at: datetime
    risk_factors: List[RiskFactorItem]
    recommendations: List[RecommendationItem]

    class Config:
        from_attributes = True

class PredictionHistoryResponse(BaseModel):
    total: int
    page: int
    limit: int
    predictions: List[PredictionHistoryItem]
