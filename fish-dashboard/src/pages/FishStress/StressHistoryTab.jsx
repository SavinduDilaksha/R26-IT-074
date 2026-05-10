import React, { useState } from 'react';
import { History, Calendar, TrendingUp, Clock, Zap, Target } from 'lucide-react';
import { stressHistory, heatmapData, stressSummary } from '../../data/mockData';

const getHeatColor = (val) => {
  if (val < 20) return 'bg-emerald-900/30';
  if (val < 40) return 'bg-emerald-700/40';
  if (val < 60) return 'bg-amber-700/40';
  if (val < 80) return 'bg-red-700/40';
  return 'bg-red-600/60';
};

export default function StressHistoryTab() {
  const [page, setPage] = useState(0);
  const perPage = 5;
  const totalPages = Math.ceil(stressHistory.length / perPage);
  const paged = stressHistory.slice(page * perPage, (page + 1) * perPage);

  const summaryCards = [
    { label: 'Events This Week', value: stressSummary.totalEventsWeek, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Events This Month', value: stressSummary.totalEventsMonth, icon: Calendar, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    { label: 'Avg Duration', value: stressSummary.avgDuration, icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    { label: 'Common Trigger', value: 'Both', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { label: 'Peak Time', value: '12-2 PM', icon: Target, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  ];

  const getEventColor = (type) => {
    if (type.includes('Hypoxia') || type.includes('Gasping')) return 'text-red-400';
    if (type.includes('Chemical') || type.includes('Erratic')) return 'text-amber-400';
    if (type.includes('Normal')) return 'text-emerald-400';
    return 'text-slate-300';
  };

  const getTriggerStyle = (trigger) => {
    if (trigger === 'CV') return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    if (trigger === 'IoT') return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    if (trigger === 'Both') return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {summaryCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-xl p-4">
              <div className={`p-2 ${s.bg} rounded-lg border ${s.border} inline-block mb-3`}>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Heatmap */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5">
        <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2 mb-5">
          <Calendar className="w-4 h-4 text-blue-400" />
          Daily Stress Pattern (Hourly Heatmap)
        </h3>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="flex gap-0.5 mb-1 pl-14">
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="flex-1 text-center text-[8px] text-slate-600">
                  {i % 4 === 0 ? `${i}h` : ''}
                </div>
              ))}
            </div>
            {heatmapData.map((row) => (
              <div key={row.day} className="flex items-center gap-0.5 mb-0.5">
                <span className="w-12 text-[11px] text-slate-500 text-right pr-2 flex-shrink-0">{row.day}</span>
                {row.hours.map((val, h) => (
                  <div key={h} className={`flex-1 h-6 rounded-sm ${getHeatColor(val)} hover:ring-1 hover:ring-slate-500 transition-all cursor-pointer`} title={`${row.day} ${h}:00 — Stress: ${val}%`} />
                ))}
              </div>
            ))}
            <div className="flex items-center gap-3 mt-4 pl-14">
              <span className="text-[10px] text-slate-500">Low</span>
              {['bg-emerald-900/30', 'bg-emerald-700/40', 'bg-amber-700/40', 'bg-red-700/40', 'bg-red-600/60'].map((c, i) => (
                <div key={i} className={`w-6 h-3 rounded-sm ${c}`} />
              ))}
              <span className="text-[10px] text-slate-500">High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Event Log Table */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            Stress Event Log
          </h3>
          <span className="text-[10px] text-slate-500">Page {page + 1} of {totalPages}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-800/50">
                <th className="text-left px-5 py-3 font-medium">Timestamp</th>
                <th className="text-left px-5 py-3 font-medium">Event</th>
                <th className="text-left px-5 py-3 font-medium">Level</th>
                <th className="text-left px-5 py-3 font-medium">Duration</th>
                <th className="text-left px-5 py-3 font-medium">Trigger</th>
                <th className="text-left px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {paged.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3 text-slate-400 text-xs whitespace-nowrap">{ev.timestamp}</td>
                  <td className={`px-5 py-3 font-medium ${getEventColor(ev.type)}`}>{ev.type}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${ev.level >= 70 ? 'bg-red-500' : ev.level >= 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${ev.level}%` }} />
                      </div>
                      <span className="text-xs text-slate-400">{ev.level}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{ev.duration}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getTriggerStyle(ev.trigger)}`}>{ev.trigger}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{ev.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-800/50 flex justify-end gap-2">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 text-xs bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Previous</button>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 text-xs bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Next</button>
        </div>
      </div>
    </div>
  );
}
