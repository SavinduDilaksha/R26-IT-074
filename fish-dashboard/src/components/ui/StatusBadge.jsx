import React from 'react';

const config = {
  normal: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20',
  warning: 'text-amber-400 bg-amber-400/10 border-amber-500/20',
  critical: 'text-red-400 bg-red-500/10 border-red-500/20',
  info: 'text-blue-400 bg-blue-400/10 border-blue-500/20',
  offline: 'text-slate-400 bg-slate-400/10 border-slate-500/20',
};

export default function StatusBadge({ status = 'normal', text, pulse = false, className = '' }) {
  const style = config[status] || config.normal;
  const displayText = text || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`text-[10px] font-semibold ${style} px-2 py-0.5 rounded border uppercase tracking-wider ${pulse ? 'animate-pulse' : ''} ${className}`}>
      {displayText}
    </span>
  );
}
