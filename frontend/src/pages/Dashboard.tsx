import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  ClipboardList,
  Sparkles,
  Search,
  ArrowRight,
  RefreshCw,
  Eye,
  Plus,
  Activity,
  ChevronRight
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { MetricCard } from '../components/common/MetricCard';
import { RiskBadge } from '../components/common/RiskBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { AddEditInterventionModal } from '../components/interventions/AddEditInterventionModal';
import { analyticsService } from '../services/analytics';
import { studentService } from '../services/students';
import {
  OverviewStats,
  RiskDistributionItem,
  DepartmentRiskItem,
  RiskTrendItem,
  Student
} from '../types';

export const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [riskDist, setRiskDist] = useState<RiskDistributionItem[]>([]);
  const [deptRisk, setDeptRisk] = useState<DepartmentRiskItem[]>([]);
  const [riskTrend, setRiskTrend] = useState<RiskTrendItem[]>([]);
  const [highRiskStudents, setHighRiskStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudentForIntervention, setSelectedStudentForIntervention] = useState<number | null>(null);
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);

  const navigate = useNavigate();

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [stats, dist, depts, trend, studentsRes] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getRiskDistribution(),
        analyticsService.getDepartmentRisk(),
        analyticsService.getRiskTrend(),
        studentService.getStudents({ risk_level: 'HIGH', limit: 20 }),
      ]);

      setOverview(stats);
      setRiskDist(dist);
      setDeptRisk(depts);
      setRiskTrend(trend);
      setHighRiskStudents(studentsRes.students);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const filteredHighRisk = highRiskStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
  );

  const RISK_COLORS: Record<string, string> = {
    LOW: '#10B981',
    MEDIUM: '#F59E0B',
    HIGH: '#F43F5E',
  };

  if (loading && !overview) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Institutional Intelligence Radar
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live AI Metrics
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-400 font-medium">
            Real-time dropout vulnerability signals, cohort trajectories & early-warning action triggers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            title="Refresh database metrics"
            className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-emerald-500/30 text-slate-300 transition-all shadow-sm group"
          >
            <RefreshCw className={`w-4 h-4 transition-transform group-hover:rotate-180 duration-500 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
          <Link
            to="/prediction"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>AI Risk Sandbox</span>
          </Link>
        </div>
      </div>

      {/* Top Level KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Enrolled"
          value={overview?.total_students.toLocaleString() || '0'}
          subtitle={`Avg Marks: ${overview?.average_marks || 0}%`}
          icon={Users}
          variant="default"
        />
        <MetricCard
          title="Low Risk Cohort"
          value={overview?.low_risk_count.toLocaleString() || '0'}
          subtitle="Stable academic track"
          icon={ShieldCheck}
          variant="emerald"
        />
        <MetricCard
          title="Medium Risk"
          value={overview?.medium_risk_count.toLocaleString() || '0'}
          subtitle="Monitoring required"
          icon={AlertCircle}
          variant="amber"
        />
        <MetricCard
          title="High Risk Critical"
          value={overview?.high_risk_count.toLocaleString() || '0'}
          subtitle={`${overview?.high_risk_percentage || 0}% of student body`}
          icon={AlertTriangle}
          variant="rose"
        />
        <MetricCard
          title="Active Interventions"
          value={overview?.interventions_needed_count.toLocaleString() || '0'}
          subtitle={`Resolved: ${overview?.interventions_completed_count || 0}`}
          icon={ClipboardList}
          variant="cyan"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Donut */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-white/15 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Risk Distribution</h2>
                <p className="text-xs text-slate-400">Institutional Vulnerability Ratio</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/5">
                {overview?.total_students} Students
              </span>
            </div>
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDist}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={96}
                    paddingAngle={5}
                    cornerRadius={4}
                  >
                    {riskDist.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={RISK_COLORS[entry.name] || '#64748B'}
                        stroke="#0B1326"
                        strokeWidth={3}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">High Risk</span>
                <span className="text-2xl font-mono font-extrabold text-rose-400">
                  {overview?.high_risk_percentage || 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-white/10 text-center">
            {riskDist.map((item) => (
              <div key={item.name} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: RISK_COLORS[item.name] }}
                  />
                  <span className="text-[11px] font-bold text-slate-300">{item.name}</span>
                </div>
                <p className="text-base font-extrabold font-mono text-white">{item.value}</p>
                <p className="text-[10px] text-slate-400 font-mono font-medium">{item.percentage}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Department-wise Risk Breakdown */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 hover:border-white/15 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Department-Wise Risk Stratification</h2>
              <p className="text-xs text-slate-400">Comparative breakdown across academic faculties</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Live DB Aggregation
            </span>
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
                <Bar dataKey="low_risk" name="Low Risk" fill="#10B981" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="medium_risk" name="Medium Risk" fill="#F59E0B" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="high_risk" name="High Risk" fill="#F43F5E" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Chart: Risk Trend Area Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-white/15 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Prediction Timeline & Risk Trajectory</h2>
            <p className="text-xs text-slate-400">Institutional temporal vulnerability metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Continuous Model Evaluation
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={riskTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="lowRiskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="highRiskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickLine={false} />
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
              <Area type="monotone" dataKey="low" name="Low Risk" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#lowRiskGrad)" />
              <Area type="monotone" dataKey="medium" name="Medium Risk" stroke="#F59E0B" strokeWidth={2} fillOpacity={0} />
              <Area type="monotone" dataKey="high" name="High Risk Alert" stroke="#F43F5E" strokeWidth={3} fillOpacity={1} fill="url(#highRiskGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* High-Risk Students Alert Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Critical Priority: High-Risk Students</h2>
              <p className="text-xs text-slate-400">
                Undergraduates flagged for immediate academic support or faculty advising
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by name, ID or dept..."
                className="pl-9 pr-3.5 py-2 rounded-xl bg-slate-950/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-56 sm:w-64 transition-all"
              />
            </div>
            <Link
              to="/students?risk_level=HIGH"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/70 text-slate-400 uppercase font-bold tracking-wider border-b border-white/10">
              <tr>
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Attendance</th>
                <th className="px-6 py-3.5">Marks</th>
                <th className="px-6 py-3.5">Risk Status</th>
                <th className="px-6 py-3.5">Risk Score</th>
                <th className="px-6 py-3.5 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] font-medium text-slate-300">
              {filteredHighRisk.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No high-risk students found matching the query.
                  </td>
                </tr>
              ) : (
                filteredHighRisk.slice(0, 8).map((student) => {
                  const pred = student.latest_prediction;
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center font-bold text-rose-400 font-mono text-xs">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <Link
                              to={`/students/${student.student_id}`}
                              className="font-bold text-white hover:text-emerald-400 transition-colors"
                            >
                              {student.name}
                            </Link>
                            <p className="text-[11px] font-mono text-slate-400">{student.student_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-slate-300 font-bold text-[11px]">
                          {student.department} (Yr {student.year})
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono">
                        <span className={`px-2 py-0.5 rounded ${student.attendance < 65 ? 'bg-rose-500/10 text-rose-400 font-bold' : 'text-slate-300'}`}>
                          {student.attendance}%
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono">
                        <span className={`px-2 py-0.5 rounded ${student.marks < 55 ? 'bg-rose-500/10 text-rose-400 font-bold' : 'text-slate-300'}`}>
                          {student.marks}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <RiskBadge level={pred?.risk_level || 'HIGH'} showIcon={false} size="sm" />
                      </td>
                      <td className="px-6 py-4 font-mono font-extrabold text-rose-400">
                        {pred?.risk_score ? `${pred.risk_score.toFixed(0)}%` : '85%'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedStudentForIntervention(student.id);
                              setIsInterventionModalOpen(true);
                            }}
                            title="Assign Intervention"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-all font-semibold text-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Intervene</span>
                          </button>
                          <Link
                            to={`/students/${student.student_id}`}
                            title="View Full Student Profile"
                            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 transition-all inline-flex items-center"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for quick intervention assignment */}
      <AddEditInterventionModal
        isOpen={isInterventionModalOpen}
        onClose={() => {
          setIsInterventionModalOpen(false);
          setSelectedStudentForIntervention(null);
        }}
        onSuccess={() => {
          loadDashboardData();
        }}
        studentId={selectedStudentForIntervention || undefined}
      />
    </div>
  );
};
