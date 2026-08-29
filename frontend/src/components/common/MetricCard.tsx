import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  variant?: 'default' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'cyan';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}) => {
  const variantConfig = {
    default: {
      bg: 'from-slate-900/80 via-slate-900/60 to-slate-950/90',
      border: 'border-white/10 hover:border-slate-500/40',
      iconBg: 'bg-slate-800/80 text-slate-200 border-white/10',
      glow: '',
      accent: 'text-slate-200',
    },
    emerald: {
      bg: 'from-emerald-950/30 via-slate-900/70 to-slate-950/90',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      glow: 'hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.18)]',
      accent: 'text-emerald-400',
    },
    amber: {
      bg: 'from-amber-950/30 via-slate-900/70 to-slate-950/90',
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      glow: 'hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.18)]',
      accent: 'text-amber-400',
    },
    rose: {
      bg: 'from-rose-950/30 via-slate-900/70 to-slate-950/90',
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      glow: 'hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.18)]',
      accent: 'text-rose-400',
    },
    indigo: {
      bg: 'from-indigo-950/30 via-slate-900/70 to-slate-950/90',
      border: 'border-indigo-500/20 hover:border-indigo-500/40',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      glow: 'hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.18)]',
      accent: 'text-indigo-400',
    },
    cyan: {
      bg: 'from-teal-950/30 via-slate-900/70 to-slate-950/90',
      border: 'border-teal-500/20 hover:border-teal-500/40',
      iconBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
      glow: 'hover:shadow-[0_0_30px_-5px_rgba(20,184,166,0.18)]',
      accent: 'text-teal-400',
    },
  }[variant];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-b ${variantConfig.bg} p-5 border ${variantConfig.border} backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${variantConfig.glow} group`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-3xl font-extrabold tracking-tight text-white font-mono">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1.5 pt-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  trend.isPositive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div className={`rounded-xl p-3 border shadow-inner transition-transform group-hover:scale-110 duration-200 ${variantConfig.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};
