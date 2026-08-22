import React, { useState } from 'react';
import {
  BarChart2, TrendingUp, TrendingDown, AlertTriangle, Fish,
  Calendar, Download, HeartPulse, Activity, Clock, Target,
} from 'lucide-react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Area, AreaChart,
} from 'recharts';

// ── Mock data per time range ──────────────────────────────────────────────────
const MULTI_AXIS_DATA = {
  day: [
    { time: '00:00', nh3: 0.01, ph: 7.4, temp: 27.2, turbidity: 10, stressedFish: 0 },
    { time: '02:00', nh3: 0.01, ph: 7.3, temp: 27.0, turbidity: 9,  stressedFish: 0 },
    { time: '04:00', nh3: 0.02, ph: 7.2, temp: 26.8, turbidity: 11, stressedFish: 1 },
    { time: '06:00', nh3: 0.02, ph: 7.2, temp: 27.0, turbidity: 10, stressedFish: 1 },
    { time: '08:00', nh3: 0.03, ph: 7.1, temp: 27.8, turbidity: 12, stressedFish: 2 },
    { time: '10:00', nh3: 0.04, ph: 7.0, temp: 28.4, turbidity: 14, stressedFish: 3 },
    { time: '12:00', nh3: 0.05, ph: 6.9, temp: 29.0, turbidity: 16, stressedFish: 5 },
    { time: '14:00', nh3: 0.05, ph: 7.0, temp: 28.8, turbidity: 15, stressedFish: 4 },
    { time: '16:00', nh3: 0.06, ph: 6.8, temp: 29.2, turbidity: 18, stressedFish: 5 },
    { time: '18:00', nh3: 0.06, ph: 6.9, temp: 29.0, turbidity: 17, stressedFish: 5 },
    { time: '20:00', nh3: 0.04, ph: 7.1, temp: 28.4, turbidity: 14, stressedFish: 3 },
    { time: '22:00', nh3: 0.03, ph: 7.2, temp: 27.8, turbidity: 12, stressedFish: 2 },
  ],
  week: [
    { time: 'Mon', nh3: 0.01, ph: 7.4, temp: 27.0, turbidity: 9,  stressedFish: 0 },
    { time: 'Tue', nh3: 0.02, ph: 7.3, temp: 27.5, turbidity: 10, stressedFish: 1 },
    { time: 'Wed', nh3: 0.03, ph: 7.1, temp: 28.2, turbidity: 12, stressedFish: 3 },
    { time: 'Thu', nh3: 0.02, ph: 7.2, temp: 27.8, turbidity: 11, stressedFish: 2 },
    { time: 'Fri', nh3: 0.05, ph: 6.9, temp: 29.1, turbidity: 15, stressedFish: 5 },
    { time: 'Sat', nh3: 0.06, ph: 6.8, temp: 29.2, turbidity: 18, stressedFish: 5 },
    { time: 'Sun', nh3: 0.04, ph: 7.1, temp: 28.4, turbidity: 13, stressedFish: 3 },
  ],
  month: [
    { time: 'W1',  nh3: 0.01, ph: 7.4, temp: 27.1, turbidity: 9,  stressedFish: 1 },
    { time: 'W2',  nh3: 0.02, ph: 7.3, temp: 27.6, turbidity: 11, stressedFish: 2 },
    { time: 'W3',  nh3: 0.04, ph: 7.0, temp: 28.5, turbidity: 14, stressedFish: 4 },
    { time: 'W4',  nh3: 0.05, ph: 6.9, temp: 29.0, turbidity: 16, stressedFish: 5 },
  ],
};

// Daily Health Index data (7 days)
const DAILY_HEALTH = [
  { day: 'Mon', score: 92, label: 'Excellent' },
  { day: 'Tue', score: 86, label: 'Good' },
  { day: 'Wed', score: 71, label: 'Good' },
  { day: 'Thu', score: 78, label: 'Good' },
  { day: 'Fri', score: 45, label: 'Warning' },
  { day: 'Sat', score: 32, label: 'Critical' },
  { day: 'Sun', score: 60, label: 'Warning' },
];

