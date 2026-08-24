import { api } from './api';
import {
  OverviewStats,
  RiskDistributionItem,
  DepartmentRiskItem,
  RiskTrendItem,
  ScatterPoint,
  ModelPerformance
} from '../types';

export const analyticsService = {
  async getOverview(): Promise<OverviewStats> {
    const res = await api.get<OverviewStats>('/analytics/overview');
    return res.data;
  },

  async getRiskDistribution(): Promise<RiskDistributionItem[]> {
    const res = await api.get<RiskDistributionItem[]>('/analytics/risk-distribution');
    return res.data;
  },

  async getDepartmentRisk(): Promise<DepartmentRiskItem[]> {
    const res = await api.get<DepartmentRiskItem[]>('/analytics/department-risk');
    return res.data;
  },

  async getRiskTrend(): Promise<RiskTrendItem[]> {
    const res = await api.get<RiskTrendItem[]>('/analytics/risk-trend');
    return res.data;
  },

  async getScatter(): Promise<ScatterPoint[]> {
    const res = await api.get<ScatterPoint[]>('/analytics/scatter');
    return res.data;
  },

  async getModelPerformance(): Promise<ModelPerformance> {
    const res = await api.get<ModelPerformance>('/analytics/model-performance');
    return res.data;
  }
};
