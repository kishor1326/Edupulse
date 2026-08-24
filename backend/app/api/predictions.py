from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.database import get_db
from app.db.models import Prediction, Student, RiskFactor, User
from app.schemas.prediction import (
    PredictRequest, PredictResponse, PredictionHistoryItem,
    PredictionHistoryResponse, RiskFactorItem, RecommendationItem
)
from app.core.dependencies import get_current_user
from app.services.prediction_service import predict_ad_hoc, run_prediction_for_student
from app.services.recommendation_service import generate_recommendations

router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.post("/predict", response_model=PredictResponse)
def predict_risk(
    req: PredictRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    input_data = req.model_dump()
    result = predict_ad_hoc(input_data, db=db, current_user=current_user)
    return result

@router.get("", response_model=PredictionHistoryResponse)
def get_prediction_history(
    search: Optional[str] = None,
    risk_level: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Prediction).join(Student, Prediction.student_id == Student.id)
    
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            (Student.name.ilike(search_term)) | (Student.student_id.ilike(search_term))
        )
        
    if risk_level and risk_level.upper() != "ALL":
        query = query.filter(Prediction.risk_level == risk_level.upper())
        
    total = query.count()
    predictions = query.order_by(desc(Prediction.created_at)).offset((page - 1) * limit).limit(limit).all()
    
    items = []
    for p in predictions:
        student = p.student
        factors = []
        for rf in p.risk_factors:
            # classify impact magnitude
            mag = "Medium Impact"
            if abs(rf.impact_value) >= 0.15:
                mag = "High Impact"
            elif abs(rf.impact_value) <= 0.05:
                mag = "Low Impact"
                
            factors.append(RiskFactorItem(
                feature_name=rf.feature_name,
                feature_label=rf.feature_name.replace("_", " ").title(),
                feature_value=getattr(student, rf.feature_name, 0.0) if student else 0.0,
                impact_value=rf.impact_value,
                impact_magnitude=mag,
                impact_direction=rf.impact_direction
            ))
            
        feat_dict = {
            "attendance": student.attendance if student else 75,
            "marks": student.marks if student else 65,
            "assignment_completion": student.assignment_completion if student else 70,
            "previous_performance": student.previous_performance if student else 65,
            "participation": student.participation if student else 60,
            "backlogs": student.backlogs if student else 0,
            "study_hours": student.study_hours if student else 15
        }
        recs_data = generate_recommendations(feat_dict, p.risk_level, p.risk_score, [f.model_dump() for f in factors])
        recs = [RecommendationItem(**r) for r in recs_data]

        items.append(PredictionHistoryItem(
            id=p.id,
            student_id_code=student.student_id if student else f"STU-{p.student_id}",
            student_name=student.name if student else "Unknown",
            department=student.department if student else "General",
            risk_level=p.risk_level,
            risk_probability=p.risk_probability,
            risk_score=p.risk_score,
            explanation=p.explanation,
            predicted_by=p.predicted_by or "AI Engine",
            created_at=p.created_at,
            risk_factors=factors,
            recommendations=recs
        ))

    return PredictionHistoryResponse(
        total=total,
        page=page,
        limit=limit,
        predictions=items
    )

@router.get("/{prediction_id}", response_model=PredictionHistoryItem)
def get_prediction_detail(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    p = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction record not found"
        )
        
    student = p.student
    factors = []
    for rf in p.risk_factors:
        mag = "Medium Impact"
        if abs(rf.impact_value) >= 0.15:
            mag = "High Impact"
        elif abs(rf.impact_value) <= 0.05:
            mag = "Low Impact"
            
        factors.append(RiskFactorItem(
            feature_name=rf.feature_name,
            feature_label=rf.feature_name.replace("_", " ").title(),
            feature_value=getattr(student, rf.feature_name, 0.0) if student else 0.0,
            impact_value=rf.impact_value,
            impact_magnitude=mag,
            impact_direction=rf.impact_direction
        ))
        
    feat_dict = {
        "attendance": student.attendance if student else 75,
        "marks": student.marks if student else 65,
        "assignment_completion": student.assignment_completion if student else 70,
        "previous_performance": student.previous_performance if student else 65,
        "participation": student.participation if student else 60,
        "backlogs": student.backlogs if student else 0,
        "study_hours": student.study_hours if student else 15
    }
    recs_data = generate_recommendations(feat_dict, p.risk_level, p.risk_score, [f.model_dump() for f in factors])
    recs = [RecommendationItem(**r) for r in recs_data]

    return PredictionHistoryItem(
        id=p.id,
        student_id_code=student.student_id if student else f"STU-{p.student_id}",
        student_name=student.name if student else "Unknown",
        department=student.department if student else "General",
        risk_level=p.risk_level,
        risk_probability=p.risk_probability,
        risk_score=p.risk_score,
        explanation=p.explanation,
        predicted_by=p.predicted_by or "AI Engine",
        created_at=p.created_at,
        risk_factors=factors,
        recommendations=recs
    )

@router.get("/student/{student_id}", response_model=List[PredictionHistoryItem])
def get_student_predictions(
    student_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if student_id.isdigit():
        student = db.query(Student).filter((Student.id == int(student_id)) | (Student.student_id == student_id)).first()
    else:
        student = db.query(Student).filter(Student.student_id == student_id.upper()).first()
        
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
        
    predictions = db.query(Prediction).filter(
        Prediction.student_id == student.id
    ).order_by(desc(Prediction.created_at)).all()
    
    results = []
    for p in predictions:
        factors = []
        for rf in p.risk_factors:
            mag = "Medium Impact"
            if abs(rf.impact_value) >= 0.15:
                mag = "High Impact"
            elif abs(rf.impact_value) <= 0.05:
                mag = "Low Impact"
            factors.append(RiskFactorItem(
                feature_name=rf.feature_name,
                feature_label=rf.feature_name.replace("_", " ").title(),
                feature_value=getattr(student, rf.feature_name, 0.0),
                impact_value=rf.impact_value,
                impact_magnitude=mag,
                impact_direction=rf.impact_direction
            ))
            
        feat_dict = {
            "attendance": student.attendance,
            "marks": student.marks,
            "assignment_completion": student.assignment_completion,
            "previous_performance": student.previous_performance,
            "participation": student.participation,
            "backlogs": student.backlogs,
            "study_hours": student.study_hours
        }
        recs_data = generate_recommendations(feat_dict, p.risk_level, p.risk_score, [f.model_dump() for f in factors])
        recs = [RecommendationItem(**r) for r in recs_data]

        results.append(PredictionHistoryItem(
            id=p.id,
            student_id_code=student.student_id,
            student_name=student.name,
            department=student.department,
            risk_level=p.risk_level,
            risk_probability=p.risk_probability,
            risk_score=p.risk_score,
            explanation=p.explanation,
            predicted_by=p.predicted_by or "AI Engine",
            created_at=p.created_at,
            risk_factors=factors,
            recommendations=recs
        ))
    return results
