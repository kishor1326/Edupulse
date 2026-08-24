from typing import Dict, Any, List
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.db.models import Student, Prediction, Intervention
from app.ml.predict import get_model_metadata

def get_overview_statistics(db: Session) -> Dict[str, Any]:
    total_students = db.query(Student).count()
    if total_students == 0:
        return {
            "total_students": 0,
            "low_risk_count": 0,
            "medium_risk_count": 0,
            "high_risk_count": 0,
            "interventions_needed_count": 0,
            "interventions_completed_count": 0,
            "average_attendance": 0.0,
            "average_marks": 0.0,
            "high_risk_percentage": 0.0,
            "intervention_completion_rate": 0.0
        }

    # Query latest predictions for each student
    students = db.query(Student).all()
    low_count = 0
    med_count = 0
    high_count = 0
    
    for s in students:
        if s.predictions:
            latest = s.predictions[0]  # sorted desc by created_at
            if latest.risk_level == "HIGH":
                high_count += 1
            elif latest.risk_level == "MEDIUM":
                med_count += 1
            else:
                low_count += 1
        else:
            # If no prediction yet, classify by rule of thumb
            if s.attendance < 65 or s.marks < 50 or s.backlogs >= 2:
                high_count += 1
            elif s.attendance < 75 or s.marks < 65 or s.backlogs == 1:
                med_count += 1
            else:
                low_count += 1

    # Interventions stats
    total_interventions = db.query(Intervention).count()
    pending_or_in_progress = db.query(Intervention).filter(
        Intervention.status.in_(["Pending", "In Progress"])
    ).count()
    completed_interventions = db.query(Intervention).filter(
        Intervention.status == "Completed"
    ).count()
    
    # Averages
    avg_att = db.query(func.avg(Student.attendance)).scalar() or 0.0
    avg_marks = db.query(func.avg(Student.marks)).scalar() or 0.0
    
    high_pct = (high_count / total_students) * 100.0 if total_students > 0 else 0.0
    completion_rate = (completed_interventions / total_interventions * 100.0) if total_interventions > 0 else 0.0

    return {
        "total_students": total_students,
        "low_risk_count": low_count,
        "medium_risk_count": med_count,
        "high_risk_count": high_count,
        "interventions_needed_count": pending_or_in_progress,
        "interventions_completed_count": completed_interventions,
        "average_attendance": round(float(avg_att), 1),
        "average_marks": round(float(avg_marks), 1),
        "high_risk_percentage": round(high_pct, 1),
        "intervention_completion_rate": round(completion_rate, 1)
    }

def get_risk_distribution(db: Session) -> List[Dict[str, Any]]:
    stats = get_overview_statistics(db)
    total = stats["total_students"] or 1
    
    return [
        {
            "name": "LOW",
            "value": stats["low_risk_count"],
            "percentage": round((stats["low_risk_count"] / total) * 100.0, 1),
            "color": "#10B981"  # Emerald green
        },
        {
            "name": "MEDIUM",
            "value": stats["medium_risk_count"],
            "percentage": round((stats["medium_risk_count"] / total) * 100.0, 1),
            "color": "#F59E0B"  # Amber
        },
        {
            "name": "HIGH",
            "value": stats["high_risk_count"],
            "percentage": round((stats["high_risk_count"] / total) * 100.0, 1),
            "color": "#EF4444"  # Rose red
        }
    ]

def get_department_risk_breakdown(db: Session) -> List[Dict[str, Any]]:
    # Group students by department
    departments = db.query(Student.department).distinct().all()
    results = []
    
    for (dept,) in departments:
        students = db.query(Student).filter(Student.department == dept).all()
        dept_total = len(students)
        low_c = 0
        med_c = 0
        high_c = 0
        tot_att = 0.0
        tot_marks = 0.0
        
        for s in students:
            tot_att += s.attendance
            tot_marks += s.marks
            if s.predictions:
                r = s.predictions[0].risk_level
                if r == "HIGH":
                    high_c += 1
                elif r == "MEDIUM":
                    med_c += 1
                else:
                    low_c += 1
            else:
                if s.attendance < 65 or s.marks < 50:
                    high_c += 1
                elif s.attendance < 75 or s.marks < 65:
                    med_c += 1
                else:
                    low_c += 1
                    
        results.append({
            "department": dept,
            "total": dept_total,
            "low_risk": low_c,
            "medium_risk": med_c,
            "high_risk": high_c,
            "avg_attendance": round(tot_att / dept_total, 1) if dept_total > 0 else 0.0,
            "avg_marks": round(tot_marks / dept_total, 1) if dept_total > 0 else 0.0
        })
        
    return results

def get_risk_trends(db: Session) -> List[Dict[str, Any]]:
    # Aggregate predictions across last 7-14 days or timeline
    predictions = db.query(Prediction).order_by(Prediction.created_at.asc()).all()
    if not predictions:
        # Fallback date point
        return [{
            "date": datetime.now(timezone.utc).strftime("%b %d"),
            "low": 0,
            "medium": 0,
            "high": 0,
            "total_assessed": 0
        }]
        
    date_buckets = {}
    for p in predictions:
        d_str = p.created_at.strftime("%b %d")
        if d_str not in date_buckets:
            date_buckets[d_str] = {"date": d_str, "low": 0, "medium": 0, "high": 0, "total_assessed": 0}
        
        if p.risk_level == "HIGH":
            date_buckets[d_str]["high"] += 1
        elif p.risk_level == "MEDIUM":
            date_buckets[d_str]["medium"] += 1
        else:
            date_buckets[d_str]["low"] += 1
        date_buckets[d_str]["total_assessed"] += 1
        
    return list(date_buckets.values())

def get_scatter_data(db: Session) -> List[Dict[str, Any]]:
    students = db.query(Student).all()
    points = []
    for s in students:
        risk_lvl = "LOW"
        risk_sc = 20.0
        if s.predictions:
            risk_lvl = s.predictions[0].risk_level
            risk_sc = s.predictions[0].risk_score
        else:
            if s.attendance < 65 or s.marks < 50:
                risk_lvl = "HIGH"
                risk_sc = 85.0
            elif s.attendance < 75 or s.marks < 65:
                risk_lvl = "MEDIUM"
                risk_sc = 55.0
                
        points.append({
            "student_id": s.student_id,
            "name": s.name,
            "department": s.department,
            "attendance": s.attendance,
            "marks": s.marks,
            "risk_score": risk_sc,
            "risk_level": risk_lvl
        })
    return points
