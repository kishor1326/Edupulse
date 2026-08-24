from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr

class StudentBase(BaseModel):
    student_id: str = Field(..., min_length=2, max_length=50, description="Unique institutional ID e.g. STU1001")
    name: str = Field(..., min_length=2, max_length=150)
    email: Optional[EmailStr] = None
    department: str = Field(..., description="Department e.g. CSE, ECE, AIDS, EEE, MECH, CIVIL")
    year: int = Field(1, ge=1, le=5)
    semester: int = Field(1, ge=1, le=10)
    
    # Core academic & engagement metrics
    attendance: float = Field(..., ge=0.0, le=100.0, description="Attendance percentage 0-100")
    marks: float = Field(..., ge=0.0, le=100.0, description="Current marks percentage 0-100")
    assignment_completion: float = Field(..., ge=0.0, le=100.0, description="Assignment completion percentage 0-100")
    previous_performance: float = Field(..., ge=0.0, le=100.0, description="Previous semester performance 0-100")
    participation: float = Field(..., ge=0.0, le=100.0, description="Classroom & lab participation score 0-100")
    
    # Optional / Extended metrics
    backlogs: int = Field(0, ge=0, description="Number of active academic backlogs")
    study_hours: float = Field(15.0, ge=0.0, le=100.0, description="Weekly self-study hours")

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None
    year: Optional[int] = Field(None, ge=1, le=5)
    semester: Optional[int] = Field(None, ge=1, le=10)
    attendance: Optional[float] = Field(None, ge=0.0, le=100.0)
    marks: Optional[float] = Field(None, ge=0.0, le=100.0)
    assignment_completion: Optional[float] = Field(None, ge=0.0, le=100.0)
    previous_performance: Optional[float] = Field(None, ge=0.0, le=100.0)
    participation: Optional[float] = Field(None, ge=0.0, le=100.0)
    backlogs: Optional[int] = Field(None, ge=0)
    study_hours: Optional[float] = Field(None, ge=0.0, le=100.0)

class LatestPredictionSummary(BaseModel):
    id: int
    risk_level: str
    risk_probability: float
    risk_score: float
    explanation: str
    created_at: datetime

    class Config:
        from_attributes = True

class StudentResponse(StudentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    latest_prediction: Optional[LatestPredictionSummary] = None

    class Config:
        from_attributes = True

class StudentListResponse(BaseModel):
    total: int
    page: int
    limit: int
    students: List[StudentResponse]

class CSVRowError(BaseModel):
    row_index: int
    student_id: Optional[str] = None
    errors: List[str]

class CSVImportResult(BaseModel):
    total_rows: int
    successful_imports: int
    failed_rows: int
    errors: List[CSVRowError]
    imported_students: List[StudentResponse]
