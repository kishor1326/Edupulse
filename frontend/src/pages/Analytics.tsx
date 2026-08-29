import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Layers,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Activity,
  Target
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { MetricCard } from '../components/common/MetricCard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { analyticsService } from '../services/analytics';
import {
  OverviewStats,
  RiskDistributionItem,
  DepartmentRiskItem,
  RiskTrendItem,
  ScatterPoint,
  ModelPerformance
} from '../types';

export const Analytics: React.FC = () => {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [riskDist, setRiskDist] = useState<RiskDistributionItem[]>([]);
  const [deptRisk, setDeptRisk] = useState<DepartmentRiskItem[]>([]);
  const [riskTrend, setRiskTrend] = useState<RiskTrendItem[]>([]);
  const [scatterData, setScatterData] = useState<ScatterPoint[]>([]);
  const [modelPerf, setModelPerf] = useState<ModelPerformance | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stats, dist, depts, trend, scatter, model] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getRiskDistribution(),
        analyticsService.getDepartmentRisk(),
        analyticsService.getRiskTrend(),
        analyticsService.getScatter(),
        analyticsService.getModelPerformance(),
      ]);

      setOverview(stats);
      setRiskDist(dist);
      setDeptRisk(depts);
      setRiskTrend(trend);
      setScatterData(scatter);
      setModelPerf(model);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const RISK_COLORS: Record<string, string> = {
    LOW: '#10B981',
    MEDIUM: '#F59E0B',
    HIGH: '#F43F5E',
  };

  if (loading && !overview) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Institutional Analytics & ML Diagnostics
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <Activity className="w-3.5 h-3.5" />
              Real-time DB
            </span>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400 font-medium">
            Deep aggregate cohorts, behavioral cross-correlations, and model evaluation metrics
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/30 text-slate-300 text-xs font-bold self-start sm:self-auto transition-all shadow-sm group"
        >
          <RefreshCw className={`w-3.5 h-3.5 transition-transform group-hover:rotate-180 duration-500 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Top 5 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Student Body"
          value={overview?.total_students.toLocaleString() || '0'}
          icon={Layers}
          variant="default"
        />
        <MetricCard
          title="Campus Avg Attendance"
          value={`${overview?.average_attendance || 0}%`}
          icon={TrendingUp}
          variant="emerald"
        />
        <MetricCard
          title="Campus Avg Marks"
          value={`${overview?.average_marks || 0}%`}
          icon={Award}
          variant="indigo"
        />
        <MetricCard
          title="High Risk Proportion"
          value={`${overview?.high_risk_percentage || 0}%`}
          subtitle={`${overview?.high_risk_count || 0} students flagged`}
          icon={AlertTriangle}
          variant="rose"
        />
        <MetricCard
          title="Intervention Resolution"
          value={`${overview?.intervention_completion_rate || 0}%`}
          subtitle={`${overview?.interventions_completed_count || 0} resolved`}
          icon={CheckCircle2}
          variant="cyan"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance vs Marks vs Risk Scatter */}
        <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-xl hover:border-white/15 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Attendance vs Marks vs Dropout Risk</h2>
              <p className="text-xs text-slate-400">Correlation cluster of student performance & risk tier</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  type="number"
                  dataKey="attendance"
                  name="Attendance"
                  unit="%"
                  domain={[0, 100]}
                  stroke="#64748B"
                  fontSize={12}
                />
                <YAxis
                  type="number"
                  dataKey="marks"
                  name="Marks"
                  unit="%"
                  domain={[0, 100]}
                  stroke="#64748B"
                  fontSize={12}
                />
                <ZAxis type="number" dataKey="risk_score" range={[50, 220]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3.5 rounded-xl bg-slate-900/95 border border-white/10 text-xs text-white shadow-2xl backdrop-blur-xl">
                          <p className="font-bold text-emerald-400">{data.name} ({data.student_id})</p>
                          <p className="text-slate-300 mt-1">Dept: {data.department}</p>
                          <p className="text-slate-300">Attendance: {data.attendance}%</p>
                          <p className="text-slate-300">Marks: {data.marks}%</p>
                          <p className="font-bold mt-1.5 text-rose-400">Risk Score: {data.risk_score}% ({data.risk_level})</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Students" data={scatterData} fill="#10B981" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Comparison Bar Chart */}
        <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-xl hover:border-white/15 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Department Risk Stratification</h2>
              <p className="text-xs text-slate-400">Aggregated cohorts across all academic faculties</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptRisk} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="department" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="low_risk" name="Low Risk" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="medium_risk" name="Medium Risk" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="high_risk" name="High Risk" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ML Model Performance & Diagnostics Section */}
      {modelPerf && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Machine Learning Model Diagnostics & Validation</h2>
                <p className="text-xs text-slate-400 font-medium">
                  Validated metrics computed over test split ({modelPerf.test_samples} evaluation records)
                </p>
              </div>
            </div>

            <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 font-bold">
              Architecture: {modelPerf.model_name}
            </span>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Calculated Accuracy</p>
              <p className="mt-1.5 text-3xl font-black font-mono text-emerald-400">
                {(modelPerf.accuracy * 100).toFixed(1)}%
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Weighted Precision</p>
              <p className="mt-1.5 text-3xl font-black font-mono text-teal-400">
                {(modelPerf.precision * 100).toFixed(1)}%
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Weighted Recall</p>
              <p className="mt-1.5 text-3xl font-black font-mono text-cyan-400">
                {(modelPerf.recall * 100).toFixed(1)}%
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">F1 Score</p>
              <p className="mt-1.5 text-3xl font-black font-mono text-indigo-400">
                {(modelPerf.f1_score * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Confusion Matrix and Feature Importances */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Confusion Matrix */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Test Set Confusion Matrix (3x3 Classification)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs font-mono">
                  <thead>
                    <tr className="text-slate-400 border-b border-white/10">
                      <th className="p-2.5 text-left font-bold">Actual \ Pred</th>
                      <th className="p-2.5 text-emerald-400 font-bold">Pred: LOW</th>
                      <th className="p-2.5 text-amber-400 font-bold">Pred: MED</th>
                      <th className="p-2.5 text-rose-400 font-bold">Pred: HIGH</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {modelPerf.confusion_matrix.map((row, i) => (
                      <tr key={i}>
                        <td className="p-3 text-left font-bold text-slate-300">
                          Actual: {modelPerf.classes[i]}
                        </td>
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            className={`p-3 font-bold ${
                              i === j
                                ? 'bg-emerald-500/15 text-emerald-300 font-extrabold rounded-lg'
                                : 'text-slate-500'
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Global Feature Importances */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Global Random Forest Feature Importances (Gini)
              </h3>
              <div className="space-y-3">
                {modelPerf.feature_importances.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="font-mono font-bold text-emerald-400">{(item.importance * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden p-0.5 border border-white/5">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, item.importance * 100 * 2.5)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
