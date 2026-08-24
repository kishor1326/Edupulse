import { api } from './api';
import { PredictionResult, PredictionHistoryRecord } from '../types';

export interface PredictInput {
  student_id?: string;
  name?: string;
  department?: string;
  attendance: number;
  marks: number;
  assignment_completion: number;
  previous_performance: number;
  participation: number;
  backlogs?: number;
  study_hours?: number;
  save_to_db?: boolean;
}

export interface PredictionHistoryResponse {
  total: number;
  page: number;
  limit: number;
  predictions: PredictionHistoryRecord[];
}

export const predictionService = {
  async predictRisk(data: PredictInput): Promise<PredictionResult> {
    const res = await api.post<PredictionResult>('/predictions/predict', data);
    return res.data;
  },

  async getPredictionHistory(params: { search?: string; risk_level?: string; page?: number; limit?: number } = {}): Promise<PredictionHistoryResponse> {
    const res = await api.get<PredictionHistoryResponse>('/predictions', { params });
    return res.data;
  },

  async getPredictionDetail(id: number): Promise<PredictionHistoryRecord> {
    const res = await api.get<PredictionHistoryRecord>(`/predictions/${id}`);
    return res.data;
  },

  async getStudentPredictions(studentId: string | number): Promise<PredictionHistoryRecord[]> {
    const res = await api.get<PredictionHistoryRecord[]>(`/predictions/student/${studentId}`);
    return res.data;
  }
};
