# SmartDrop AI - Smart Student Dropout Risk Predictor

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.4+-F7931E.svg?logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![SHAP](https://img.shields.io/badge/SHAP-Explainable_AI-blueviolet.svg)](https://shap.readthedocs.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.0+-4169E1.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

A full-stack, institutional AI early-warning web application designed for colleges and universities to detect students at **LOW, MEDIUM, or HIGH risk of dropping out**. 

The system leverages a **Random Forest Classifier**, **SHAP (SHapley Additive exPlanations)** for Explainable AI, a **Rule-Based Intervention Recommendation Engine**, and an interactive institutional analytics dashboard.

---

## 1. System Architecture

```text
                                USER / FACULTY / ADMIN
                                          │
                                          ▼
                      ┌───────────────────────────────────────┐
                      │    React + TypeScript Frontend        │
                      │  (Vite, Tailwind CSS, Recharts, Lucide)│
                      └───────────────────┬───────────────────┘
                                          │ Axios (JWT Auth)
                                          ▼
                      ┌───────────────────────────────────────┐
                      │        FastAPI REST Backend           │
                      │ (Pydantic v2, SQLAlchemy, JWT Security)│
                      └───────────────────┬───────────────────┘
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            ▼                             ▼                             ▼
  ┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
  │   ML Engine      │          │   SHAP Engine    │          │  Intervention    │
  │  (Random Forest  │          │ (TreeExplainer & │          │  Recommendation  │
  │   Classifier)    │          │  Feature Impact) │          │  Engine (Rules)  │
  └─────────┬────────┘          └─────────┬────────┘          └─────────┬────────┘
            │                             │                             │
            └─────────────────────────────┼─────────────────────────────┘
                                          ▼
                      ┌───────────────────────────────────────┐
                      │   PostgreSQL / Supabase / SQLite DB   │
                      │  (Users, Students, Predictions, etc.) │
                      └───────────────────────────────────────┘
```

---

## 2. Key Features

1. **AI Dropout Risk Prediction**:
   - Classifies risk into **LOW (≤30%)**, **MEDIUM (31–70%)**, and **HIGH (71–100%)** tiers with continuous probability scores.
   - Evaluates attendance, exam marks, assignment completion, past semester performance, participation, active backlogs, and study hours.
2. **Explainable AI (SHAP TreeExplainer)**:
   - Visualizes top contributing risk drivers and protective factors with magnitude bars (High/Medium/Low Impact).
   - Generates natural language clinical explanations strictly grounded on calculated SHAP feature attributions.
3. **Automated Intervention Recommendation Engine**:
   - Auto-generates targeted interventions (attendance counseling, peer tutoring, remedial batches, parent conferences, mentor reviews) mapped to risk severity.
4. **Institutional Analytics Dashboard**:
   - Live KPI cards, Donut risk breakdown, Department-wise comparative bar charts (CSE, ECE, AIDS, EEE, MECH, CIVIL), timeline risk trends, and correlation scatter plots.
5. **Student Management & Batch CSV Import**:
   - Complete CRUD directory with search, multi-criteria filters, CSV upload with row-by-row error validation reporting, and CSV export.
6. **ML Diagnostics & Evaluation Metrics**:
   - Real-time display of Accuracy, Precision, Recall, F1 Score, and 3x3 Test Set Confusion Matrix.
7. **Prediction Audit Log & History**:
   - Immutable audit trail of every historical assessment with full input snapshots and explanation drawers.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Modern Glassmorphism & Micro-animations
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Routing & Forms**: React Router v6, Axios

### Backend & Machine Learning
- **Framework**: FastAPI, Python 3.10+
- **ORM & Validation**: SQLAlchemy 2.0, Pydantic v2
- **Authentication**: JWT (JSON Web Tokens) & PBKDF2/Bcrypt Security
- **Machine Learning**: Scikit-learn (Random Forest Classifier), Joblib
- **Explainable AI**: SHAP (TreeExplainer)
- **Data Manipulation**: NumPy, Pandas

### Database
- **Primary**: PostgreSQL / Supabase PostgreSQL (SQLAlchemy dialect)
- **Local Fallback**: SQLite (`smartdrop.db`)

---

## 4. Project Folder Structure

```text
NerualX/
├── backend/
│   ├── app/
│   │   ├── api/             # REST Endpoints (auth, students, predictions, interventions, analytics)
│   │   ├── core/            # Config, Security, JWT Dependencies
│   │   ├── db/              # Database Engine, Session, SQLAlchemy Models
│   │   ├── ml/              # Training Pipeline, Inference, SHAP Explanations, Scaler
│   │   │   └── model/       # Saved Model Artifacts (.pkl, metadata.json)
│   │   ├── schemas/         # Pydantic v2 Request/Response Schemas
│   │   ├── services/        # Prediction, Recommendation & Analytics Services
│   │   └── main.py          # FastAPI Application Entrypoint
│   ├── seed.py              # Demo Cohort Seeding Script (120+ students)
│   ├── test_integration.py  # End-to-End System Test Suite
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # UI, Modals, SHAP Charts, Risk Badges
│   │   ├── context/         # AuthContext with 1-click Demo Logins
│   │   ├── layouts/         # Responsive Sidebar & Topbar Layout
│   │   ├── pages/           # Dashboard, Students, Profile, Prediction, Analytics, Interventions, History
│   │   ├── services/        # Axios API Client & Endpoints
│   │   ├── types/           # TypeScript Type Definitions
│   │   ├── App.tsx          # React Router Configuration
│   │   └── index.css        # Tailwind & Glassmorphism Styles
│   ├── package.json
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml       # Orchestrates PostgreSQL + Backend + Frontend
├── .env.example
└── README.md
```

---

## 5. Quickstart & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment (optional)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train ML model & generate artifacts
python -m app.ml.train

# Seed demo dataset (Admin, Faculty, and 120 synthetic students)
python seed.py

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
Backend API will be live at `http://localhost:8000`.
Interactive Swagger API documentation: `http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend UI will be live at `http://localhost:5173`.

---

## 6. Demo Credentials

The platform comes pre-seeded with two demo accounts with 1-click quick login buttons on the login page:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@smartdrop.edu` | `admin123` | Full access: CRUD students, delete, edit settings, manage all interventions |
| **Faculty Member** | `faculty@smartdrop.edu` | `faculty123` | Student counseling, running AI predictions, assigning & updating interventions |

---

## 7. API Reference

### Authentication
- `POST /api/auth/login`: Authenticate with email & password, returns JWT token.
- `POST /api/auth/register`: Register new faculty/admin account.
- `GET /api/auth/me`: Retrieve current logged-in user profile.

### Students
- `GET /api/students`: List students with search, filters (department, year, risk level), and pagination.
- `POST /api/students`: Enroll new student and automatically run initial ML prediction.
- `GET /api/students/{id}`: Retrieve single student details and latest risk assessment.
- `PUT /api/students/{id}`: Update student academic records and re-evaluate risk.
- `DELETE /api/students/{id}`: Delete student (Admin only).
- `POST /api/students/import`: Multipart CSV batch upload with row-by-row validation reporting.
- `GET /api/students/export/csv`: Export student cohort with risk assessments as downloadable CSV.

### Predictions & Explainable AI
- `POST /api/predictions/predict`: Execute real-time Random Forest risk prediction + SHAP feature attributions + grounded narrative explanation.
- `GET /api/predictions`: Paginated audit log of historical risk assessments.
- `GET /api/predictions/{id}`: Detailed audit record with full SHAP breakdown.
- `GET /api/predictions/student/{student_id}`: Timeline of all historical assessments for a student.

### Interventions
- `GET /api/interventions`: List interventions filtered by status (`Pending`, `In Progress`, `Completed`) and priority.
- `POST /api/interventions`: Assign new intervention.
- `PUT /api/interventions/{id}`: Update intervention status, notes, or assigned faculty.
- `DELETE /api/interventions/{id}`: Remove intervention.

### Analytics & Diagnostics
- `GET /api/analytics/overview`: Top-level summary KPIs (total students, risk counts, average attendance/marks).
- `GET /api/analytics/risk-distribution`: Low/Medium/High risk counts and percentages.
- `GET /api/analytics/department-risk`: Grouped risk counts across departments.
- `GET /api/analytics/risk-trend`: Chronological assessment timeline.
- `GET /api/analytics/scatter`: Attendance vs Marks vs Risk scatter coordinates.
- `GET /api/analytics/model-performance`: Real calculated ML evaluation metrics, F1 score, and 3x3 confusion matrix.

---

## 8. Docker Deployment

To launch the complete production-ready stack with PostgreSQL, FastAPI backend, and Nginx-served React frontend:

```bash
# From the project root directory:
docker-compose up --build -d
```

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **PostgreSQL**: `localhost:5432`

---

## 9. Cloud Deployment

- **Frontend**: Configured for instant deployment to **Vercel** (`vercel deploy`). Set `VITE_API_URL` environment variable to your backend domain.
- **Backend**: Ready for **Render**, **Railway**, or **AWS ECS** using the provided `Dockerfile`. Set `DATABASE_URL` to your PostgreSQL / Supabase connection string.
- **Database**: Direct compatibility with **Supabase PostgreSQL** via `DATABASE_URL=postgresql://...`.


in Local Host :

Cd frontend , npm run dev
cd backend , python -m uvicorn app.main:app --reload --port 8000

Demo Accounts :

Admin: admin@smartdrop.edu / admin123 
Faculty: faculty@smartdrop.edu / faculty123 