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
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-bold tracking-wide',
    lg: 'px-3.5 py-1.5 text-sm font-extrabold tracking-wider',
  };

  const config = {
    LOW: {
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      icon: CheckCircle,
      glow: 'shadow-[0_0_12px_-3px_rgba(16,185,129,0.3)]',
    },
    MEDIUM: {
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      icon: AlertCircle,
      glow: 'shadow-[0_0_12px_-3px_rgba(245,158,11,0.3)]',
    },
    HIGH: {
      bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
      icon: AlertTriangle,
      glow: 'shadow-[0_0_15px_-2px_rgba(239,68,68,0.4)]',
    },
  }[normLevel] || {
    bg: 'bg-slate-500/15 border-slate-500/30 text-slate-400',
    icon: CheckCircle,
    glow: '',
  };

  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses[size]} ${config.glow} transition-all`}
    >
      {showIcon && <IconComponent className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{normLevel} RISK</span>
      {score !== undefined && (
        <span className="opacity-80 font-mono font-medium">({score.toFixed(0)}%)</span>
      )}
    </span>
  );
};
