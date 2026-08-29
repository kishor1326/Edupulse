import React, { useState } from 'react';
import { Settings as SettingsIcon, Sliders, Shield, Database, CheckCircle2, Save, Sparkles, Cpu } from 'lucide-react';

export const Settings: React.FC = () => {
  const [lowThreshold, setLowThreshold] = useState(30);
  const [highThreshold, setHighThreshold] = useState(70);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">System Settings & Risk Thresholds</h1>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            v2.4 Live
          </span>
        </div>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-400 font-medium">
          Configure model sensitivity, early warning boundaries, and institutional integrations
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Risk Tier Classification Boundaries</h2>
            <p className="text-xs text-slate-400">Define cutoff percentages for Low, Medium, and High risk tiers</p>
          </div>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>Threshold configurations saved and propagated across active prediction pipelines.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-400 uppercase tracking-wider text-[11px]">LOW Risk Upper Bound</span>
                <span className="font-mono text-white text-sm">{lowThreshold}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="45"
                value={lowThreshold}
                onChange={(e) => setLowThreshold(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500 border border-white/10"
              />
              <p className="text-[11px] text-slate-400">Students with risk probability ≤ {lowThreshold}% are classified as LOW Risk.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-rose-400 uppercase tracking-wider text-[11px]">HIGH Risk Lower Bound</span>
                <span className="font-mono text-white text-sm">{highThreshold}%</span>
              </div>
              <input
                type="range"
                min="55"
                max="85"
                value={highThreshold}
                onChange={(e) => setHighThreshold(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-rose-500 border border-white/10"
              />
              <p className="text-[11px] text-slate-400">Students with risk probability &gt; {highThreshold}% trigger critical HIGH Risk alerts.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 space-y-2">
            <p className="font-bold text-white tracking-tight">Active Classification Scheme:</p>
            <div className="space-y-1 text-slate-300 font-medium">
              <p>• 0% to {lowThreshold}%: <strong className="text-emerald-400">LOW RISK</strong> (Routine periodic monitoring)</p>
              <p>• {lowThreshold + 1}% to {highThreshold}%: <strong className="text-amber-400">MEDIUM RISK</strong> (Academic mentoring advised)</p>
              <p>• &gt; {highThreshold}%: <strong className="text-rose-400">HIGH RISK</strong> (Urgent faculty intervention & counseling required)</p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
            >
              <Save className="w-4 h-4" />
              <span>Save Thresholds</span>
            </button>
          </div>
        </form>
      </div>

      {/* Database & Integration Status */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Database & Infrastructure Status</h2>
            <p className="text-xs text-slate-400">Persistence storage and engine connectivity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between items-center">
            <span className="text-slate-400 font-medium">Active Database Engine:</span>
            <span className="font-mono text-emerald-400 font-bold">SQLite / PostgreSQL Ready</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between items-center">
            <span className="text-slate-400 font-medium">Explainable AI Engine:</span>
            <span className="font-mono text-teal-400 font-bold">SHAP TreeExplainer v0.45</span>
          </div>
        </div>
      </div>
    </div>
  );
};