// Event history
const HISTORY = [
  { id: 1, date: '2026-05-09', time: '10:25 AM', type: 'Swimming to Surface', stressedFish: 5, duration: '12 min', sensor: 'NH₃ 0.06 mg/L', trigger: 'Both (Camera + Sensor)', severity: 'critical', action: 'Oxygen Pump Activated' },
  { id: 2, date: '2026-05-09', time: '08:15 AM', type: 'Erratic Darting',     stressedFish: 3, duration: '8 min',  sensor: 'pH 6.8',            trigger: 'Camera',               severity: 'critical', action: 'Alert Generated' },
  { id: 3, date: '2026-05-08', time: '04:15 PM', type: 'Chemical Stress',    stressedFish: 4, duration: '22 min', sensor: 'NH₃ 0.07 mg/L',    trigger: 'Both (Camera + Sensor)', severity: 'critical', action: 'Water Change Recommended' },
  { id: 4, date: '2026-05-08', time: '11:20 AM', type: 'Erratic Darting',    stressedFish: 2, duration: '5 min',  sensor: 'Turbidity 24 NTU', trigger: 'Camera',               severity: 'warning',  action: 'Monitoring Increased' },
  { id: 5, date: '2026-05-07', time: '02:30 PM', type: 'Swimming to Surface',stressedFish: 5, duration: '18 min', sensor: 'NH₃ 0.08 mg/L',    trigger: 'Both (Camera + Sensor)', severity: 'critical', action: 'Oxygen Pump Activated' },
  { id: 6, date: '2026-05-07', time: '09:45 AM', type: 'Normal Recovery',    stressedFish: 0, duration: '–',      sensor: 'All Normal',        trigger: 'Sensor',               severity: 'normal',   action: 'None' },
  { id: 7, date: '2026-05-06', time: '08:10 PM', type: 'Chemical Stress',    stressedFish: 3, duration: '10 min', sensor: 'pH 6.7',            trigger: 'Camera',               severity: 'warning',  action: 'User Notified' },
  { id: 8, date: '2026-05-05', time: '05:20 PM', type: 'Swimming to Surface',stressedFish: 4, duration: '7 min',  sensor: 'NH₃ 0.05 mg/L',    trigger: 'Both (Camera + Sensor)', severity: 'warning',  action: 'Oxygen Pump Activated' },
];

// Severity badge helper
function SeverityBadge({ severity }) {
  if (severity === 'critical') return <span className="text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded uppercase tracking-wide">Critical</span>;
  if (severity === 'warning')  return <span className="text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded uppercase tracking-wide">Warning</span>;
  return <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded uppercase tracking-wide">Normal</span>;
}

// Score color helper
function scoreColor(s) {
  if (s >= 70) return { text: 'text-emerald-400', bg: 'bg-emerald-500', label: 'Healthy' };
  if (s >= 40) return { text: 'text-amber-400',   bg: 'bg-amber-500',   label: 'Warning' };
  return          { text: 'text-red-400',          bg: 'bg-red-500',     label: 'Critical' };
}

