import React, { useState, useEffect } from 'react';
import { Droplet, Thermometer, Wind, Waves, Wifi, Clock, Activity } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { sensorHistory, systemInfo } from '../../data/mockData';

const BASE = { ph: 7.2, temperature: 28.4, ammonia: 0.05, turbidity: 12 };

const sensorConfigs = [
  { key: 'ph',          label: 'pH Level',       color: '#22c55e', icon: Droplet,      safeMin: 7.0, safeMax: 8.5, unit: '',      safeLabel: '7.0 – 8.5' },
  { key: 'temperature', label: 'Temperature',    color: '#3b82f6', icon: Thermometer,  safeMin: 24,  safeMax: 28,  unit: '°C',    safeLabel: '24 – 28°C' },
  { key: 'ammonia',     label: 'Ammonia (NH₃)', color: '#f59e0b', icon: Wind,         safeMin: 0,   safeMax: 0.02,unit: 'mg/L',  safeLabel: '0 – 0.02 mg/L' },
  { key: 'turbidity',   label: 'Turbidity',     color: '#06b6d4', icon: Waves,        safeMin: 0,   safeMax: 20,  unit: 'NTU',   safeLabel: '0 – 20 NTU' },
];

function getStatus(key, val) {
  if (key === 'ammonia')     return val > 0.05 ? 'critical' : val > 0.02 ? 'warning' : 'normal';
  if (key === 'turbidity')   return val > 25   ? 'critical' : val > 20   ? 'warning' : 'normal';
  if (key === 'ph')          return (val < 6.8 || val > 8.5) ? 'warning' : 'normal';
  if (key === 'temperature') return (val > 29 || val < 23) ? 'warning' : 'normal';
  return 'normal';
}

const TOOLTIP_STYLE = { backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc', fontSize: 11 };

export default function SensorAnalyticsTab() {
  const [live, setLive] = useState({ ...BASE });
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLive(prev => ({
        ph:          +(prev.ph + (Math.random() - 0.5) * 0.06).toFixed(2),
        temperature: +(prev.temperature + (Math.random() - 0.5) * 0.2).toFixed(1),
        ammonia:     +(Math.max(0, prev.ammonia + (Math.random() - 0.45) * 0.005)).toFixed(3),
        turbidity:   +(Math.max(0, prev.turbidity + (Math.random() - 0.5) * 0.6)).toFixed(1),
      }));
      setElapsed(0);
    }, 3000);
    const counter = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => { clearInterval(interval); clearInterval(counter); };
  }, []);

  return (
    <div className="space-y-6">
      {/* Live Sensor Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {sensorConfigs.map(cfg => {
          const val = live[cfg.key];
          const st = getStatus(cfg.key, val);
          const Icon = cfg.icon;
          const stColor = st === 'critical' ? 'text-red-400' : st === 'warning' ? 'text-amber-400' : 'text-emerald-400';
          const stBg = st === 'critical' ? 'bg-red-500/10 border-red-500/20' : st === 'warning' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20';
          return (
            <div key={cfg.key} className={`bg-slate-900/40 backdrop-blur-md border rounded-xl p-4 transition-all ${stBg}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${stColor}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${stColor}`}>{st}</span>
              </div>
              <p className={`text-xl font-bold ${stColor}`}>
                {val < 1 ? val.toFixed(3) : val}
                <span className="text-xs font-normal text-slate-500 ml-1">{cfg.unit}</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">{cfg.label}</p>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-600 flex items-center gap-1.5 -mt-3">
        <Clock className="w-3 h-3" /> Sensor readings update every 3 seconds · Last updated {elapsed}s ago
      </p>

      {/* 7-Day Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sensorConfigs.map((cfg) => {
          const histData = sensorHistory[cfg.key] || [];
          const Icon = cfg.icon;
          const curVal = live[cfg.key];
          const st = getStatus(cfg.key, curVal);
          const stColor = st === 'critical' ? '#ef4444' : st === 'warning' ? '#f59e0b' : cfg.color;

          return (
            <div key={cfg.key} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg border" style={{ backgroundColor: `${cfg.color}15`, borderColor: `${cfg.color}30` }}>
                    <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{cfg.label}</h3>
                    <p className="text-[11px] text-slate-500">Safe: {cfg.safeLabel}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold" style={{ color: stColor }}>
                    {curVal < 1 ? curVal.toFixed(3) : curVal}
                    <span className="text-sm font-normal text-slate-500 ml-1">{cfg.unit}</span>
                  </p>
                  <span className={`text-[10px] font-semibold uppercase ${st === 'critical' ? 'text-red-400' : st === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>{st}</span>
                </div>
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={histData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id={`grad-${cfg.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={stColor} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={stColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <ReferenceLine y={cfg.safeMax} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: 'Max Safe', position: 'insideTopRight', fontSize: 9, fill: '#ef444460' }} />
                    <Area type="monotone" dataKey="value" stroke={stColor} strokeWidth={2.5} fillOpacity={1} fill={`url(#grad-${cfg.key})`} activeDot={{ r: 4, fill: stColor, stroke: '#0f172a', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sensor Connection Status */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-400" /> Sensor Connection Status
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-800/50">
                <th className="text-left px-5 py-3 font-medium">Sensor</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Last Reading</th>
                <th className="text-left px-5 py-3 font-medium">Current Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {sensorConfigs.map((cfg, i) => {
                const val = live[cfg.key];
                const st = getStatus(cfg.key, val);
                const Icon = cfg.icon;
                return (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-200 flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                      {cfg.label}
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 text-emerald-400 text-xs">
                        <Wifi className="w-3 h-3" /> Online
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{elapsed}s ago</td>
                    <td className="px-5 py-3">
                      <span className={`text-sm font-bold ${st === 'critical' ? 'text-red-400' : st === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {val < 1 ? val.toFixed(3) : val} {cfg.unit}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
