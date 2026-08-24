import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Sparkles } from 'lucide-react';
import { RiskFactor } from '../../types';

interface SHAPFactorChartProps {
  factors: RiskFactor[];
}

export const SHAPFactorChart: React.FC<SHAPFactorChartProps> = ({ factors }) => {
  if (!factors || factors.length === 0) {
    return <p className="text-sm text-slate-400">No feature impact data available.</p>;
  }

  // Find max absolute impact to normalize bar lengths
  const maxImpact = Math.max(...factors.map((f) => Math.abs(f.impact_value)), 0.01);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>SHAP Feature Attribution (Why is this student at risk?)</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">TreeExplainer v1.0</span>
      </div>

      <div className="space-y-3">
        {factors.map((factor, idx) => {
          const widthPct = Math.min(100, Math.max(8, (Math.abs(factor.impact_value) / maxImpact) * 100));
          const isRiskIncrease = factor.impact_direction === 'increases_risk';
          const isRiskDecrease = factor.impact_direction === 'decreases_risk';

          return (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 transition-all hover:border-slate-700/80"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">{factor.feature_label}</span>
                  <span className="text-slate-400 font-mono">
                    ({factor.feature_value}{factor.feature_name === 'backlogs' ? '' : factor.feature_name === 'study_hours' ? ' hrs' : '%'})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  {isRiskIncrease && (
                    <span className="inline-flex items-center text-rose-400 gap-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5" /> Increases Risk
                    </span>
                  )}
                  {isRiskDecrease && (
                    <span className="inline-flex items-center text-emerald-400 gap-0.5">
                      <ArrowDownRight className="w-3.5 h-3.5" /> Protective
                    </span>
                  )}
                  {!isRiskIncrease && !isRiskDecrease && (
                    <span className="inline-flex items-center text-slate-400 gap-0.5">
                      <Minus className="w-3.5 h-3.5" /> Neutral
                    </span>
                  )}
                  <span
                    className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                      factor.impact_magnitude === 'High Impact'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : factor.impact_magnitude === 'Medium Impact'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-700/40 text-slate-300'
                    }`}
                  >
                    {factor.impact_magnitude}
                  </span>
                </div>
              </div>

              {/* Impact Bar */}
              <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isRiskIncrease
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                      : isRiskDecrease
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500'
                      : 'bg-slate-600'
                  }`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
