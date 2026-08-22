import React from 'react';

const variants = {
  default: {
    border: 'border-slate-800/80',
    iconBg: 'bg-blue-500/10',
    iconBorder: 'border-blue-500/20',
    iconColor: 'text-blue-400',
    valuColor: 'text-white',
  },
  success: {
    border: 'border-slate-800/80',
    iconBg: 'bg-emerald-500/10',
    iconBorder: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
    valuColor: 'text-white',
  },
  warning: {
    border: 'border-amber-900/30',
    iconBg: 'bg-amber-500/10',
    iconBorder: 'border-amber-500/20',
    iconColor: 'text-amber-400',
    valuColor: 'text-amber-50',
  },
  critical: {
    border: 'border-red-900/50',
    iconBg: 'bg-red-500/20',
    iconBorder: 'border-red-500/30',
    iconColor: 'text-red-400',
    valuColor: 'text-red-400',
  },
};

const statusConfig = {
  normal: { text: 'NORMAL', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20' },
  warning: { text: 'WARNING', color: 'text-amber-400 bg-amber-400/10 border-amber-500/20' },
  critical: { text: 'CRITICAL', color: 'text-red-400 bg-red-500/10 border-red-500/20 animate-pulse' },
};

export default function StatCard({ icon: Icon, value, unit, label, status = 'normal', variant = 'default' }) {
  const v = variants[variant] || variants.default;
  const s = statusConfig[status] || statusConfig.normal;

  return (
    <div className={`bg-slate-900/40 backdrop-blur-md border ${v.border} rounded-2xl p-4 flex flex-col justify-between hover:bg-slate-800/40 transition-colors group relative overflow-hidden`}>
      {variant === 'warning' && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl"></div>
      )}
      {variant === 'critical' && (
        <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-red-500/10 rounded-full blur-2xl"></div>
      )}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-2 ${v.iconBg} rounded-lg border ${v.iconBorder} group-hover:scale-110 transition-transform`}>
          <Icon className={`w-4 h-4 ${v.iconColor}`} />
        </div>
        <span className={`text-[10px] font-semibold ${s.color} px-2 py-0.5 rounded border`}>
          {s.text}
        </span>
      </div>
      <div className="relative z-10">
        <h3 className={`text-2xl font-bold ${v.valuColor} tracking-tight`}>
          {value}
          {unit && <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>}
        </h3>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide font-medium">{label}</p>
      </div>
    </div>
  );
}
