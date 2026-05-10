import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { moduleCards, alertLogs } from '../data/mockData';
import { Activity, Fish, Droplets, Microscope, AlertTriangle, Wifi, Clock, HeartPulse, ChevronRight } from 'lucide-react';

const iconMap = { Activity, Fish, Droplets, Microscope };

const colorStyles = {
  red:    { border: 'border-red-900/40',    bg: 'hover:bg-red-950/20',    gradient: 'from-red-500/15 to-rose-500/15',    iconColor: 'text-red-400'    },
  emerald:{ border: 'border-emerald-900/40',bg: 'hover:bg-emerald-950/20',gradient: 'from-emerald-500/15 to-teal-500/15', iconColor: 'text-emerald-400'},
  cyan:   { border: 'border-cyan-900/40',   bg: 'hover:bg-cyan-950/20',   gradient: 'from-cyan-500/15 to-sky-500/15',     iconColor: 'text-cyan-400'   },
  violet: { border: 'border-violet-900/40', bg: 'hover:bg-violet-950/20', gradient: 'from-violet-500/15 to-purple-500/15',iconColor: 'text-violet-400' },
};

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: 'Active Alerts', value: '8', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', sub: '5 critical' },
    { label: 'Active Sensors', value: '4/4', icon: Wifi, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', sub: 'All online' },
    { label: 'Fish Health', value: '65/100', icon: HeartPulse, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', sub: 'Needs attention' },
    { label: 'Online Since', value: 'May 1', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', sub: '14 days running' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{user?.name || 'Researcher'}</span> 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">Here's your aquarium system overview for today</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 ${s.bg} rounded-lg border ${s.border}`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className="text-xl font-bold text-white">{s.value}</p>
              </div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wide">{s.label}</p>
              <p className="text-[11px] text-slate-600 mt-0.5">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Module Cards */}
      <div>
        <h2 className="text-base font-semibold text-slate-300 mb-4">System Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {moduleCards.map((mod) => {
            const Icon = iconMap[mod.icon] || Activity;
            const cs = colorStyles[mod.color] || colorStyles.red;
            return (
              <button key={mod.id} onClick={() => navigate(mod.path)}
                className={`group text-left bg-slate-900/40 backdrop-blur-md border ${cs.border} rounded-2xl p-5 ${cs.bg} transition-all duration-300 hover:-translate-y-0.5`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${cs.gradient} border ${cs.border} group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${cs.iconColor}`} />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">{mod.title}</h3>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">{mod.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${mod.statusType === 'critical' ? 'text-red-400' : 'text-emerald-400'}`}>{mod.status}</span>
                  {mod.stats.alerts > 0 && (
                    <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">{mod.stats.alerts} alerts</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
          <h2 className="text-base font-semibold flex items-center gap-2 text-slate-200">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Recent Activity
          </h2>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Last 24h</span>
        </div>
        <div className="divide-y divide-slate-800/50">
          {alertLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="px-5 py-3 hover:bg-slate-800/30 transition-colors flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`} />
                <div className="min-w-0">
                  <p className="text-sm text-slate-200 font-medium truncate">{log.issue}</p>
                  <p className="text-xs text-slate-500">{log.action}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-slate-500">{log.time}</p>
                <span className={`text-[10px] font-semibold ${log.severity === 'critical' ? 'text-red-500' : 'text-amber-500'} uppercase`}>
                  {log.severity === 'critical' ? 'Act Now' : 'Monitor'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
