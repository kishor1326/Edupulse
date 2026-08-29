import sys
from fastapi.testclient import TestClient
from app.main import app

def test_full_system_workflow():
    client = TestClient(app)
    
    print("==================================================")
    print("  RUNNING SMARTDROP AI AUTOMATED SYSTEM TEST SUITE ")
    print("==================================================")

    # 1. Health Check
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] 1. Health Check Endpoint Healthy")

    # 2. Auth Login (Admin & Faculty)
    login_res = client.post("/api/auth/login", json={
        "email": "admin@smartdrop.edu",
        "password": "admin123"
    })
    assert login_res.status_code == 200, f"Admin login failed: {login_res.text}"
    admin_token = login_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("[PASS] 2. Admin Authentication & JWT Generation Successful")

    # 3. Student Creation & Initial Prediction Run
    student_payload = {
        "student_id": "STUTEST99",
        "name": "Arunodhayan Krishnan",
        "email": "arunodhayan.k@college.edu",
        "department": "CSE",
        "year": 3,
        "semester": 6,
        "attendance": 48.5,
        "marks": 42.0,
        "assignment_completion": 45.0,
        "previous_performance": 50.0,
        "participation": 35.0,
        "backlogs": 3,
        "study_hours": 6.0
    }
    
    # Check if student exists or create
    del_res = client.delete("/api/students/STUTEST99", headers=admin_headers)
    stu_res = client.post("/api/students", json=student_payload, headers=admin_headers)
    assert stu_res.status_code == 201, f"Student creation failed: {stu_res.text}"
    student_data = stu_res.json()
    assert student_data["student_id"] == "STUTEST99"
    assert student_data["latest_prediction"] is not None
    assert student_data["latest_prediction"]["risk_level"] in ["HIGH", "MEDIUM"]
    print(f"[PASS] 3. Student Enrollment & Automatic ML Prediction: Risk={student_data['latest_prediction']['risk_level']} (Score={student_data['latest_prediction']['risk_score']}%)")

    # 4. Ad-hoc Risk Prediction with SHAP & Grounded Explanation
    pred_res = client.post("/api/predictions/predict", json={
        "student_id": "STUTEST99",
        "attendance": 42.0,
        "marks": 38.0,
        "assignment_completion": 40.0,
        "previous_performance": 45.0,
        "participation": 30.0,
        "backlogs": 4,
        "study_hours": 5.0,
        "save_to_db": True
    }, headers=admin_headers)
    assert pred_res.status_code == 200, f"Prediction failed: {pred_res.text}"
    pred_data = pred_res.json()
    assert pred_data["risk_level"] == "HIGH"
    assert len(pred_data["top_risk_factors"]) > 0
    assert len(pred_data["explanation"]) > 10
    assert len(pred_data["recommendations"]) > 0
    print(f"[PASS] 4. ML Inference & SHAP Explainability Engine:")
    print(f"       • Risk Level: {pred_data['risk_level']} ({pred_data['risk_score']}%)")
    print(f"       • Top Factor: {pred_data['top_risk_factors'][0]['feature_label']} ({pred_data['top_risk_factors'][0]['impact_magnitude']})")
    print(f"       • Grounded Explanation: {pred_data['explanation']}")
    print(f"       • Primary Recommendation: {pred_data['recommendations'][0]['recommendation']}")

    # 5. Interventions Lifecycle
    inter_res = client.get("/api/interventions", headers=admin_headers)
    assert inter_res.status_code == 200
    inter_list = inter_res.json()["interventions"]
    assert len(inter_list) > 0
    test_inter = inter_list[0]
    
    # Update intervention status
    upd_res = client.put(f"/api/interventions/{test_inter['id']}", json={
        "status": "In Progress",
        "notes": "Student attended first remedial session on Friday."
    }, headers=admin_headers)
    assert upd_res.status_code == 200
    assert upd_res.json()["status"] == "In Progress"
    print(f"[PASS] 5. Faculty Intervention Workflow & Status Transitions (ID #{test_inter['id']} -> In Progress)")

    # 6. Institutional Analytics Overview & Charts
    analytics_overview = client.get("/api/analytics/overview", headers=admin_headers)
    assert analytics_overview.status_code == 200
    stats = analytics_overview.json()
    assert stats["total_students"] > 0
    assert stats["average_attendance"] > 0
    print(f"[PASS] 6. Institutional Analytics Overview:")
    print(f"       • Total Students: {stats['total_students']}")
    print(f"       • Low/Med/High Risk: {stats['low_risk_count']}/{stats['medium_risk_count']}/{stats['high_risk_count']}")
    print(f"       • Avg Attendance: {stats['average_attendance']}%, Avg Marks: {stats['average_marks']}%")

    # 7. Model Performance Metrics (Calculated)
    model_perf = client.get("/api/analytics/model-performance", headers=admin_headers)
    assert model_perf.status_code == 200
    perf = model_perf.json()
    assert perf["accuracy"] > 0.70
    assert len(perf["confusion_matrix"]) == 3
    print(f"[PASS] 7. ML Model Validation Diagnostics:")
    print(f"       • Accuracy: {perf['accuracy'] * 100:.2f}%")
    print(f"       • F1 Score: {perf['f1_score'] * 100:.2f}%")
    print(f"       • Confusion Matrix Classes: {perf['classes']}")

    # 8. CSV Export
    csv_res = client.get("/api/students/export/csv", headers=admin_headers)
    assert csv_res.status_code == 200
    assert "Student ID,Name" in csv_res.text
    print(f"[PASS] 8. CSV Cohort Export Stream Validated")

    print("\n==================================================")
    print("  ALL FULL-STACK SYSTEM TESTS PASSED SUCCESSFULLY! ")
    print("==================================================")

if __name__ == "__main__":
    test_full_system_workflow()
