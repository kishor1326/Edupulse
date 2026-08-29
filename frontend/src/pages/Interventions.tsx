import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { AddEditInterventionModal } from '../components/interventions/AddEditInterventionModal';
import { interventionService } from '../services/interventions';
import { Intervention } from '../types';

export const Interventions: React.FC = () => {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, in_progress: 0, completed: 0 });
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Intervention | null>(null);

  const fetchInterventions = async () => {
    setLoading(true);
    try {
      const res = await interventionService.getInterventions({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
        search: search.trim() || undefined,
      });

      setInterventions(res.interventions);
      setCounts({
        total: res.total,
        pending: res.pending_count,
        in_progress: res.in_progress_count,
        completed: res.completed_count,
      });
    } catch (err) {
      console.error('Failed to fetch interventions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInterventions();
  };

  const handleStatusChange = async (id: number, newStatus: 'Pending' | 'In Progress' | 'Completed') => {
    try {
      await interventionService.updateIntervention(id, { status: newStatus });
      fetchInterventions();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this intervention record?')) {
      try {
        await interventionService.deleteIntervention(id);
        fetchInterventions();
      } catch (err) {
        alert('Failed to delete intervention.');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Faculty Academic Interventions Hub
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold font-mono">
              {counts.total} Logged Programs
            </span>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400 font-medium">
            Track counseling assignments, mentoring check-ins, and student recovery progress
          </p>
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Intervention</span>
        </button>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Actions</p>
          <p className="mt-1 text-2xl font-black font-mono text-white">{counts.total}</p>
        </div>
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/30 transition-all">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Pending Action</p>
          <p className="mt-1 text-2xl font-black font-mono text-amber-400">{counts.pending}</p>
        </div>
        <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 hover:border-indigo-500/30 transition-all">
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">In Progress</p>
          <p className="mt-1 text-2xl font-black font-mono text-indigo-400">{counts.in_progress}</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/30 transition-all">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Completed / Resolved</p>
          <p className="mt-1 text-2xl font-black font-mono text-emerald-400">{counts.completed}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <form onSubmit={handleSearchSubmit} className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student, mentor, or action..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
            />
          </form>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interventions Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton rows={5} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/70 text-slate-400 uppercase font-bold tracking-wider border-b border-white/10">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Intervention Action</th>
                  <th className="px-6 py-3.5">Assigned Faculty</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] font-medium text-slate-300">
                {interventions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No interventions match the selected filters.
                    </td>
                  </tr>
                ) : (
                  interventions.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-6 py-4">
                        {item.student ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 font-mono text-xs">
                              {item.student.name.charAt(0)}
                            </div>
                            <div>
                              <Link
                                to={`/students/${item.student.student_id}`}
                                className="font-bold text-white hover:text-emerald-400 transition-colors"
                              >
                                {item.student.name}
                              </Link>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[10px] text-emerald-400">
                                  {item.student.student_id}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  ({item.student.department} • Att: {item.student.attendance}%)
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono">Student ID #{item.student_id}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.priority === 'Critical'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : item.priority === 'High'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : item.priority === 'Medium'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-slate-700/40 text-slate-300'
                          }`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-sm">
                        <p className="text-xs text-white font-semibold">{item.recommendation}</p>
                        {item.notes && <p className="text-[11px] text-slate-400 italic mt-0.5">"{item.notes}"</p>}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-200">
                        {item.assigned_faculty || <span className="text-slate-400 italic">Unassigned</span>}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as any)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold focus:outline-none border transition-all ${
                            item.status === 'Completed'
                              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400'
                              : item.status === 'In Progress'
                              ? 'bg-indigo-950/50 border-indigo-500/40 text-indigo-300'
                              : 'bg-amber-950/50 border-amber-500/40 text-amber-400'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setIsModalOpen(true);
                            }}
                            title="Edit notes / details"
                            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            title="Delete"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AddEditInterventionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSuccess={() => fetchInterventions()}
        initialData={editingItem}
      />
    </div>
  );
};
