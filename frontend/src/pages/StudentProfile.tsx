import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  GraduationCap,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  Clock,
  AlertTriangle,
  Plus,
  RefreshCw,
  Edit2,
  CheckCircle2,
  Activity,
  ShieldAlert,
  User
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { SHAPFactorChart } from '../components/predictions/SHAPFactorChart';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { AddEditStudentModal } from '../components/students/AddEditStudentModal';
import { AddEditInterventionModal } from '../components/interventions/AddEditInterventionModal';
import { studentService } from '../services/students';
import { predictionService } from '../services/predictions';
import { interventionService } from '../services/interventions';
import { Student, PredictionHistoryRecord, Intervention } from '../types';

export const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [history, setHistory] = useState<PredictionHistoryRecord[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  // Modals
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [editingIntervention, setEditingIntervention] = useState<Intervention | null>(null);

  const loadStudentData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const studentData = await studentService.getStudent(id);
      setStudent(studentData);

      const [historyData, interventionsData] = await Promise.all([
        predictionService.getStudentPredictions(studentData.student_id),
        interventionService.getInterventions({ student_id: studentData.id }),
      ]);

      setHistory(historyData);
      setInterventions(interventionsData.interventions);
    } catch (err) {
      console.error('Failed to load student profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [id]);

  const handleReevaluate = async () => {
    if (!student) return;
    setEvaluating(true);
    try {
      await predictionService.predictRisk({
        student_id: student.student_id,
        attendance: student.attendance,
        marks: student.marks,
        assignment_completion: student.assignment_completion,
        previous_performance: student.previous_performance,
        participation: student.participation,
        backlogs: student.backlogs,
        study_hours: student.study_hours,
        save_to_db: true,
      });
      await loadStudentData();
    } catch (err) {
      alert('Failed to re-evaluate risk.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleUpdateInterventionStatus = async (interId: number, status: 'Pending' | 'In Progress' | 'Completed') => {
    try {
      await interventionService.updateIntervention(interId, { status });
      loadStudentData();
    } catch (err) {
      alert('Failed to update intervention status.');
    }
  };

  if (loading || !student) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  const latestPred = history[0] || null;
  const riskLevel = latestPred?.risk_level || student.latest_prediction?.risk_level || 'LOW';
  const riskScore = latestPred?.risk_score ?? student.latest_prediction?.risk_score ?? 20;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate('/students')}
            className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-emerald-500/30 text-slate-300 transition-all shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{student.name}</h1>
              <span className="font-mono text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                {student.student_id}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
              Department of {student.department} • Year {student.year} (Semester {student.semester})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditStudentOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 text-xs font-bold transition-all shadow-sm"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Details</span>
          </button>
          <button
            onClick={handleReevaluate}
            disabled={evaluating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
            <span>{evaluating ? 'Evaluating Model...' : 'Re-evaluate Risk'}</span>
          </button>
        </div>
      </div>

      {/* Main Risk Indicator & Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large AI Risk Gauge Card */}
        <div
          className={`glass-panel p-6 sm:p-7 rounded-3xl border flex flex-col justify-between relative overflow-hidden shadow-xl ${
            riskLevel === 'HIGH'
              ? 'border-rose-500/30 bg-gradient-to-b from-rose-950/40 via-slate-900/80 to-[#0b1326]'
              : riskLevel === 'MEDIUM'
              ? 'border-amber-500/30 bg-gradient-to-b from-amber-950/40 via-slate-900/80 to-[#0b1326]'
              : 'border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 via-slate-900/80 to-[#0b1326]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                AI Dropout Risk Index
              </span>
              <RiskBadge level={riskLevel} size="md" />
            </div>

            <div className="mt-6 text-center">
              <div className="relative inline-flex items-center justify-center">
                <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white">
                  {riskScore.toFixed(0)}%
                </div>
              </div>
              <p className="mt-2 text-xs font-bold text-slate-200 uppercase tracking-wide">
                Dropout Vulnerability Probability
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Scale: 0-30% Stable • 31-70% Moderate • 71-100% Critical
              </p>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium">Cohort Stability Status</span>
              <span className="font-mono font-bold text-white">
                {riskLevel === 'HIGH' ? 'Immediate Action Required' : riskLevel === 'MEDIUM' ? 'Needs Active Mentoring' : 'Optimal Standing'}
              </span>
            </div>
            <div className="w-full bg-slate-950/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  riskLevel === 'HIGH'
                    ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                    : riskLevel === 'MEDIUM'
                    ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                }`}
                style={{ width: `${riskScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Academic & Engagement Metrics Card */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-xl">
          <h2 className="text-base font-bold text-white mb-4 tracking-tight">Academic & Behavioral Metrics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance</p>
              <p
                className={`mt-1 text-2xl font-black font-mono ${
                  student.attendance < 65 ? 'text-rose-400' : student.attendance < 75 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {student.attendance}%
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Min 75% required</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Marks</p>
              <p
                className={`mt-1 text-2xl font-black font-mono ${
                  student.marks < 50 ? 'text-rose-400' : student.marks < 65 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {student.marks}%
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Semester avg</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assignments</p>
              <p className="mt-1 text-2xl font-black font-mono text-slate-200">
                {student.assignment_completion}%
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Submission rate</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prior Score</p>
              <p className="mt-1 text-2xl font-black font-mono text-slate-200">
                {student.previous_performance}%
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Past semester</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Participation</p>
              <p className="mt-1 text-2xl font-black font-mono text-slate-200">
                {student.participation}%
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Class & Labs</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Backlogs</p>
              <p className={`mt-1 text-2xl font-black font-mono ${student.backlogs > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                {student.backlogs}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Pending papers</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 col-span-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekly Study Hours</p>
              <p className="mt-1 text-2xl font-black font-mono text-teal-400">
                {student.study_hours} hrs/week
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Self study & homework</p>
            </div>
          </div>
        </div>
      </div>

      {/* SHAP Explainable AI Breakdown & Grounded Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <SHAPFactorChart factors={latestPred?.risk_factors || []} />
        </div>

        {/* Narrative Explanation Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white tracking-tight">AI Clinical Explanation</h3>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {latestPred?.explanation || 'No assessment generated yet. Click Re-evaluate Risk above.'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 font-medium">
            <span className="font-semibold text-slate-300">Safety Policy: </span>
            Predictions represent automated early-warning guidance. Academic mentorship decisions remain under institutional authority.
          </div>
        </div>
      </div>

      {/* Active Interventions for this student */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Active Academic Interventions</h2>
              <p className="text-xs text-slate-400">Targeted faculty actions and counseling programs for this student</p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingIntervention(null);
              setIsInterventionModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Assign Intervention</span>
          </button>
        </div>

        {interventions.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No active interventions assigned yet for this student.
          </p>
        ) : (
          <div className="space-y-3">
            {interventions.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/10 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.priority === 'Critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : item.priority === 'High'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-700/40 text-slate-300'
                      }`}
                    >
                      {item.priority} Priority
                    </span>
                    <span className="text-xs text-slate-400">
                      Assigned to: <strong className="text-white">{item.assigned_faculty || 'Faculty Mentor'}</strong>
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white">{item.recommendation}</p>
                  {item.notes && <p className="text-xs text-slate-400 italic mt-1">"{item.notes}"</p>}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <select
                    value={item.status}
                    onChange={(e) => handleUpdateInterventionStatus(item.id, e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prediction History Timeline */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-white tracking-tight">Historical Risk Assessments Log</h2>
        <div className="space-y-3">
          {history.map((record) => (
            <div
              key={record.id}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/10 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <RiskBadge level={record.risk_level} score={record.risk_score} size="sm" />
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(record.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-1">{record.explanation}</p>
              </div>
              <span className="text-xs text-slate-400 self-end sm:self-center font-mono">
                Evaluator: {record.predicted_by}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AddEditStudentModal
        isOpen={isEditStudentOpen}
        onClose={() => setIsEditStudentOpen(false)}
        onSuccess={() => loadStudentData()}
        initialData={student}
      />

      <AddEditInterventionModal
        isOpen={isInterventionModalOpen}
        onClose={() => {
          setIsInterventionModalOpen(false);
          setEditingIntervention(null);
        }}
        onSuccess={() => loadStudentData()}
        studentId={student.id}
        initialData={editingIntervention}
      />
    </div>
  );
};
