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
  Plus
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
  LineChart,
  Line
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
    HIGH: '#EF4444',
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Institutional Risk Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              Live AI Data
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Real-time dropout vulnerability radar & active academic warning index
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            title="Refresh database values"
            className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-slate-700 text-slate-300 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
          <Link
            to="/prediction"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Risk Assessment</span>
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
          title="Low Risk"
          value={overview?.low_risk_count.toLocaleString() || '0'}
          subtitle="Stable academic standing"
          icon={ShieldCheck}
          variant="emerald"
        />
        <MetricCard
          title="Medium Risk"
          value={overview?.medium_risk_count.toLocaleString() || '0'}
          subtitle="Needs monitoring"
          icon={AlertCircle}
          variant="amber"
        />
        <MetricCard
          title="High Risk Alert"
          value={overview?.high_risk_count.toLocaleString() || '0'}
          subtitle={`${overview?.high_risk_percentage || 0}% of student body`}
          icon={AlertTriangle}
          variant="rose"
        />
        <MetricCard
          title="Need Intervention"
          value={overview?.interventions_needed_count.toLocaleString() || '0'}
          subtitle={`Completed: ${overview?.interventions_completed_count || 0}`}
          icon={ClipboardList}
          variant="indigo"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Donut */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Risk Distribution</h2>
              <span className="text-xs text-slate-400">Total: {overview?.total_students}</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDist}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                  >
                    {riskDist.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={RISK_COLORS[entry.name] || '#64748B'}
                        stroke="#0F172A"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800 text-center">
            {riskDist.map((item) => (
              <div key={item.name} className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: RISK_COLORS[item.name] }}
                  />
                  <span className="text-xs font-bold text-slate-300">{item.name}</span>
                </div>
                <p className="text-base font-extrabold text-white">{item.value}</p>
                <p className="text-[10px] text-slate-400 font-mono">{item.percentage}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Department-wise Risk Breakdown */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Department-Wise Risk Breakdown</h2>
              <p className="text-xs text-slate-400">Comparing Low, Medium, and High risk counts by department</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Live DB Aggregation
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptRisk} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="department" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="low_risk" name="Low Risk" fill="#10B981" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="medium_risk" name="Medium Risk" fill="#F59E0B" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="high_risk" name="High Risk" fill="#EF4444" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Chart: Risk Trend */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Prediction Timeline & Risk Trends</h2>
            <p className="text-xs text-slate-400">Chronological student risk assessments across campus</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={riskTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#F8FAFC',
                  fontSize: '12px',
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Line type="monotone" dataKey="low" name="Low Risk" stroke="#10B981" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="medium" name="Medium Risk" stroke="#F59E0B" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="high" name="High Risk Alert" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, fill: '#EF4444' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* High-Risk Students Alert Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Critical Priority: High-Risk Students</h2>
              <p className="text-xs text-slate-400">
                Students requiring prompt faculty intervention based on attendance & exam metrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search high risk students..."
                className="pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-52 sm:w-64"
              />
            </div>
            <Link
              to="/students?risk_level=HIGH"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Student ID</th>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Attendance</th>
                <th className="px-6 py-3.5">Marks</th>
                <th className="px-6 py-3.5">Risk Level</th>
                <th className="px-6 py-3.5">Risk Score</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {filteredHighRisk.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                    No high-risk students found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredHighRisk.slice(0, 10).map((student) => {
                  const pred = student.latest_prediction;
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-900/60 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-white">
                        {student.student_id}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/students/${student.student_id}`}
                          className="font-bold text-white hover:text-emerald-400 transition-colors"
                        >
                          {student.name}
                        </Link>
                        <p className="text-[11px] text-slate-500">{student.email || 'No email'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[11px]">
                          {student.department} (Yr {student.year})
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono">
                        <span className={student.attendance < 60 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                          {student.attendance}%
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono">
                        <span className={student.marks < 50 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                          {student.marks}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <RiskBadge level={pred?.risk_level || 'HIGH'} showIcon={false} size="sm" />
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-rose-400">
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
                            className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 transition-all"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/students/${student.student_id}`}
                            title="View Full Risk Profile"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all inline-flex items-center"
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