const TOOLTIP_STYLE = { backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc', fontSize: 11 };

export default function AnalyticsTab() {
  const [range, setRange] = useState('week');
  const [histFilter, setHistFilter] = useState('all');

  const chartData = MULTI_AXIS_DATA[range];

  // Weekly summary stats
  const totalEvents   = HISTORY.filter(h => h.severity !== 'normal').length;
  const criticalCount = HISTORY.filter(h => h.severity === 'critical').length;
  const avgScore      = Math.round(DAILY_HEALTH.reduce((s, d) => s + d.score, 0) / DAILY_HEALTH.length);
  const todayScore    = DAILY_HEALTH[DAILY_HEALTH.length - 1].score;

  const filteredHistory = histFilter === 'all' ? HISTORY : HISTORY.filter(h => h.severity === histFilter);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-500/10 rounded-xl border border-violet-500/20">
            <BarChart2 className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Insights & Reporting</h2>
            <p className="text-sm text-slate-400">Long-term stress patterns, sensor trends & event history</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs text-slate-300 hover:bg-slate-700/60 transition-colors">
          <Download className="w-3.5 h-3.5" /> Export Report
        </button>
      </div>

      {/* ── Summary KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: HeartPulse, label: "Today's Health Index", value: `${todayScore}%`, sub: scoreColor(todayScore).label, color: scoreColor(todayScore).text, bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
          { icon: Target,     label: 'Weekly Avg Health',   value: `${avgScore}%`,    sub: 'Last 7 days',                color: scoreColor(avgScore).text,    bg: 'bg-blue-500/10',  border: 'border-blue-500/20' },
          { icon: AlertTriangle, label: 'Stress Events',    value: totalEvents,        sub: `${criticalCount} critical`,   color: 'text-red-400',               bg: 'bg-red-500/10',   border: 'border-red-500/20' },
          { icon: Fish,       label: 'Peak Stressed Fish',  value: '5 / 6',            sub: 'Max detected at once',        color: 'text-amber-400',             bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className={`bg-slate-900/40 backdrop-blur-md border ${kpi.border} rounded-2xl p-4`}>
              <div className={`inline-flex p-2 rounded-lg ${kpi.bg} border ${kpi.border} mb-3`}>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className={`text-2xl font-extrabold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wide mt-0.5">{kpi.label}</p>
              <p className="text-[11px] text-slate-600 mt-0.5">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Daily Stress Score (Health Index) ── */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-pink-400" />
            Daily Stress Score — Fish Calmness Index (0–100%)
          </h3>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500" />Healthy (70–100)</span>
            <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-500" />Warning (40–70)</span>
            <span className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 rounded-full bg-red-500" />Critical (0–40)</span>
          </div>
        </div>

        {/* Score bars */}
        <div className="space-y-3">
          {DAILY_HEALTH.map((d, i) => {
            const sc = scoreColor(d.score);
            const isToday = i === DAILY_HEALTH.length - 1;
            return (
              <div key={d.day} className="flex items-center gap-3">
                <span className={`text-xs w-8 flex-shrink-0 font-medium ${isToday ? 'text-white' : 'text-slate-400'}`}>{d.day}</span>
                <div className="flex-1 h-5 bg-slate-800 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${sc.bg}`}
                    style={{ width: `${d.score}%`, opacity: isToday ? 1 : 0.75 }}
                  />
                  {isToday && <span className="absolute right-2 top-0.5 text-[9px] font-bold text-white/80">TODAY</span>}
                </div>
                <span className={`text-sm font-bold w-12 text-right flex-shrink-0 ${sc.text}`}>{d.score}%</span>
                <span className={`text-[10px] w-16 flex-shrink-0 ${sc.text}`}>{sc.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Multi-Axis Chart ── */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Sensor Parameters vs. Stressed Fish Count
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Left axis: sensor values — Right axis: stressed fish detected by AI camera</p>
          </div>
          {/* Dropdown */}
          <select
            value={range}
            onChange={e => setRange(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="day">Today (Hourly)</option>
            <option value="week">This Week (Daily)</option>
            <option value="month">This Month (Weekly)</option>
          </select>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4">
          {[
            { color: '#f59e0b', label: 'NH₃ (mg/L)',   dashed: false },
            { color: '#22c55e', label: 'pH',            dashed: false },
            { color: '#3b82f6', label: 'Temp (°C)',     dashed: false },
            { color: '#06b6d4', label: 'Turbidity (NTU)', dashed: false },
            { color: '#ef4444', label: 'Stressed Fish (count)', dashed: false, isBar: true },
          ].map((l, i) => (
            <span key={i} className="flex items-center gap-1.5 text-[11px] text-slate-400">
              {l.isBar
                ? <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: l.color }} />
                : <span className="w-6 h-0.5 flex-shrink-0" style={{ backgroundColor: l.color }} />}
              {l.label}
            </span>
          ))}
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 40, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              {/* Left Y axis — sensor values */}
              <YAxis yAxisId="sensor" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              {/* Right Y axis — fish count */}
              <YAxis yAxisId="fish" orientation="right" stroke="#ef4444" fontSize={10} tickLine={false} axisLine={false} domain={[0, 6]} tickCount={7} />
              <Tooltip contentStyle={TOOLTIP_STYLE}
                formatter={(val, name) => {
                  if (name === 'Stressed Fish') return [`${val} fish`, name];
                  return [val, name];
                }}
              />
              {/* Sensor lines — left axis */}
              <Line yAxisId="sensor" type="monotone" dataKey="nh3"       name="NH₃ (mg/L)"    stroke="#f59e0b" strokeWidth={2}   dot={false} />
              <Line yAxisId="sensor" type="monotone" dataKey="ph"        name="pH"             stroke="#22c55e" strokeWidth={2}   dot={false} strokeDasharray="5 3" />
              <Line yAxisId="sensor" type="monotone" dataKey="temp"      name="Temp (°C)"      stroke="#3b82f6" strokeWidth={2}   dot={false} strokeDasharray="5 3" />
              <Line yAxisId="sensor" type="monotone" dataKey="turbidity" name="Turbidity (NTU)" stroke="#06b6d4" strokeWidth={2}  dot={false} strokeDasharray="5 3" />
              {/* Fish count bars — right axis */}
              <Bar yAxisId="fish" dataKey="stressedFish" name="Stressed Fish" fill="#ef444440" stroke="#ef4444" strokeWidth={1} radius={[3, 3, 0, 0]} maxBarSize={30} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Event History Table ── */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" /> Stress Event History
          </h3>
          <select
            value={histFilter}
            onChange={e => setHistFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-[11px] text-slate-400 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Events</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warning Only</option>
            <option value="normal">Normal Only</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-800/50">
                <th className="text-left px-4 py-3 font-medium">Date & Time</th>
                <th className="text-left px-4 py-3 font-medium">Behavior Detected</th>
                <th className="text-left px-4 py-3 font-medium">Stressed Fish</th>
                <th className="text-left px-4 py-3 font-medium">Sensor Reading</th>
                <th className="text-left px-4 py-3 font-medium">Detected By</th>
                <th className="text-left px-4 py-3 font-medium">Duration</th>
                <th className="text-left px-4 py-3 font-medium">Severity</th>
                <th className="text-left px-4 py-3 font-medium">Action Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {filteredHistory.map(e => (
                <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-xs text-slate-300 font-medium">{e.time}</p>
                    <p className="text-[10px] text-slate-600">{e.date}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-200 font-medium">{e.type}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${e.stressedFish >= 4 ? 'text-red-400' : e.stressedFish >= 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {e.stressedFish} / 6
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-400">{e.sensor}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${e.trigger.includes('Both') ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : e.trigger === 'Camera' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'}`}>
                      {e.trigger}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-400">{e.duration}</td>
                  <td className="px-4 py-3"><SeverityBadge severity={e.severity} /></td>
                  <td className="px-4 py-3 text-[11px] text-slate-400">{e.action}</td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-600">No events for selected filter</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer summary */}
        <div className="px-5 py-3 border-t border-slate-800/60 bg-slate-900/40 flex items-center justify-between text-[11px] text-slate-500">
          <span>Showing {filteredHistory.length} of {HISTORY.length} events</span>
          <span>Data from last 7 days</span>
        </div>
      </div>
    </div>
  );
}
