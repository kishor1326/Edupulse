from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class InterventionBase(BaseModel):
    student_id: int = Field(..., description="Student database ID")
    prediction_id: Optional[int] = Field(None, description="Optional associated prediction ID")
    recommendation: str = Field(..., min_length=3)
    priority: str = Field("Medium", pattern="^(Critical|High|Medium|Low)$")
    status: str = Field("Pending", pattern="^(Pending|In Progress|Completed)$")
    assigned_faculty: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = None
    due_date: Optional[datetime] = None

class InterventionCreate(InterventionBase):
    pass

class InterventionUpdate(BaseModel):
    recommendation: Optional[str] = None
    priority: Optional[str] = Field(None, pattern="^(Critical|High|Medium|Low)$")
    status: Optional[str] = Field(None, pattern="^(Pending|In Progress|Completed)$")
    assigned_faculty: Optional[str] = None
    notes: Optional[str] = None
    due_date: Optional[datetime] = None

class InterventionStudentSummary(BaseModel):
    id: int
    student_id: str
    name: str
    department: str
    year: int
    attendance: float
    marks: float

    class Config:
        from_attributes = True

class InterventionResponse(InterventionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    student: Optional[InterventionStudentSummary] = None

    class Config:
        from_attributes = True

class InterventionListResponse(BaseModel):
    total: int
    pending_count: int
    in_progress_count: int
    completed_count: int
    interventions: List[InterventionResponse]
