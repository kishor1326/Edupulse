import io
import csv
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.db.database import get_db
from app.db.models import Student, User, Prediction
from app.schemas.student import (
    StudentCreate, StudentUpdate, StudentResponse, StudentListResponse,
    CSVImportResult, CSVRowError, LatestPredictionSummary
)
from app.core.dependencies import get_current_user, require_faculty_or_admin, require_admin
from app.services.prediction_service import run_prediction_for_student

router = APIRouter(prefix="/students", tags=["Students"])

def format_student_response(student: Student) -> StudentResponse:
    latest_pred = None
    if student.predictions:
        p = student.predictions[0]
        latest_pred = LatestPredictionSummary(
            id=p.id,
            risk_level=p.risk_level,
            risk_probability=p.risk_probability,
            risk_score=p.risk_score,
            explanation=p.explanation,
            created_at=p.created_at
        )
    
    return StudentResponse(
        id=student.id,
        student_id=student.student_id,
        name=student.name,
        email=student.email,
        department=student.department,
        year=student.year,
        semester=student.semester,
        attendance=student.attendance,
        marks=student.marks,
        assignment_completion=student.assignment_completion,
        previous_performance=student.previous_performance,
        participation=student.participation,
        backlogs=student.backlogs,
        study_hours=student.study_hours,
        created_at=student.created_at,
        updated_at=student.updated_at,
        latest_prediction=latest_pred
    )

@router.get("", response_model=StudentListResponse)
def list_students(
    search: Optional[str] = None,
    department: Optional[str] = None,
    year: Optional[int] = None,
    risk_level: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=200),
    sort_by: str = Query("created_at", pattern="^(name|attendance|marks|created_at|student_id)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Student)
    
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Student.name.ilike(search_term),
                Student.student_id.ilike(search_term),
                Student.email.ilike(search_term)
            )
        )
        
    if department and department.upper() != "ALL":
        query = query.filter(Student.department == department.upper())
        
    if year:
        query = query.filter(Student.year == year)
        
    all_matched_students = query.all()
    
    # Filter by risk level if requested
    if risk_level and risk_level.upper() != "ALL":
        filtered = []
        for s in all_matched_students:
            r = s.predictions[0].risk_level if s.predictions else "LOW"
            if r.upper() == risk_level.upper():
                filtered.append(s)
        all_matched_students = filtered

    total = len(all_matched_students)
    
    # Sorting
    reverse = (sort_order == "desc")
    if sort_by == "name":
        all_matched_students.sort(key=lambda x: x.name.lower(), reverse=reverse)
    elif sort_by == "attendance":
        all_matched_students.sort(key=lambda x: x.attendance, reverse=reverse)
    elif sort_by == "marks":
        all_matched_students.sort(key=lambda x: x.marks, reverse=reverse)
    elif sort_by == "student_id":
        all_matched_students.sort(key=lambda x: x.student_id, reverse=reverse)
    else:
        all_matched_students.sort(key=lambda x: x.created_at, reverse=reverse)
        
    # Pagination
    start = (page - 1) * limit
    end = start + limit
    paginated = all_matched_students[start:end]
    
    return StudentListResponse(
        total=total,
        page=page,
        limit=limit,
        students=[format_student_response(s) for s in paginated]
    )

