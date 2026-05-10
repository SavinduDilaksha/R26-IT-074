import React, { useState, useEffect } from 'react';
import {
  Activity, Thermometer, Droplet, Wind, AlertTriangle,
  Camera, BrainCircuit, Info, HeartPulse, Zap, Clock,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { stressChartData, alertLogs } from '../../data/mockData';

// Base sensor values
const BASE = {
  ph: 7.2, temperature: 28.4, ammonia: 0.05, turbidity: 12,
};

// Sensor safe ranges for Molly fish
const RANGES = {
  ph:          { min: 7.0, max: 8.5, unit: '',      label: 'pH Level',       icon: Droplet,      dangerBelow: true },
  temperature: { min: 24,  max: 28,  unit: '°C',    label: 'Temperature',    icon: Thermometer,  dangerBelow: false },
  ammonia:     { min: 0,   max: 0.02,unit: 'mg/L',  label: 'Ammonia (NH₃)', icon: Wind,         dangerAbove: true },
  turbidity:   { min: 0,   max: 20,  unit: 'NTU',   label: 'Turbidity',     icon: Droplet,      dangerAbove: true },
};

const ACTIONS = {
  critical: [
    { icon: '🚨', step: 'Immediately check your oxygen pump — turn it up or replace.', urgent: true },
    { icon: '💧', step: 'Do a 25–30% water change right now using dechlorinated water.', urgent: true },
    { icon: '🌡️', step: 'Make sure heater is working. Target 26–28°C.', urgent: false },
    { icon: '📞', step: 'Watch fish closely for next 30 minutes for improvement.', urgent: false },
  ],
  warning: [
    { icon: '⚠️', step: 'Ammonia rising — reduce feeding for 2 days.', urgent: false },
    { icon: '💧', step: 'Plan a 20% water change within today.', urgent: false },
    { icon: '🔍', step: 'Check filter — clean if due.', urgent: false },
    { icon: '📊', step: 'Monitor sensors every hour until levels normalize.', urgent: false },
  ],
  normal: [
    { icon: '✅', step: 'All looks good! Fish are healthy and calm.', urgent: false },
    { icon: '🗓️', step: 'Next scheduled water check: Tomorrow 9:00 AM', urgent: false },
    { icon: '🐠', step: 'Feed as scheduled. Avoid overfeeding.', urgent: false },
  ],
};

function getStatus(key, val) {
  if (key === 'ammonia') return val > 0.02 ? (val > 0.05 ? 'critical' : 'warning') : 'normal';
  if (key === 'turbidity') return val > 25 ? 'critical' : val > 20 ? 'warning' : 'normal';
  if (key === 'ph') return (val < 6.8 || val > 8.5) ? 'warning' : 'normal';
  if (key === 'temperature') return (val > 29 || val < 23) ? 'warning' : 'normal';
  return 'normal';
}

function getSafePercent(key, val) {
  const r = RANGES[key];
  if (!r) return 50;
  const range = r.max - r.min;
  const clamped = Math.max(0, Math.min(r.max * 1.5, val));
  return Math.round(((clamped - 0) / (r.max * 1.5)) * 100);
}

function getBarColor(key, val) {
  const s = getStatus(key, val);
  if (s === 'critical') return '#ef4444';
  if (s === 'warning') return '#f59e0b';
  return '#22c55e';
}

const statusColors = { normal: 'text-emerald-400', warning: 'text-amber-400', critical: 'text-red-400' };
const statusBg = { normal: 'bg-emerald-400/10 border-emerald-500/20', warning: 'bg-amber-400/10 border-amber-500/20', critical: 'bg-red-500/10 border-red-500/20 animate-pulse' };
const cardBorder = { normal: 'border-slate-800/80', warning: 'border-amber-900/30', critical: 'border-red-900/50' };

function SensorCard({ sensorKey, value, lastUpdated }) {
  const cfg = RANGES[sensorKey];
  const Icon = cfg.icon;
  const status = getStatus(sensorKey, value);
  const pct = getSafePercent(sensorKey, value);
  const barColor = getBarColor(sensorKey, value);
  const safeStart = Math.round((cfg.min / (cfg.max * 1.5)) * 100);
  const safeEnd = Math.round((cfg.max / (cfg.max * 1.5)) * 100);

  return (
    <div className={`bg-slate-900/40 backdrop-blur-md border ${cardBorder[status]} rounded-2xl p-4 flex flex-col gap-3 hover:bg-slate-800/40 transition-colors group relative overflow-hidden`}>
      {status === 'critical' && <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-red-500/10 rounded-full blur-2xl" />}
      <div className="flex justify-between items-start relative z-10">
        <div className={`p-2 rounded-lg border ${status === 'critical' ? 'bg-red-500/20 border-red-500/30' : status === 'warning' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'} group-hover:scale-110 transition-transform`}>
          <Icon className={`w-4 h-4 ${statusColors[status]}`} />
        </div>
        <span className={`text-[10px] font-semibold ${statusColors[status]} ${statusBg[status]} px-2 py-0.5 rounded border uppercase tracking-wider`}>
          {status}
        </span>
      </div>
      <div className="relative z-10">
        <h3 className={`text-2xl font-bold tracking-tight ${status === 'critical' ? 'text-red-400' : 'text-white'}`}>
          {typeof value === 'number' && value < 1 ? value.toFixed(2) : value}
          <span className="text-sm font-normal text-slate-500 ml-1">{cfg.unit}</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wide font-medium">{cfg.label}</p>
      </div>
      {/* Safe range bar */}
      <div className="relative z-10">
        <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          {/* Safe zone */}
          <div className="absolute top-0 h-full bg-emerald-500/20 rounded-full" style={{ left: `${safeStart}%`, width: `${safeEnd - safeStart}%` }} />
          {/* Current value needle */}
          <div className="absolute top-0 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }} />
        </div>
        <div className="flex justify-between text-[9px] text-slate-600 mt-1">
          <span>Safe: {cfg.min}{cfg.unit}</span>
          <span>{cfg.max}{cfg.unit}</span>
        </div>
      </div>
      <p className="text-[9px] text-slate-600 flex items-center gap-1 relative z-10">
        <Clock className="w-2.5 h-2.5" /> Updated {lastUpdated}s ago
      </p>
    </div>
  );
}

export default function DashboardTab() {
  const [sensors, setSensors] = useState({ ...BASE });
  const [lastUpdated, setLastUpdated] = useState(0);
  const [tick, setTick] = useState(0);

  // Real-time simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev => ({
        ph: +(prev.ph + (Math.random() - 0.5) * 0.05).toFixed(2),
        temperature: +(prev.temperature + (Math.random() - 0.5) * 0.2).toFixed(1),
        ammonia: +(Math.max(0, prev.ammonia + (Math.random() - 0.45) * 0.005)).toFixed(3),
        turbidity: +(Math.max(0, prev.turbidity + (Math.random() - 0.5) * 0.5)).toFixed(1),
      }));
      setLastUpdated(0);
      setTick(t => t + 1);
    }, 3000);

    const counter = setInterval(() => setLastUpdated(s => s + 1), 1000);
    return () => { clearInterval(interval); clearInterval(counter); };
  }, []);

  // Derived state
  const overallStatus = sensors.turbidity > 25 ? 'critical' : sensors.ammonia > 0.04 ? 'warning' : 'normal';
  const healthScore = Math.round(
    100 - (sensors.ammonia > 0.02 ? 30 : 0) - (sensors.turbidity > 25 ? 35 : 0) -
    (sensors.temperature > 29 ? 10 : 0) - (sensors.ph < 6.8 ? 15 : 0)
  );
  const actions = ACTIONS[overallStatus];

  const stressLabel = overallStatus === 'critical' ? 'High Stress' : overallStatus === 'warning' ? 'Moderate Stress' : 'Normal';
  const stressLevel = overallStatus === 'critical' ? 82 : overallStatus === 'warning' ? 52 : 18;

  return (
    <div className="space-y-6">
      {/* === Fish Health Score Bar === */}
      <div className={`rounded-2xl p-4 border flex flex-col sm:flex-row items-center gap-4 ${
        overallStatus === 'critical' ? 'bg-red-950/30 border-red-900/50' :
        overallStatus === 'warning' ? 'bg-amber-950/30 border-amber-900/50' :
        'bg-emerald-950/30 border-emerald-900/50'}`}>
        <div className="flex items-center gap-4 flex-1 w-full">
          <div className={`flex-shrink-0 text-3xl font-extrabold ${overallStatus === 'critical' ? 'text-red-400' : overallStatus === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
            {healthScore}<span className="text-base font-normal text-slate-500">/100</span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between mb-1.5">
              <span className="text-sm font-semibold text-white flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-pink-400" /> Fish Health Score
              </span>
              <span className={`text-sm font-bold ${statusColors[overallStatus]}`}>{stressLabel}</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden relative">
              <div className="absolute inset-y-0 left-0 w-[30%] bg-emerald-500/20 rounded-l-full" />
              <div className="absolute inset-y-0 left-[30%] w-[30%] bg-amber-500/20" />
              <div className="absolute inset-y-0 left-[60%] right-0 bg-red-500/20 rounded-r-full" />
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${
                  overallStatus === 'critical' ? 'bg-gradient-to-r from-red-600 to-red-400' :
                  overallStatus === 'warning' ? 'bg-gradient-to-r from-amber-600 to-amber-400' :
                  'bg-gradient-to-r from-emerald-600 to-emerald-400'}`}
                style={{ width: `${healthScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-600 mt-1">
              <span>Critical (0–40)</span><span>Warning (40–70)</span><span>Healthy (70–100)</span>
            </div>
          </div>
        </div>
      </div>

      {/* === Main Grid === */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Live Feed */}
          <div className="group bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl hover:border-slate-700 transition-all">
            <div className="px-5 py-3.5 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/60">
              <h2 className="text-base font-semibold flex items-center gap-2 text-slate-200">
                <Camera className="w-4 h-4 text-blue-400" /> AI Detection Feed
              </h2>
              <span className="text-[10px] uppercase tracking-wider bg-red-500/10 text-red-400 px-2 py-1 rounded-md border border-red-500/20 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />REC
              </span>
            </div>
            <div className="relative aspect-video bg-slate-950 w-full overflow-hidden flex items-center justify-center">
              {/* Water background */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] to-[#020617]" />
              {/* Animated water ripples */}
              <div className="absolute inset-0 opacity-10">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="absolute rounded-full border border-blue-400/40 animate-ping"
                    style={{ width: `${60 + i * 40}px`, height: `${60 + i * 40}px`, top: `${20 + i * 8}%`, left: `${15 + i * 15}%`, animationDuration: `${2 + i * 0.8}s`, animationDelay: `${i * 0.3}s` }} />
                ))}
              </div>
              {/* Simulated fish silhouettes */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-blue-900/40 text-6xl" style={{ animation: 'float 4s ease-in-out infinite' }}>🐠</div>
              </div>
              <div className="absolute top-[20%] right-[20%] text-blue-900/30 text-3xl" style={{ animation: 'float 6s ease-in-out infinite reverse' }}>🐟</div>
              {/* Bounding Box */}
              <div className="absolute top-1/4 left-1/4 w-56 h-40 z-20 group-hover:scale-[1.02] transition-transform duration-700">
                <div className="absolute inset-0 border-2 border-red-500/80 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.3)]" />
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-400" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-400" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-400" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-400" />
                <div className="absolute -top-8 left-[-2px] bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-2.5 py-1.5 flex items-center gap-1.5 shadow-lg rounded-t-sm rounded-br-sm border border-red-400/50">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Molly Fish: Swimming to Surface (94%)
                </div>
              </div>
              {/* Normal fish box */}
              <div className="absolute bottom-[25%] right-[20%] w-32 h-24 z-20">
                <div className="absolute inset-0 border border-emerald-500/60 bg-emerald-500/5" />
                <div className="absolute -top-6 left-0 bg-emerald-700 text-white text-[10px] font-bold px-2 py-1 rounded-sm">Normal (98%)</div>
              </div>
            </div>
          </div>

          {/* Stress Trend Chart */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-semibold flex items-center gap-2 text-slate-200">
                <Activity className="w-4 h-4 text-blue-400" /> Stress Level Trend (Last 24h)
              </h2>
              <select className="bg-slate-950 border border-slate-800 text-xs text-slate-400 rounded-md px-2 py-1 outline-none focus:border-slate-600">
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
              </select>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stressChartData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="colorStressDash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }} itemStyle={{ color: '#ef4444', fontWeight: 600 }} />
                  <Area type="monotone" dataKey="stressLevel" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorStressDash)" activeDot={{ r: 5, fill: '#ef4444', stroke: '#0f172a', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-5">
          {/* AI Status */}
          <div className={`backdrop-blur-md rounded-2xl p-5 relative overflow-hidden border ${
            overallStatus === 'critical' ? 'bg-gradient-to-b from-red-950/40 to-slate-900/40 border-red-900/50 shadow-[0_0_30px_rgba(220,38,38,0.08)]' :
            overallStatus === 'warning' ? 'bg-gradient-to-b from-amber-950/30 to-slate-900/40 border-amber-900/40' :
            'bg-gradient-to-b from-emerald-950/30 to-slate-900/40 border-emerald-900/40'}`}>
            <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent ${overallStatus === 'critical' ? 'via-red-500' : overallStatus === 'warning' ? 'via-amber-500' : 'via-emerald-500'} to-transparent opacity-70`} />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <h2 className="text-base font-semibold flex items-center gap-2 text-white">
                <BrainCircuit className={`w-5 h-5 ${overallStatus === 'critical' ? 'text-red-400 animate-pulse' : overallStatus === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`} />
                AI Detection Status
              </h2>
              {overallStatus !== 'normal' && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                  overallStatus === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                  {overallStatus === 'critical' ? 'Act Now!' : 'Monitor'}
                </span>
              )}
            </div>
            <div className="bg-[#020617]/60 rounded-xl p-4 border border-slate-800/40 relative z-10">
              <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide font-medium">Current Status</p>
              <p className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${
                overallStatus === 'critical' ? 'from-red-400 to-rose-400' :
                overallStatus === 'warning' ? 'from-amber-400 to-orange-400' :
                'from-emerald-400 to-teal-400'}`}>{stressLabel}</p>
              <p className="text-xs text-slate-500 mt-2">Detected: Fish swimming to water surface rapidly</p>
              {/* Stress % bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                  <span>Stress Level</span><span className={statusColors[overallStatus]}>{stressLevel}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${
                    overallStatus === 'critical' ? 'bg-gradient-to-r from-red-600 to-red-400' :
                    overallStatus === 'warning' ? 'bg-gradient-to-r from-amber-600 to-amber-400' :
                    'bg-gradient-to-r from-emerald-600 to-emerald-400'}`}
                    style={{ width: `${stressLevel}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Sensor Cards */}
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(RANGES).map(key => (
              <SensorCard key={key} sensorKey={key} value={sensors[key]} lastUpdated={lastUpdated} />
            ))}
          </div>

          {/* Recommended Actions */}
          <div className={`backdrop-blur-md rounded-2xl overflow-hidden border ${
            overallStatus === 'critical' ? 'border-red-900/50 bg-slate-900/40' :
            overallStatus === 'warning' ? 'border-amber-900/40 bg-slate-900/40' :
            'border-emerald-900/40 bg-slate-900/40'}`}>
            <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/60 flex items-center gap-2">
              <Zap className={`w-4 h-4 ${overallStatus === 'critical' ? 'text-red-400' : overallStatus === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`} />
              <h2 className="text-sm font-semibold text-slate-200">What Should I Do?</h2>
            </div>
            <div className="p-4 space-y-2.5">
              {actions.map((a, i) => (
                <div key={i} className={`flex items-start gap-3 p-2.5 rounded-xl ${a.urgent ? 'bg-red-500/8 border border-red-500/15' : 'bg-slate-800/30'}`}>
                  <span className="text-base flex-shrink-0 mt-0.5">{a.icon}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{a.step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700 transition-colors">
            <div className="px-4 py-3.5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-200">
                <Info className="w-4 h-4 text-blue-400" /> Recent Alerts
              </h2>
              <button className="text-[10px] text-blue-400 hover:text-blue-300 font-medium uppercase tracking-wider">View All</button>
            </div>
            <div className="divide-y divide-slate-800/50">
              {alertLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="p-3.5 hover:bg-slate-800/60 transition-colors group cursor-pointer">
                  <div className="flex items-start justify-between mb-1">
                    <span className={`text-xs font-semibold flex items-center gap-1.5 ${log.severity === 'critical' ? 'text-red-400' : 'text-amber-400'}`}>
                      <AlertTriangle className="w-3 h-3" />
                      {log.issue}
                    </span>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-[10px] text-slate-500">{log.time}</p>
                      <span className={`text-[9px] font-medium ${log.severity === 'critical' ? 'text-red-500' : 'text-amber-500'} uppercase`}>
                        {log.severity === 'critical' ? 'Act Now' : 'Monitor'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">Action: <span className="text-slate-400">{log.action}</span></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
