import React from 'react';

export default function TabNavigation({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex items-center gap-1 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-xl p-1 mb-6 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap
              transition-all duration-200
              ${isActive
                ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-white border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }
            `}
          >
            {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : ''}`} />}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
