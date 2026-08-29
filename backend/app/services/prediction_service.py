from typing import Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.db.models import Student, Prediction, RiskFactor, Intervention, User
from app.ml.predict import predict_student_risk
from app.services.recommendation_service import generate_recommendations

def run_prediction_for_student(
    db: Session,
    student: Student,
    predicted_by_user: Optional[User] = None
) -> Prediction:
    """
    Executes ML prediction for an existing DB student, saves Prediction,
    records SHAP RiskFactors, and provisions initial Interventions.
    """
    feature_dict = {
        "attendance": student.attendance,
        "marks": student.marks,
        "assignment_completion": student.assignment_completion,
        "previous_performance": student.previous_performance,
        "participation": student.participation,
        "backlogs": student.backlogs,
        "study_hours": student.study_hours
    }
    
    ml_result = predict_student_risk(feature_dict)
    recs = generate_recommendations(
        features=ml_result["sanitized_features"],
        risk_level=ml_result["risk_level"],
        risk_score=ml_result["risk_score"],
        top_factors=ml_result["top_risk_factors"]
    )
    
    predicted_by_name = predicted_by_user.name if predicted_by_user else "SmartDrop AI Engine"
    
    # Create Prediction record
    pred = Prediction(
        student_id=student.id,
        risk_level=ml_result["risk_level"],
        risk_probability=ml_result["risk_probability"],
        risk_score=ml_result["risk_score"],
        explanation=ml_result["explanation"],
        predicted_by=predicted_by_name,
        created_at=datetime.now(timezone.utc)
    )
    db.add(pred)
    db.flush()
    
    # Save Risk Factors
    for factor in ml_result["top_risk_factors"]:
        rf = RiskFactor(
            prediction_id=pred.id,
            feature_name=factor["feature_name"],
            impact_value=factor["impact_value"],
            impact_direction=factor["impact_direction"]
        )
        db.add(rf)
        
    # Auto-generate interventions if student is MEDIUM or HIGH risk
    if ml_result["risk_level"] in ["MEDIUM", "HIGH"]:
        # Only add if student doesn't already have identical pending intervention
        for rec in recs[:2]:  # Take top 2 primary recommendations
            existing = db.query(Intervention).filter(
                Intervention.student_id == student.id,
                Intervention.recommendation == rec["recommendation"],
                Intervention.status.in_(["Pending", "In Progress"])
            ).first()
            if not existing:
                due_days = 7 if rec["priority"] == "Critical" else (14 if rec["priority"] == "High" else 21)
                intervention = Intervention(
                    student_id=student.id,
                    prediction_id=pred.id,
                    recommendation=rec["recommendation"],
                    priority=rec["priority"],
                    status="Pending",
                    assigned_faculty=predicted_by_name if predicted_by_user else None,
                    due_date=datetime.now(timezone.utc) + timedelta(days=due_days)
                )
                db.add(intervention)
                
    db.commit()
    db.refresh(pred)
    return pred

def predict_ad_hoc(
    input_data: Dict[str, Any],
    db: Optional[Session] = None,
    current_user: Optional[User] = None
) -> Dict[str, Any]:
    """
    Handles ad-hoc sandbox predictions or student-linked predictions.
    """
    ml_result = predict_student_risk(input_data)
    recs = generate_recommendations(
        features=ml_result["sanitized_features"],
        risk_level=ml_result["risk_level"],
        risk_score=ml_result["risk_score"],
        top_factors=ml_result["top_risk_factors"]
    )
    
    student_id_val = input_data.get("student_id")
    student_db_obj = None
    pred_record = None
    
    if db and student_id_val:
        # Check if student exists by institutional student_id or int id
        if str(student_id_val).isdigit():
            student_db_obj = db.query(Student).filter(
                (Student.id == int(student_id_val)) | (Student.student_id == str(student_id_val))
            ).first()
        else:
            student_db_obj = db.query(Student).filter(Student.student_id == str(student_id_val)).first()
            
        if student_db_obj and input_data.get("save_to_db", True):
            # Update student metrics
            student_db_obj.attendance = ml_result["sanitized_features"]["attendance"]
            student_db_obj.marks = ml_result["sanitized_features"]["marks"]
            student_db_obj.assignment_completion = ml_result["sanitized_features"]["assignment_completion"]
            student_db_obj.previous_performance = ml_result["sanitized_features"]["previous_performance"]
            student_db_obj.participation = ml_result["sanitized_features"]["participation"]
            student_db_obj.backlogs = int(ml_result["sanitized_features"]["backlogs"])
            student_db_obj.study_hours = ml_result["sanitized_features"]["study_hours"]
            student_db_obj.updated_at = datetime.now(timezone.utc)
            
            pred_record = run_prediction_for_student(db, student_db_obj, current_user)
            
    return {
        "id": pred_record.id if pred_record else None,
        "student_id": student_db_obj.student_id if student_db_obj else str(student_id_val or ""),
        "student_db_id": student_db_obj.id if student_db_obj else None,
        "student_name": student_db_obj.name if student_db_obj else input_data.get("name", "Ad-hoc Assessment"),
        "risk_level": ml_result["risk_level"],
        "risk_probability": ml_result["risk_probability"],
        "risk_score": ml_result["risk_score"],
        "top_risk_factors": ml_result["top_risk_factors"],
        "explanation": ml_result["explanation"],
        "recommendations": recs,
        "created_at": pred_record.created_at if pred_record else datetime.now(timezone.utc)
    }
