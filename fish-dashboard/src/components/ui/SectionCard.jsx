import React from 'react';

export default function SectionCard({ title, icon: Icon, children, action, className = '' }) {
  return (
    <div className={`bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:border-slate-700 hover:shadow-blue-900/5 ${className}`}>
      {(title || action) && (
        <div className="px-5 py-3.5 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/60">
          <h2 className="text-base font-semibold flex items-center gap-2 text-slate-200">
            {Icon && <Icon className="w-4 h-4 text-blue-400" />}
            {title}
          </h2>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}
