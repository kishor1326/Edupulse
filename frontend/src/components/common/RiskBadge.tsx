import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel | string;
  score?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  showIcon = true,
  size = 'md',
}) => {
  const normLevel = (level || 'LOW').toUpperCase() as RiskLevel;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] font-bold',
    md: 'px-2.5 py-1 text-xs font-bold tracking-wide',
    lg: 'px-3.5 py-1.5 text-sm font-extrabold tracking-wider',
  };

  const config = {
    LOW: {
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      dot: 'bg-emerald-400',
      icon: CheckCircle,
      glow: 'shadow-[0_0_12px_-2px_rgba(16,185,129,0.35)]',
    },
    MEDIUM: {
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      dot: 'bg-amber-400',
      icon: AlertCircle,
      glow: 'shadow-[0_0_12px_-2px_rgba(245,158,11,0.35)]',
    },
    HIGH: {
      bg: 'bg-rose-500/20 border-rose-500/40 text-rose-400',
      dot: 'bg-rose-400 animate-ping',
      icon: AlertTriangle,
      glow: 'shadow-[0_0_16px_-2px_rgba(244,63,94,0.45)]',
    },
  }[normLevel] || {
    bg: 'bg-slate-500/15 border-slate-500/30 text-slate-400',
    dot: 'bg-slate-400',
    icon: CheckCircle,
    glow: '',
  };

  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md ${config.bg} ${sizeClasses[size]} ${config.glow} transition-all select-none`}
    >
      <span className="relative flex h-2 w-2">
        {normLevel === 'HIGH' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}></span>
      </span>
      {showIcon && <IconComponent className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />}
      <span>{normLevel} RISK</span>
      {score !== undefined && (
        <span className="opacity-90 font-mono font-bold ml-0.5">({score.toFixed(0)}%)</span>
      )}
    </span>
  );
};
