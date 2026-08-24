from typing import Dict, Any, List

def generate_recommendations(
    features: Dict[str, float],
    risk_level: str,
    risk_score: float,
    top_factors: List[Dict[str, Any]]
) -> List[Dict[str, str]]:
    """
    Generates rule-based and context-aware academic intervention recommendations
    tailored to student's specific warning indicators and risk level.
    """
    recommendations = []
    
    attendance = features.get("attendance", 100.0)
    marks = features.get("marks", 100.0)
    assignment_completion = features.get("assignment_completion", 100.0)
    previous_performance = features.get("previous_performance", 100.0)
    participation = features.get("participation", 100.0)
    backlogs = features.get("backlogs", 0.0)
    study_hours = features.get("study_hours", 20.0)
    
    # 1. Attendance Specific Interventions
    if attendance < 60.0:
        recommendations.append({
            "recommendation": "Mandatory attendance counseling & formal parent/guardian conference.",
            "priority": "Critical" if risk_level == "HIGH" else "High",
            "category": "Attendance"
        })
        recommendations.append({
            "recommendation": "Bi-weekly biometric/class attendance check-in with department coordinator.",
            "priority": "High",
            "category": "Attendance"
        })
    elif attendance < 75.0:
        recommendations.append({
            "recommendation": "Attendance counseling and faculty mentor follow-up.",
            "priority": "Medium",
            "category": "Attendance"
        })
        
    # 2. Academic Performance & Marks Interventions
    if marks < 50.0 or backlogs >= 2:
        recommendations.append({
            "recommendation": "Enroll in remedial tutorial batches and assign dedicated faculty mentor.",
            "priority": "Critical" if risk_level == "HIGH" else "High",
            "category": "Academic"
        })
        recommendations.append({
            "recommendation": "Customized exam preparation plan and weekly practice test reviews.",
            "priority": "High",
            "category": "Academic"
        })
    elif marks < 65.0 or backlogs == 1:
        recommendations.append({
            "recommendation": "Peer tutoring support in core problem subjects.",
            "priority": "Medium",
            "category": "Academic"
        })
        
    # 3. Assignment Completion Interventions
    if assignment_completion < 60.0:
        recommendations.append({
            "recommendation": "Assignment deadline monitoring and weekly milestone submissions.",
            "priority": "High",
            "category": "Academic"
        })
    elif assignment_completion < 75.0:
        recommendations.append({
            "recommendation": "Course TA check-in on lab exercises and weekly assignments.",
            "priority": "Medium",
            "category": "Academic"
        })

    # 4. Engagement & Participation Interventions
    if participation < 50.0:
        recommendations.append({
            "recommendation": "Encourage participation through interactive lab assignments and group study circles.",
            "priority": "Medium",
            "category": "Engagement"
        })
        
    # 5. Study Habit & High Risk Compound Rule
    if study_hours < 8.0:
        recommendations.append({
            "recommendation": "Study skills workshop & structured weekly study timetable creation.",
            "priority": "Low" if risk_level == "LOW" else "Medium",
            "category": "Academic"
        })
        
    if risk_level == "HIGH" and len(recommendations) < 3:
        recommendations.append({
            "recommendation": "Comprehensive multi-stakeholder academic review (HOD, Mentor, Counselor).",
            "priority": "Critical",
            "category": "Faculty Follow-up"
        })
        
    # Default protective recommendation for low risk
    if not recommendations and risk_level == "LOW":
        recommendations.append({
            "recommendation": "Maintain consistent study schedule and explore honors/advanced elective projects.",
            "priority": "Low",
            "category": "Engagement"
        })

    return recommendations
