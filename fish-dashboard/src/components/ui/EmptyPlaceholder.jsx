import React from 'react';
import { Construction } from 'lucide-react';

export default function EmptyPlaceholder({ title, description, icon: Icon, tabs = [], color = 'blue' }) {
  const colorMap = {
    blue: { gradient: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'bg-blue-500/5' },
    emerald: { gradient: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'bg-emerald-500/5' },
    cyan: { gradient: 'from-cyan-500/20 to-sky-500/20', border: 'border-cyan-500/20', text: 'text-cyan-400', glow: 'bg-cyan-500/5' },
    violet: { gradient: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/20', text: 'text-violet-400', glow: 'bg-violet-500/5' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fadeIn">
      {/* Disabled tabs */}
      {tabs.length > 0 && (
        <div className="flex items-center gap-1 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-xl p-1 mb-8 opacity-50">
          {tabs.map((tab, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 cursor-not-allowed">
              {tab}
            </div>
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="text-center">
        <div className={`relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br ${c.gradient} border ${c.border} mb-6`}>
          <div className={`absolute inset-0 ${c.glow} rounded-2xl blur-xl`}></div>
          {Icon ? (
            <Icon className={`w-10 h-10 ${c.text} relative z-10`} />
          ) : (
            <Construction className={`w-10 h-10 ${c.text} relative z-10`} />
          )}
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-slate-400 text-sm max-w-md mb-6">{description}</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-sm text-slate-500">
          <Construction className="w-4 h-4" />
          Under Development — Coming Soon
        </div>
      </div>
    </div>
  );
}
