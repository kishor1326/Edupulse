import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Send,
  UserCheck,
  RotateCcw
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white">AI Prediction Sandbox</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
              Random Forest + SHAP
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Interactive ML risk simulation & explainable AI diagnostic workbench
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-3">
          <select
            value={selectedStudentId}
            onChange={(e) => handleStudentSelect(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
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
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Input Parameters & Indicators</span>
            </div>
            <button
              type="button"
              onClick={() => handleStudentSelect('custom')}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          <form onSubmit={handleRunPrediction} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Student / Case Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
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
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Attendance Percentage</span>
                  <span className={`font-mono ${formData.attendance < 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
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
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Marks */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Current Exam Marks Score</span>
                  <span className={`font-mono ${formData.marks < 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
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
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Assignment completion */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Assignment Completion</span>
                  <span className="font-mono text-slate-200">{formData.assignment_completion}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.assignment_completion}
                  onChange={(e) => setFormData({ ...formData, assignment_completion: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Previous performance */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Previous Academic Performance</span>
                  <span className="font-mono text-slate-200">{formData.previous_performance}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.previous_performance}
                  onChange={(e) => setFormData({ ...formData, previous_performance: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Participation */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Classroom & Lab Participation</span>
                  <span className="font-mono text-slate-200">{formData.participation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.participation}
                  onChange={(e) => setFormData({ ...formData, participation: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Active Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.backlogs}
                    onChange={(e) => setFormData({ ...formData, backlogs: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Study Hours / Week</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="1"
                    value={formData.study_hours}
                    onChange={(e) => setFormData({ ...formData, study_hours: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
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
                className={`glass-panel p-6 rounded-3xl border ${
                  result.risk_level === 'HIGH'
                    ? 'border-rose-500/30 bg-gradient-to-b from-rose-950/40 to-slate-900'
                    : result.risk_level === 'MEDIUM'
                    ? 'border-amber-500/30 bg-gradient-to-b from-amber-950/40 to-slate-900'
                    : 'border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 to-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Dropout Risk Outcome
                  </span>
                  <RiskBadge level={result.risk_level} size="lg" />
                </div>

                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-5xl font-black font-mono text-white">
                    {result.risk_score.toFixed(0)}%
                  </span>
                  <span className="text-sm font-semibold text-slate-300">
                    Estimated Probability Score
                  </span>
                </div>

                <p className="mt-4 text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                  {result.explanation}
                </p>
              </div>

              {/* SHAP Feature Contribution Chart */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                <SHAPFactorChart factors={result.top_risk_factors} />
              </div>

              {/* Actionable Recommendations */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Recommended Faculty Interventions
                </h3>
                <div className="space-y-2">
                  {result.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200"
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
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Ready for AI Assessment</h3>
              <p className="mt-1.5 text-xs text-slate-400 max-w-sm">
                Adjust the candidate parameters on the left and click "Run Real-Time AI Prediction" to compute risk scores and SHAP feature attributions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
