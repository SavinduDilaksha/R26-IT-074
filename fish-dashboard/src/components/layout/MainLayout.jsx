import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function MainLayout() {
  const { isAuthenticated, loading } = useAuth();

  // Default expanded on desktop, collapsed on mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('aquavision_sidebar');
    if (saved !== null) return JSON.parse(saved);
    return window.innerWidth < 1024; // collapsed on mobile, expanded on desktop
  });

  const [notifOpen, setNotifOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('aquavision_sidebar', JSON.stringify(next));
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading AquaVision...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
        <Topbar onMenuToggle={toggleSidebar} notifOpen={notifOpen} onNotifToggle={() => setNotifOpen(o => !o)} />

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Notification Drawer Overlay */}
      {notifOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1" onClick={() => setNotifOpen(false)} />
          <NotificationDrawer onClose={() => setNotifOpen(false)} />
        </div>
      )}
    </div>
  );
}

// Inline Notification Drawer
import { alertLogs } from '../../data/mockData';
import { Bell, X, AlertTriangle, Info, CheckCircle } from 'lucide-react';

function NotificationDrawer({ onClose }) {
  return (
    <div className="w-80 sm:w-96 h-full bg-[#0a0f1e]/98 backdrop-blur-xl border-l border-slate-800/80 flex flex-col animate-slideDown shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-400" />
          <h2 className="text-base font-semibold text-white">Notifications</h2>
          <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{alertLogs.length}</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
        {alertLogs.map(log => (
          <div key={log.id} className="px-5 py-4 hover:bg-slate-800/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 flex-shrink-0 p-1.5 rounded-lg ${log.severity === 'critical' ? 'bg-red-500/15' : 'bg-amber-500/15'}`}>
                {log.severity === 'critical'
                  ? <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  : <Info className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${log.severity === 'critical' ? 'text-red-300' : 'text-amber-300'}`}>{log.issue}</p>
                <p className="text-xs text-slate-400 mt-0.5">{log.action}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-slate-600">{log.date} · {log.time}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${log.source === 'CV' ? 'bg-blue-500/10 text-blue-400' : 'bg-cyan-500/10 text-cyan-400'}`}>{log.source === 'CV' ? 'Camera' : 'Sensor'}</span>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${log.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-800/60">
        <button className="w-full py-2 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center justify-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" />
          Mark all as read
        </button>
      </div>
    </div>
  );
}
