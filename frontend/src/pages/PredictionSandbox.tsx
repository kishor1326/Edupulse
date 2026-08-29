import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Send,
  UserCheck,
  RotateCcw,
  Zap,
  Target
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { SHAPFactorChart } from '../components/predictions/SHAPFactorChart';
import { predictionService, PredictInput } from '../services/predictions';
import { studentService } from '../services/students';
import { Student, PredictionResult } from '../types';

export const PredictionSandbox: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('custom');

  const [formData, setFormData] = useState<PredictInput>({
    student_id: '',
    name: 'Hypothetical Candidate',
    department: 'CSE',
    attendance: 58.0,
    marks: 49.0,
    assignment_completion: 52.0,
    previous_performance: 45.0,
    participation: 60.0,
    backlogs: 2,
    study_hours: 8.0,
    save_to_db: false,
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load student list for quick selection
    studentService.getStudents({ limit: 100 }).then((res) => {
      setStudents(res.students);
    });
  }, []);

  const handleStudentSelect = (sId: string) => {
    setSelectedStudentId(sId);
    if (sId === 'custom') {
      setFormData({
        student_id: '',
        name: 'Hypothetical Candidate',
        department: 'CSE',
        attendance: 58.0,
        marks: 49.0,
        assignment_completion: 52.0,
        previous_performance: 45.0,
        participation: 60.0,
        backlogs: 2,
        study_hours: 8.0,
        save_to_db: false,
      });
      return;
    }

    const stu = students.find((s) => s.student_id === sId);
    if (stu) {
      setFormData({
        student_id: stu.student_id,
        name: stu.name,
        department: stu.department,
        attendance: stu.attendance,
        marks: stu.marks,
        assignment_completion: stu.assignment_completion,
        previous_performance: stu.previous_performance,
        participation: stu.participation,
        backlogs: stu.backlogs,
        study_hours: stu.study_hours,
        save_to_db: true,
      });
    }
  };

  const handleRunPrediction = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await predictionService.predictRisk(formData);
      setResult(res);
    } catch (err) {
      alert('Prediction request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Prediction Sandbox
            </h1>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <Sparkles className="w-3.5 h-3.5" />
              RF + SHAP Explainer
            </span>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400 font-medium">
            Interactive ML risk simulation & explainable AI diagnostic workbench
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-3">
          <select
            value={selectedStudentId}
            onChange={(e) => handleStudentSelect(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-emerald-500 transition-all shadow-md"
          >
            <option value="custom">⚡ Custom Hypothetical Input</option>
            <optgroup label="Select Existing Student">
              {students.map((s) => (
                <option key={s.student_id} value={s.student_id}>
                  {s.student_id} - {s.name} ({s.department})
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Grid: Inputs on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input sliders & parameters */}
        <div className="lg:col-span-6 glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
            <div className="flex items-center gap-2.5 text-sm font-bold text-white tracking-tight">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Sliders className="w-4 h-4" />
              </div>
              <span>Input Parameters & Academic Attributes</span>
            </div>
            <button
              type="button"
              onClick={() => handleStudentSelect('custom')}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          <form onSubmit={handleRunPrediction} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Student / Case Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 transition-all"
                >
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="AIDS">AIDS</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                </select>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4 pt-2">
              {/* Attendance */}
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-300">Attendance Percentage</span>
                  <span className={`font-mono font-bold ${formData.attendance < 65 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {formData.attendance}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.attendance}
                  onChange={(e) => setFormData({ ...formData, attendance: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* Marks */}
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-300">Exam Marks Score</span>
                  <span className={`font-mono font-bold ${formData.marks < 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {formData.marks}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* Assignment completion */}
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-300">Assignment Completion</span>
                  <span className="font-mono font-bold text-slate-200">{formData.assignment_completion}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.assignment_completion}
                  onChange={(e) => setFormData({ ...formData, assignment_completion: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* Previous performance */}
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-300">Previous Academic Performance</span>
                  <span className="font-mono font-bold text-slate-200">{formData.previous_performance}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.previous_performance}
                  onChange={(e) => setFormData({ ...formData, previous_performance: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* Participation */}
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-300">Classroom & Lab Participation</span>
                  <span className="font-mono font-bold text-slate-200">{formData.participation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.participation}
                  onChange={(e) => setFormData({ ...formData, participation: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Active Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.backlogs}
                    onChange={(e) => setFormData({ ...formData, backlogs: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Study Hours / Week</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="1"
                    value={formData.study_hours}
                    onChange={(e) => setFormData({ ...formData, study_hours: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>{loading ? 'Evaluating ML Model & SHAP Explainer...' : 'Run Real-Time AI Prediction'}</span>
            </button>
          </form>
        </div>

        {/* Right: Prediction Output & SHAP Analysis */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Risk Level Banner Card */}
              <div
                className={`glass-panel p-6 sm:p-7 rounded-3xl border shadow-xl ${
                  result.risk_level === 'HIGH'
                    ? 'border-rose-500/30 bg-gradient-to-b from-rose-950/40 via-slate-900/80 to-[#0b1326]'
                    : result.risk_level === 'MEDIUM'
                    ? 'border-amber-500/30 bg-gradient-to-b from-amber-950/40 via-slate-900/80 to-[#0b1326]'
                    : 'border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 via-slate-900/80 to-[#0b1326]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Dropout Risk Estimation
                  </span>
                  <RiskBadge level={result.risk_level} size="lg" />
                </div>

                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-5xl font-black font-mono text-white tracking-tight">
                    {result.risk_score.toFixed(0)}%
                  </span>
                  <span className="text-sm font-semibold text-slate-300">
                    Estimated Churn Probability
                  </span>
                </div>

                <p className="mt-4 text-xs sm:text-sm text-slate-200 leading-relaxed bg-black/30 p-4 rounded-2xl border border-white/10">
                  {result.explanation}
                </p>
              </div>

              {/* SHAP Feature Contribution Chart */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl">
                <SHAPFactorChart factors={result.top_risk_factors} />
              </div>

              {/* Actionable Recommendations */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3.5 shadow-xl">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Recommended Faculty Interventions
                  </h3>
                </div>
                <div className="space-y-2.5">
                  {result.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3 text-xs text-slate-200 hover:border-emerald-500/30 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white">[{rec.priority} Priority] </span>
                        <span>{rec.recommendation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center h-full min-h-[440px] shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">Ready for AI Assessment</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-sm font-medium">
                Adjust candidate parameters on the left or select an existing student to compute real-time dropout probabilities and SHAP feature attributions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
