import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Sparkles, GraduationCap } from 'lucide-react';
import { Student } from '../../types';
import { studentService } from '../../services/students';

interface AddEditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (student: Student) => void;
  initialData?: Student | null;
}

const DEPARTMENTS = ['CSE', 'ECE', 'AIDS', 'EEE', 'MECH', 'CIVIL'];

export const AddEditStudentModal: React.FC<AddEditStudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    email: '',
    department: 'CSE',
    year: 1,
    semester: 1,
    attendance: 75,
    marks: 65,
    assignment_completion: 70,
    previous_performance: 65,
    participation: 60,
    backlogs: 0,
    study_hours: 15,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        student_id: initialData.student_id,
        name: initialData.name,
        email: initialData.email || '',
        department: initialData.department,
        year: initialData.year,
        semester: initialData.semester,
        attendance: initialData.attendance,
        marks: initialData.marks,
        assignment_completion: initialData.assignment_completion,
        previous_performance: initialData.previous_performance,
        participation: initialData.participation,
        backlogs: initialData.backlogs,
        study_hours: initialData.study_hours,
      });
    } else {
      setFormData({
        student_id: `STU${Math.floor(1000 + Math.random() * 9000)}`,
        name: '',
        email: '',
        department: 'CSE',
        year: 1,
        semester: 1,
        attendance: 75,
        marks: 65,
        assignment_completion: 70,
        previous_performance: 65,
        participation: 60,
        backlogs: 0,
        study_hours: 15,
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (initialData) {
        const updated = await studentService.updateStudent(initialData.id, formData);
        onSuccess(updated);
      } else {
        const created = await studentService.createStudent(formData);
        onSuccess(created);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save student details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {initialData ? `Edit Student: ${initialData.name}` : 'Enroll New Student'}
              </h2>
              <p className="text-xs text-slate-400">Academic parameters and baseline trajectory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              1. Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Student Institutional ID *
                </label>
                <input
                  type="text"
                  name="student_id"
                  required
                  value={formData.student_id}
                  onChange={handleChange}
                  disabled={!!initialData}
                  placeholder="e.g. STU1024"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Rohan Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="rohan.sharma@college.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Department *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-all"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Academic Year</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-all"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Semester</label>
                <input
                  type="number"
                  name="semester"
                  min={1}
                  max={8}
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Academic & Engagement Metrics */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              2. Academic & Engagement Indicators (0-100%)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  <span>Attendance Rate (%) *</span>
                  <span className="text-emerald-400 font-mono">{formData.attendance}%</span>
                </div>
                <input
                  type="number"
                  name="attendance"
                  min={0}
                  max={100}
                  step={0.1}
                  required
                  value={formData.attendance}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  <span>Current Marks Score (%) *</span>
                  <span className="text-emerald-400 font-mono">{formData.marks}%</span>
                </div>
                <input
                  type="number"
                  name="marks"
                  min={0}
                  max={100}
                  step={0.1}
                  required
                  value={formData.marks}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  <span>Assignment Completion (%) *</span>
                  <span className="text-emerald-400 font-mono">{formData.assignment_completion}%</span>
                </div>
                <input
                  type="number"
                  name="assignment_completion"
                  min={0}
                  max={100}
                  step={0.1}
                  required
                  value={formData.assignment_completion}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  <span>Previous Performance (%) *</span>
                  <span className="text-emerald-400 font-mono">{formData.previous_performance}%</span>
                </div>
                <input
                  type="number"
                  name="previous_performance"
                  min={0}
                  max={100}
                  step={0.1}
                  required
                  value={formData.previous_performance}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  <span>Classroom Participation (%) *</span>
                  <span className="text-emerald-400 font-mono">{formData.participation}%</span>
                </div>
                <input
                  type="number"
                  name="participation"
                  min={0}
                  max={100}
                  step={0.1}
                  required
                  value={formData.participation}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  <span>Active Backlogs</span>
                  <span className="text-amber-400 font-mono">{formData.backlogs}</span>
                </div>
                <input
                  type="number"
                  name="backlogs"
                  min={0}
                  max={15}
                  value={formData.backlogs}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  <span>Weekly Study Hours</span>
                  <span className="text-teal-400 font-mono">{formData.study_hours} hrs/wk</span>
                </div>
                <input
                  type="number"
                  name="study_hours"
                  min={0}
                  max={80}
                  step={0.5}
                  value={formData.study_hours}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Processing ML Prediction...' : initialData ? 'Update & Re-evaluate' : 'Save & Predict Risk'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
