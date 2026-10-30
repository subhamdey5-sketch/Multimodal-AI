import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: any;
  trend?: {
    value: string;
    positive: boolean;
  };
  color?: 'cyan' | 'indigo' | 'amber' | 'emerald';
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  color = 'cyan',
}) => {
  const colorMap = {
    cyan: {
      border: 'hover:border-cyan-500/40',
      badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      glow: 'shadow-cyan-500/5',
    },
    indigo: {
      border: 'hover:border-indigo-500/40',
      badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      glow: 'shadow-indigo-500/5',
    },
    amber: {
      border: 'hover:border-amber-500/40',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'shadow-amber-500/5',
    },
    emerald: {
      border: 'hover:border-emerald-500/40',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'shadow-emerald-500/5',
    },
  };

  const currentTheme = colorMap[color];

  return (
    <div
      className={`rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-xl transition-all duration-300 hover:bg-slate-900/80 hover:-translate-y-0.5 shadow-xl ${currentTheme.border} ${currentTheme.glow}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 tracking-wide uppercase font-mono">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${currentTheme.badge}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-2xl font-black tracking-tight text-white font-mono">
          {value}
        </h3>
        {trend && (
          <div
            className={`flex items-center text-xs font-medium font-mono ${
              trend.positive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {trend.positive ? (
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
            )}
            {trend.value}
          </div>
        )}
      </div>

      {subtext && (
        <p className="mt-2 text-[11px] text-slate-400 font-mono truncate">
          {subtext}
        </p>
      )}
    </div>
  );
};
