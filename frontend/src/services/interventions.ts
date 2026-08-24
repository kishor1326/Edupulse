import { api } from './api';
import { Intervention } from '../types';

export interface InterventionListResponse {
  total: number;
  pending_count: number;
  in_progress_count: number;
  completed_count: number;
  interventions: Intervention[];
}

export const interventionService = {
  async getInterventions(params: {
    status?: string;
    priority?: string;
    search?: string;
    student_id?: number;
  } = {}): Promise<InterventionListResponse> {
    const res = await api.get<InterventionListResponse>('/interventions', { params });
    return res.data;
  },

  async createIntervention(data: Partial<Intervention>): Promise<Intervention> {
    const res = await api.post<Intervention>('/interventions', data);
    return res.data;
  },

  async updateIntervention(id: number, data: Partial<Intervention>): Promise<Intervention> {
    const res = await api.put<Intervention>(`/interventions/${id}`, data);
    return res.data;
  },

  async deleteIntervention(id: number): Promise<void> {
    await api.delete(`/interventions/${id}`);
  }
};
