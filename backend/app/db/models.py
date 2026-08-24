from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="faculty", nullable=False)  # admin, faculty
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    department = Column(String(100), nullable=False, index=True)  # CSE, ECE, AIDS, EEE, MECH, CIVIL
    year = Column(Integer, nullable=False, default=1)              # 1, 2, 3, 4
    semester = Column(Integer, nullable=False, default=1)          # 1 to 8
    
    # Academic and engagement metrics (0 - 100 or counts)
    attendance = Column(Float, nullable=False, default=75.0)
    marks = Column(Float, nullable=False, default=65.0)
    assignment_completion = Column(Float, nullable=False, default=70.0)
    previous_performance = Column(Float, nullable=False, default=65.0)
    participation = Column(Float, nullable=False, default=60.0)
    
    # Optional/Extended features
    backlogs = Column(Integer, nullable=False, default=0)
    study_hours = Column(Float, nullable=False, default=15.0)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    predictions = relationship("Prediction", back_populates="student", cascade="all, delete-orphan", order_by="desc(Prediction.created_at)")
    interventions = relationship("Intervention", back_populates="student", cascade="all, delete-orphan", order_by="desc(Intervention.created_at)")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    risk_level = Column(String(20), nullable=False, index=True)  # LOW, MEDIUM, HIGH
    risk_probability = Column(Float, nullable=False)              # 0.0 to 1.0
    risk_score = Column(Float, nullable=False)                    # 0.0 to 100.0
    explanation = Column(Text, nullable=False)
    predicted_by = Column(String(100), default="AI Engine")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    student = relationship("Student", back_populates="predictions")
    risk_factors = relationship("RiskFactor", back_populates="prediction", cascade="all, delete-orphan")
    interventions = relationship("Intervention", back_populates="prediction")

class RiskFactor(Base):
    __tablename__ = "risk_factors"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id", ondelete="CASCADE"), nullable=False, index=True)
    feature_name = Column(String(100), nullable=False)
    impact_value = Column(Float, nullable=False)        # SHAP value / contribution magnitude
    impact_direction = Column(String(20), nullable=False)  # "increases_risk", "decreases_risk"

    # Relationships
    prediction = relationship("Prediction", back_populates="risk_factors")

class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id", ondelete="SET NULL"), nullable=True, index=True)
    recommendation = Column(Text, nullable=False)
    priority = Column(String(20), nullable=False, default="Medium", index=True)  # Critical, High, Medium, Low
    status = Column(String(20), nullable=False, default="Pending", index=True)    # Pending, In Progress, Completed
    assigned_faculty = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    student = relationship("Student", back_populates="interventions")
    prediction = relationship("Prediction", back_populates="interventions")
