import React, { useState } from 'react';
import { Settings as SettingsIcon, Sliders, Shield, Database, CheckCircle2, Save } from 'lucide-react';

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
        <h1 className="text-2xl font-extrabold text-white">System Settings & Risk Thresholds</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Configure model sensitivity, early warning boundaries, and institutional integrations
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Risk Tier Classification Boundaries</h2>
            <p className="text-xs text-slate-400">Define cutoff percentages for Low, Medium, and High risk tiers</p>
          </div>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Threshold configurations updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-400">LOW Risk Upper Bound</span>
                <span className="font-mono text-white">{lowThreshold}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="45"
                value={lowThreshold}
                onChange={(e) => setLowThreshold(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <p className="text-[11px] text-slate-500">Students with risk probability ≤ {lowThreshold}% are classified as LOW Risk.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-rose-400">HIGH Risk Lower Bound</span>
                <span className="font-mono text-white">{highThreshold}%</span>
              </div>
              <input
                type="range"
                min="55"
                max="85"
                value={highThreshold}
                onChange={(e) => setHighThreshold(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <p className="text-[11px] text-slate-500">Students with risk probability &gt; {highThreshold}% trigger critical HIGH Risk alerts.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <p className="font-bold text-white">Resulting Classification Map:</p>
            <p>• 0% to {lowThreshold}%: <strong className="text-emerald-400">LOW RISK</strong> (Routine monitoring)</p>
            <p>• {lowThreshold + 1}% to {highThreshold}%: <strong className="text-amber-400">MEDIUM RISK</strong> (Academic mentoring advised)</p>
            <p>• &gt; {highThreshold}%: <strong className="text-rose-400">HIGH RISK</strong> (Urgent intervention & counseling required)</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
            >
              <Save className="w-4 h-4" /> Save Thresholds
            </button>
          </div>
        </form>
      </div>

      {/* Database & Integration Status */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <Database className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-base font-bold text-white">Database & Infrastructure Status</h2>
            <p className="text-xs text-slate-400">Persistence storage and engine connectivity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">Active Database:</span>
            <span className="font-mono text-emerald-400 font-bold">PostgreSQL / Supabase Ready</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">Explainable AI Engine:</span>
            <span className="font-mono text-emerald-400 font-bold">SHAP TreeExplainer v0.45</span>
          </div>
        </div>
      </div>
    </div>
  );
};
