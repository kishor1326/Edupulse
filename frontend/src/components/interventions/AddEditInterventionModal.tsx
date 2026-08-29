import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';
import { Intervention } from '../../types';
import { interventionService } from '../../services/interventions';

interface AddEditInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (inter: Intervention) => void;
  initialData?: Intervention | null;
  studentId?: number;
}

export const AddEditInterventionModal: React.FC<AddEditInterventionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  studentId,
}) => {
  const [formData, setFormData] = useState({
    student_id: studentId || 1,
    recommendation: '',
    priority: 'High' as 'Critical' | 'High' | 'Medium' | 'Low',
    status: 'Pending' as 'Pending' | 'In Progress' | 'Completed',
    assigned_faculty: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        student_id: initialData.student_id,
        recommendation: initialData.recommendation,
        priority: initialData.priority,
        status: initialData.status,
        assigned_faculty: initialData.assigned_faculty || '',
        notes: initialData.notes || '',
      });
    } else if (studentId) {
      setFormData((prev) => ({
        ...prev,
        student_id: studentId,
        recommendation: '',
        priority: 'High',
        status: 'Pending',
        assigned_faculty: '',
        notes: '',
      }));
    }
    setError(null);
  }, [initialData, studentId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (initialData) {
        const updated = await interventionService.updateIntervention(initialData.id, formData);
        onSuccess(updated);
      } else {
        const created = await interventionService.createIntervention(formData);
        onSuccess(created);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save intervention.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {initialData ? 'Update Academic Intervention' : 'Assign Faculty Intervention'}
              </h2>
              <p className="text-xs text-slate-400">Targeted support and mentoring plan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Intervention Action / Recommendation *
            </label>
            <textarea
              required
              rows={3}
              value={formData.recommendation}
              onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
              placeholder="e.g. Mandatory remedial tutorial classes & weekly mentoring check-in"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-all leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-all"
              >
                <option value="Critical">Critical (Immediate)</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">Execution Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-all"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">Assigned Faculty / Mentor</label>
            <input
              type="text"
              value={formData.assigned_faculty}
              onChange={(e) => setFormData({ ...formData, assigned_faculty: e.target.value })}
              placeholder="e.g. Prof. Sharma / Dr. Rostova"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">Action Notes / Feedback</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Conducted first counseling session on Thursday. Student committed to extra lab."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Actions */}
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
              <span>{loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Intervention'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
