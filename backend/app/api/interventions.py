from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.database import get_db
from app.db.models import Intervention, Student, User
from app.schemas.intervention import (
    InterventionCreate, InterventionUpdate, InterventionResponse,
    InterventionListResponse, InterventionStudentSummary
)
from app.core.dependencies import get_current_user, require_faculty_or_admin

router = APIRouter(prefix="/interventions", tags=["Interventions"])

def format_intervention_response(inter: Intervention) -> InterventionResponse:
    student_summary = None
    if inter.student:
        student_summary = InterventionStudentSummary(
            id=inter.student.id,
            student_id=inter.student.student_id,
            name=inter.student.name,
            department=inter.student.department,
            year=inter.student.year,
            attendance=inter.student.attendance,
            marks=inter.student.marks
        )
        
    return InterventionResponse(
        id=inter.id,
        student_id=inter.student_id,
        prediction_id=inter.prediction_id,
        recommendation=inter.recommendation,
        priority=inter.priority,
        status=inter.status,
        assigned_faculty=inter.assigned_faculty,
        notes=inter.notes,
        due_date=inter.due_date,
        created_at=inter.created_at,
        updated_at=inter.updated_at,
        student=student_summary
    )

@router.get("", response_model=InterventionListResponse)
def list_interventions(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = None,
    search: Optional[str] = None,
    student_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Intervention).join(Student, Intervention.student_id == Student.id)
    
    if status_filter and status_filter.upper() != "ALL":
        query = query.filter(Intervention.status.ilike(status_filter))
        
    if priority and priority.upper() != "ALL":
        query = query.filter(Intervention.priority.ilike(priority))
        
    if student_id:
        query = query.filter(Intervention.student_id == student_id)
        
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            (Student.name.ilike(search_term)) |
            (Student.student_id.ilike(search_term)) |
            (Intervention.recommendation.ilike(search_term)) |
            (Intervention.assigned_faculty.ilike(search_term))
        )
        
    all_interventions = query.order_by(desc(Intervention.created_at)).all()
    
    # Counts
    pending_count = db.query(Intervention).filter(Intervention.status == "Pending").count()
    in_prog_count = db.query(Intervention).filter(Intervention.status == "In Progress").count()
    comp_count = db.query(Intervention).filter(Intervention.status == "Completed").count()
    
    return InterventionListResponse(
        total=len(all_interventions),
        pending_count=pending_count,
        in_progress_count=in_prog_count,
        completed_count=comp_count,
        interventions=[format_intervention_response(i) for i in all_interventions]
    )

@router.post("", response_model=InterventionResponse, status_code=status.HTTP_201_CREATED)
def create_intervention(
    item_in: InterventionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty_or_admin)
):
    student = db.query(Student).filter(Student.id == item_in.student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
        
    intervention = Intervention(
        student_id=item_in.student_id,
        prediction_id=item_in.prediction_id,
        recommendation=item_in.recommendation,
        priority=item_in.priority,
        status=item_in.status,
        assigned_faculty=item_in.assigned_faculty or current_user.name,
        notes=item_in.notes,
        due_date=item_in.due_date
    )
    db.add(intervention)
    db.commit()
    db.refresh(intervention)
    return format_intervention_response(intervention)

@router.put("/{intervention_id}", response_model=InterventionResponse)
def update_intervention(
    intervention_id: int,
    item_in: InterventionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty_or_admin)
):
    inter = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not inter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intervention not found"
        )
        
    update_data = item_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(inter, key, value)
        
    db.commit()
    db.refresh(inter)
    return format_intervention_response(inter)

@router.delete("/{intervention_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_intervention(
    intervention_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty_or_admin)
):
    inter = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not inter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intervention not found"
        )
        
    db.delete(inter)
    db.commit()
    return None
