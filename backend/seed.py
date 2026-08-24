import random
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, init_db
from app.db.models import User, Student, Prediction, RiskFactor, Intervention
from app.core.security import get_password_hash
from app.services.prediction_service import run_prediction_for_student

DEPARTMENTS = ["CSE", "ECE", "AIDS", "EEE", "MECH", "CIVIL"]
FIRST_NAMES = [
    "Aarav", "Aditi", "Rohan", "Sneha", "Vikram", "Priya", "Rahul", "Ananya",
    "Karthik", "Divya", "Siddharth", "Pooja", "Arjun", "Meera", "Varun", "Neha",
    "Nikhil", "Ishaan", "Riya", "Akash", "Kavya", "Tanmay", "Shruti", "Manish",
    "Sanjay", "Deepak", "Swati", "Harish", "Gaurav", "Simran", "Rajesh", "Kiran"
]
LAST_NAMES = [
    "Sharma", "Patel", "Verma", "Reddy", "Nair", "Gupta", "Iyer", "Rao",
    "Singh", "Kumar", "Mehta", "Joshi", "Bose", "Menon", "Deshmukh", "Chopra"
]

def seed_demo_data(db: Session = None):
    should_close = False
    if db is None:
        init_db()
        db = SessionLocal()
        should_close = True
        
    try:
        # 1. Create Default Users if absent
        for admin_email in ["admin@edupulse.edu", "admin@smartdrop.edu"]:
            admin_user = db.query(User).filter(User.email == admin_email).first()
            if not admin_user:
                admin_user = User(
                    name="Dr. Elena Rostova (Admin)",
                    email=admin_email,
                    password_hash=get_password_hash("admin123"),
                    role="admin",
                    created_at=datetime.now(timezone.utc)
                )
                db.add(admin_user)
            
        for faculty_email in ["faculty@edupulse.edu", "faculty@smartdrop.edu"]:
            faculty_user = db.query(User).filter(User.email == faculty_email).first()
            if not faculty_user:
                faculty_user = User(
                    name="Prof. Arvind Sharma (Faculty)",
                    email=faculty_email,
                    password_hash=get_password_hash("faculty123"),
                    role="faculty",
                    created_at=datetime.now(timezone.utc)
                )
                db.add(faculty_user)
            
        db.commit()

        # 2. Check if students exist
        existing_student_count = db.query(Student).count()
        if existing_student_count >= 50:
            print(f"Database already contains {existing_student_count} students. Skipping demo seed.")
            return

        print("Seeding synthetic student cohort with realistic dropout risk distributions...")
        random.seed(42)

        # Generate a cohort of 120 students across various risk profiles
        # ~60% Low Risk, ~25% Medium Risk, ~15% High Risk
        profiles = [
            # High risk cohort (attendance < 60, low marks, backlogs)
            {"count": 22, "att_range": (35.0, 62.0), "mks_range": (28.0, 52.0), "asg_range": (30.0, 58.0), "prev_range": (30.0, 55.0), "backlog_range": (2, 5), "study_range": (3.0, 8.0)},
            # Medium risk cohort (attendance 65-75, borderline marks)
            {"count": 35, "att_range": (63.0, 78.0), "mks_range": (52.0, 68.0), "asg_range": (55.0, 75.0), "prev_range": (50.0, 70.0), "backlog_range": (0, 2), "study_range": (8.0, 16.0)},
            # Low risk cohort (high attendance, high marks)
            {"count": 63, "att_range": (78.0, 98.0), "mks_range": (70.0, 96.0), "asg_range": (75.0, 99.0), "prev_range": (72.0, 97.0), "backlog_range": (0, 0), "study_range": (14.0, 30.0)}
        ]

        stu_idx = 1001
        for p in profiles:
            for _ in range(p["count"]):
                first = random.choice(FIRST_NAMES)
                last = random.choice(LAST_NAMES)
                name = f"{first} {last}"
                dept = random.choice(DEPARTMENTS)
                year = random.randint(1, 4)
                sem = (year * 2) - random.randint(0, 1)
                s_id = f"STU{stu_idx}"
                stu_idx += 1
                
                att = round(random.uniform(*p["att_range"]), 1)
                mks = round(random.uniform(*p["mks_range"]), 1)
                asg = round(random.uniform(*p["asg_range"]), 1)
                prev = round(random.uniform(*p["prev_range"]), 1)
                part = round(min(100.0, max(10.0, att * 0.8 + random.uniform(-10, 10))), 1)
                backlogs = random.randint(*p["backlog_range"])
                study_hours = round(random.uniform(*p["study_range"]), 1)
                
                # Vary created date across last 14 days
                days_ago = random.randint(0, 14)
                created_date = datetime.now(timezone.utc) - timedelta(days=days_ago, hours=random.randint(1, 23))

                student = Student(
                    student_id=s_id,
                    name=name,
                    email=f"{first.lower()}.{last.lower()}{random.randint(10,99)}@college.edu",
                    department=dept,
                    year=year,
                    semester=sem,
                    attendance=att,
                    marks=mks,
                    assignment_completion=asg,
                    previous_performance=prev,
                    participation=part,
                    backlogs=backlogs,
                    study_hours=study_hours,
                    created_at=created_date,
                    updated_at=created_date
                )
                db.add(student)
                db.flush()
                
                # Run prediction
                run_prediction_for_student(db, student, faculty_user)

        db.commit()
        print(f"Successfully seeded {stu_idx - 1001} students with real ML predictions & interventions!")
        
    finally:
        if should_close:
            db.close()

if __name__ == "__main__":
    seed_demo_data()
