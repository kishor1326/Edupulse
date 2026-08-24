export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'faculty';
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Student {
  id: number;
  student_id: string;
  name: string;
  email?: string;
  department: string;
  year: number;
  semester: number;
  attendance: number;
  marks: number;
  assignment_completion: number;
  previous_performance: number;
  participation: number;
  backlogs: number;
  study_hours: number;
  created_at: string;
  updated_at?: string;
  latest_prediction?: {
    id: number;
    risk_level: RiskLevel;
    risk_probability: number;
    risk_score: number;
    explanation: string;
    created_at: string;
  };
}

export interface RiskFactor {
  feature_name: string;
  feature_label: string;
  feature_value: number;
  impact_value: number;
  impact_magnitude: 'High Impact' | 'Medium Impact' | 'Low Impact';
  impact_direction: 'increases_risk' | 'decreases_risk' | 'neutral';
}

export interface Recommendation {
  recommendation: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  category: string;
}

export interface PredictionResult {
  id?: number;
  student_id?: string;
  student_db_id?: number;
  student_name?: string;
  risk_level: RiskLevel;
  risk_probability: number;
  risk_score: number;
  top_risk_factors: RiskFactor[];
  explanation: string;
  recommendations: Recommendation[];
  created_at?: string;
}

export interface PredictionHistoryRecord {
  id: number;
  student_id_code: string;
  student_name: string;
  department: string;
  risk_level: RiskLevel;
  risk_probability: number;
  risk_score: number;
  explanation: string;
  predicted_by: string;
  created_at: string;
  risk_factors: RiskFactor[];
  recommendations: Recommendation[];
}

export interface Intervention {
  id: number;
  student_id: number;
  prediction_id?: number;
  recommendation: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  assigned_faculty?: string;
  notes?: string;
  due_date?: string;
  created_at: string;
  updated_at?: string;
  student?: {
    id: number;
    student_id: string;
    name: string;
    department: string;
    year: number;
    attendance: number;
    marks: number;
  };
}

export interface OverviewStats {
  total_students: number;
  low_risk_count: number;
  medium_risk_count: number;
  high_risk_count: number;
  interventions_needed_count: number;
  interventions_completed_count: number;
  average_attendance: number;
  average_marks: number;
  high_risk_percentage: number;
  intervention_completion_rate: number;
}

export interface RiskDistributionItem {
  name: RiskLevel;
  value: number;
  percentage: number;
  color: string;
}

export interface DepartmentRiskItem {
  department: string;
  total: number;
  low_risk: number;
  medium_risk: number;
  high_risk: number;
  avg_attendance: number;
  avg_marks: number;
}

export interface RiskTrendItem {
  date: string;
  low: number;
  medium: number;
  high: number;
  total_assessed: number;
}

export interface ScatterPoint {
  student_id: string;
  name: string;
  department: string;
  attendance: number;
  marks: number;
  risk_score: number;
  risk_level: RiskLevel;
}

export interface ModelPerformance {
  model_name: string;
  features: string[];
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: number[][];
  classes: string[];
  training_samples: number;
  test_samples: number;
  last_trained: string;
  feature_importances: {
    feature: string;
    label: string;
    importance: number;
  }[];
}
