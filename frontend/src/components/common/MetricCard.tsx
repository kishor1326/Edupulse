import React from 'react';
import { LucideIcon } from 'lucide-react';

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
  const variantStyles = {
    default: 'from-slate-800/80 to-slate-900/80 border-slate-700/50 text-slate-200 icon-bg:bg-slate-700/50 text-slate-400',
    emerald: 'from-emerald-950/40 to-slate-900/80 border-emerald-500/20 text-emerald-400 icon-bg:bg-emerald-500/10 text-emerald-400',
    amber: 'from-amber-950/40 to-slate-900/80 border-amber-500/20 text-amber-400 icon-bg:bg-amber-500/10 text-amber-400',
    rose: 'from-rose-950/40 to-slate-900/80 border-rose-500/20 text-rose-400 icon-bg:bg-rose-500/10 text-rose-400',
    indigo: 'from-indigo-950/40 to-slate-900/80 border-indigo-500/20 text-indigo-400 icon-bg:bg-indigo-500/10 text-indigo-400',
    cyan: 'from-cyan-950/40 to-slate-900/80 border-cyan-500/20 text-cyan-400 icon-bg:bg-cyan-500/10 text-cyan-400',
  }[variant];

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b ${variantStyles} p-5 border backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-white">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
          {trend && (
            <p className={`mt-2 text-xs font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend.value}
            </p>
          )}
        </div>
        <div className="rounded-xl bg-slate-800/80 p-3 border border-slate-700/50 shadow-inner">
          <Icon className="w-6 h-6 text-slate-200" />
        </div>
      </div>
    </div>
  );
};
