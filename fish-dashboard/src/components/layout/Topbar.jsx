import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, Settings, Menu, ChevronRight } from 'lucide-react';

const pageTitles = {
  '/home': 'Home Dashboard',
  '/fish-stress': 'Fish Stress Detection',
  '/fish-feeding': 'Automated Feeding',
  '/water-quality': 'Water Quality Monitoring',
  '/disease-detection': 'Disease Detection',
};

export default function Topbar({ onMenuToggle, notifOpen, onNotifToggle }) {
  const location = useLocation();
  const { user } = useAuth();
  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800/60">
      {/* Left: Menu + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500 hidden sm:inline">AquaVision</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
          <span className="font-medium text-slate-200">{pageTitle}</span>
        </div>

        {/* System status */}
        <div className="hidden md:flex items-center gap-1.5 ml-4 text-xs text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          System Online
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Bell with live notification drawer */}
        <button
          onClick={onNotifToggle}
          className={`relative p-2 rounded-lg border transition-colors ${notifOpen ? 'border-blue-500/40 bg-blue-500/10 text-blue-400' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white'}`}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
            8
          </span>
        </button>

        <button className="p-2 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
          <Settings className="w-4 h-4" />
        </button>

        {/* User avatar */}
        {user && (
          <div className="hidden sm:flex items-center gap-2.5 ml-2 pl-3 border-l border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-medium text-slate-200 leading-none">{user.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
