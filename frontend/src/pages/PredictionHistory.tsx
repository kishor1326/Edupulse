import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  Sparkles,
  Calendar,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { SHAPFactorChart } from '../components/predictions/SHAPFactorChart';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { predictionService } from '../services/predictions';
import { PredictionHistoryRecord } from '../types';

export const PredictionHistory: React.FC = () => {
  const [predictions, setPredictions] = useState<PredictionHistoryRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedDetail, setSelectedDetail] = useState<PredictionHistoryRecord | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await predictionService.getPredictionHistory({
        search: search.trim() || undefined,
        risk_level: selectedRisk !== 'ALL' ? selectedRisk : undefined,
        page,
        limit,
      });
      setPredictions(res.predictions);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to fetch prediction history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, selectedRisk]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Prediction Audit Log & Assessment History
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-mono font-bold">
              {total} Logged Audits
            </span>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400 font-medium">
            Complete institutional audit trail of machine learning risk evaluations, SHAP factors, and predictions
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <form onSubmit={handleSearch} className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name or institutional ID..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
            />
          </form>

          <div className="sm:col-span-4">
            <select
              value={selectedRisk}
              onChange={(e) => {
                setSelectedRisk(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk Alert</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton rows={6} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/70 text-slate-400 uppercase font-bold tracking-wider border-b border-white/10">
                <tr>
                  <th className="px-6 py-3.5">Prediction ID</th>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Risk Level</th>
                  <th className="px-6 py-3.5">Score</th>
                  <th className="px-6 py-3.5">Assessed On</th>
                  <th className="px-6 py-3.5">Evaluator</th>
                  <th className="px-6 py-3.5 text-right">Audit Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] font-medium text-slate-300">
                {predictions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      No prediction logs found matching criteria.
                    </td>
                  </tr>
                ) : (
                  predictions.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedDetail(p)}
                      className="hover:bg-white/[0.03] cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-slate-400 font-bold">#{p.id}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-white block hover:text-emerald-400 transition-colors">{p.student_name}</span>
                        <span className="font-mono text-[11px] text-slate-400">{p.student_id_code}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/10 text-slate-300 font-bold text-[10px]">
                          {p.department}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <RiskBadge level={p.risk_level} showIcon={false} size="sm" />
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-white">
                        {p.risk_score.toFixed(0)}%
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(p.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-mono text-[11px]">{p.predicted_by}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDetail(p);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-emerald-400 border border-white/10 transition-all inline-flex items-center gap-1.5 text-[11px] font-bold shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Explain</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 bg-slate-900/40">
          <div>
            Showing <span className="font-semibold text-white">{predictions.length}</span> of{' '}
            <span className="font-semibold text-white">{total}</span> total assessments
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono px-2 font-bold text-white">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Audit Drawer/Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-slate-900/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Assessment Audit Record #{selectedDetail.id}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Model: RandomForest • SHAP TreeExplainer
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Header Info */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <div>
                  <h3 className="text-base font-extrabold text-white tracking-tight">{selectedDetail.student_name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ID: <span className="font-mono text-emerald-400 font-bold">{selectedDetail.student_id_code}</span> • Dept: {selectedDetail.department}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    Evaluated {new Date(selectedDetail.created_at).toLocaleString()} by {selectedDetail.predicted_by}
                  </p>
                </div>
                <RiskBadge level={selectedDetail.risk_level} score={selectedDetail.risk_score} size="lg" />
              </div>

              {/* Grounded Explanation */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-400 tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Generated Clinical Explanation</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {selectedDetail.explanation}
                </div>
              </div>

              {/* SHAP Factor Chart */}
              <div className="space-y-2">
                <SHAPFactorChart factors={selectedDetail.risk_factors} />
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Recommended Action Plan
                </h4>
                <div className="space-y-2">
                  {selectedDetail.recommendations.map((rec, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300">
                      <strong className="text-emerald-400">[{rec.priority}] </strong>
                      <span className="font-medium text-slate-200">{rec.recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 flex justify-between items-center bg-slate-900/80">
              <Link
                to={`/students/${selectedDetail.student_id_code}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span>Go to Full Student Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-white transition-all shadow-sm"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