@router.post("", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(
    student_in: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty_or_admin)
):
    existing = db.query(Student).filter(Student.student_id == student_in.student_id.strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Student with ID '{student_in.student_id}' already exists."
        )
        
    student = Student(
        student_id=student_in.student_id.strip().upper(),
        name=student_in.name.strip(),
        email=student_in.email.lower() if student_in.email else None,
        department=student_in.department.strip().upper(),
        year=student_in.year,
        semester=student_in.semester,
        attendance=student_in.attendance,
        marks=student_in.marks,
        assignment_completion=student_in.assignment_completion,
        previous_performance=student_in.previous_performance,
        participation=student_in.participation,
        backlogs=student_in.backlogs,
        study_hours=student_in.study_hours
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    
    # Run initial ML risk prediction
    run_prediction_for_student(db, student, current_user)
    db.refresh(student)
    
    return format_student_response(student)

@router.get("/{student_id}", response_model=StudentResponse)
def get_student(
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
    return format_student_response(student)

@router.put("/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: str,
    student_update: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty_or_admin)
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
        
    update_data = student_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "department" and value:
            setattr(student, key, value.upper())
        elif key == "email" and value:
            setattr(student, key, value.lower())
        else:
            setattr(student, key, value)
            
    db.commit()
    db.refresh(student)
    
    # Re-evaluate risk prediction on update
    run_prediction_for_student(db, student, current_user)
    db.refresh(student)
    
    return format_student_response(student)

@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    student_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
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
        
    db.delete(student)
    db.commit()
    return None

@router.post("/import", response_model=CSVImportResult)
async def import_students_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty_or_admin)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files (.csv) are supported."
        )
        
    contents = await file.read()
    try:
        decoded = contents.decode("utf-8-sig")
    except UnicodeDecodeError:
        decoded = contents.decode("latin-1")
        
    reader = csv.DictReader(io.StringIO(decoded))
    if not reader.fieldnames:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty or unreadable CSV file."
        )
        
    required_cols = {"student_id", "name", "department", "attendance", "marks"}
    normalized_headers = {h.strip().lower(): h for h in reader.fieldnames if h}
    
    missing_cols = [c for c in required_cols if c not in normalized_headers]
    if missing_cols:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing required CSV columns: {', '.join(missing_cols)}"
        )
        
    row_errors: List[CSVRowError] = []
    imported_students: List[StudentResponse] = []
    
    for idx, row in enumerate(reader, start=2):  # line 2 is first data row
        errors = []
        s_id = row.get(normalized_headers.get("student_id", ""), "").strip()
        name = row.get(normalized_headers.get("name", ""), "").strip()
        dept = row.get(normalized_headers.get("department", ""), "").strip().upper()
        
        if not s_id:
            errors.append("student_id is required")
        if not name:
            errors.append("name is required")
        if not dept:
            errors.append("department is required")
            
        def parse_float_val(col_key, default_val, min_v=0.0, max_v=100.0):
            orig_col = normalized_headers.get(col_key)
            if not orig_col or not row.get(orig_col):
                return default_val
            try:
                v = float(row[orig_col].strip())
                if v < min_v or v > max_v:
                    errors.append(f"{col_key} must be between {min_v} and {max_v}")
                    return default_val
                return v
            except ValueError:
                errors.append(f"Invalid numeric value for {col_key}: '{row[orig_col]}'")
                return default_val

        att = parse_float_val("attendance", 75.0)
        mks = parse_float_val("marks", 65.0)
        asg = parse_float_val("assignment_completion", 70.0)
        prev = parse_float_val("previous_performance", 65.0)
        part = parse_float_val("participation", 60.0)
        
        year_str = row.get(normalized_headers.get("year", ""), "1").strip()
        year = 1
        if year_str.isdigit():
            year = max(1, min(5, int(year_str)))
            
        sem_str = row.get(normalized_headers.get("semester", ""), "1").strip()
        sem = 1
        if sem_str.isdigit():
            sem = max(1, min(10, int(sem_str)))
            
        backlogs_str = row.get(normalized_headers.get("backlogs", ""), "0").strip()
        backlogs = 0
        if backlogs_str.isdigit():
            backlogs = max(0, int(backlogs_str))
            
        study_hours = parse_float_val("study_hours", 15.0, min_v=0.0, max_v=100.0)
        email_val = row.get(normalized_headers.get("email", ""), "").strip() or None

        if errors:
            row_errors.append(CSVRowError(row_index=idx, student_id=s_id or None, errors=errors))
            continue
            
        # Check if student exists
        student = db.query(Student).filter(Student.student_id == s_id.upper()).first()
        if student:
            # Update existing
            student.name = name
            student.email = email_val
            student.department = dept
            student.year = year
            student.semester = sem
            student.attendance = att
            student.marks = mks
            student.assignment_completion = asg
            student.previous_performance = prev
            student.participation = part
            student.backlogs = backlogs
            student.study_hours = study_hours
        else:
            student = Student(
                student_id=s_id.upper(),
                name=name,
                email=email_val,
                department=dept,
                year=year,
                semester=sem,
                attendance=att,
                marks=mks,
                assignment_completion=asg,
                previous_performance=prev,
                participation=part,
                backlogs=backlogs,
                study_hours=study_hours
            )
            db.add(student)
            
        db.commit()
        db.refresh(student)
        
        # Run prediction
        run_prediction_for_student(db, student, current_user)
        db.refresh(student)
        imported_students.append(format_student_response(student))

    return CSVImportResult(
        total_rows=len(imported_students) + len(row_errors),
        successful_imports=len(imported_students),
        failed_rows=len(row_errors),
        errors=row_errors,
        imported_students=imported_students
    )

@router.get("/export/csv")
def export_students_csv(
    department: Optional[str] = None,
    risk_level: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Student)
    if department and department.upper() != "ALL":
        query = query.filter(Student.department == department.upper())
        
    students = query.all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Student ID", "Name", "Email", "Department", "Year", "Semester",
        "Attendance (%)", "Marks (%)", "Assignment Completion (%)",
        "Previous Performance (%)", "Participation (%)", "Backlogs",
        "Study Hours", "Risk Level", "Risk Score", "Explanation"
    ])
    
    for s in students:
        p_lvl = "LOW"
        p_score = 0.0
        p_exp = ""
        if s.predictions:
            p = s.predictions[0]
            p_lvl = p.risk_level
            p_score = p.risk_score
            p_exp = p.explanation
            
        if risk_level and risk_level.upper() != "ALL" and p_lvl.upper() != risk_level.upper():
            continue
            
        writer.writerow([
            s.student_id, s.name, s.email or "", s.department, s.year, s.semester,
            s.attendance, s.marks, s.assignment_completion,
            s.previous_performance, s.participation, s.backlogs,
            s.study_hours, p_lvl, p_score, p_exp
        ])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=students_risk_report.csv"}
    )
