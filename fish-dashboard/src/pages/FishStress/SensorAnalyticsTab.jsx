import React from 'react';
import { Droplet, Thermometer, Wind, Waves, Cpu, Wifi, WifiOff, Battery } from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { sensorHistory, sensorData, correlationData, systemInfo } from '../../data/mockData';

const sensorConfigs = [
  { key: 'ph', label: 'pH Level', color: '#22c55e', icon: Droplet, safeMin: 6.5, safeMax: 8.5, unit: '' },
  { key: 'temperature', label: 'Temperature', color: '#3b82f6', icon: Thermometer, safeMin: 24, safeMax: 28, unit: '°C' },
  { key: 'ammonia', label: 'Ammonia (NH3)', color: '#f59e0b', icon: Wind, safeMin: 0, safeMax: 0.02, unit: 'mg/L' },
  { key: 'turbidity', label: 'Turbidity', color: '#06b6d4', icon: Waves, safeMin: 0, safeMax: 25, unit: 'NTU' },
];

export default function SensorAnalyticsTab() {
  return (
    <div className="space-y-6">
      {/* Sensor Detail Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sensorConfigs.map((cfg) => {
          const data = sensorHistory[cfg.key];
          const current = sensorData[cfg.key] || sensorData.dissolvedO2;
          const Icon = cfg.icon;

          return (
            <div key={cfg.key} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg border" style={{ backgroundColor: `${cfg.color}15`, borderColor: `${cfg.color}30` }}>
                    <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{cfg.label}</h3>
                    <p className="text-[11px] text-slate-500">Safe: {cfg.safeMin} - {cfg.safeMax} {cfg.unit}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold" style={{ color: cfg.color }}>
                    {current.value} <span className="text-sm font-normal text-slate-500">{cfg.unit}</span>
                  </p>
                  <span className={`text-[10px] font-semibold uppercase ${current.status === 'normal' ? 'text-emerald-400' : current.status === 'warning' ? 'text-amber-400' : 'text-red-400'}`}>
                    {current.status}
                  </span>
                </div>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id={`grad-${cfg.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={cfg.color} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={cfg.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }}
                    />
                    <ReferenceLine y={cfg.safeMax} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.5} />
                    <Area type="monotone" dataKey="value" stroke={cfg.color} strokeWidth={2} fillOpacity={1} fill={`url(#grad-${cfg.key})`} activeDot={{ r: 4, fill: cfg.color, stroke: '#0f172a', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      {/* Correlation Chart */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            Parameter Correlation & Stress Impact
          </h3>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={correlationData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Line type="monotone" dataKey="stress" name="Stress %" stroke="#ef4444" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="ph" name="pH" stroke="#22c55e" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="temp" name="Temp" stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="turbidity" name="Turbidity" stroke="#06b6d4" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sensor Health + Late Fusion Score */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sensor Health Table */}
        <div className="lg:col-span-7 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-400" />
              Sensor Health Status
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-800/50">
                  <th className="text-left px-5 py-3 font-medium">Sensor</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Last Reading</th>
                  <th className="text-left px-5 py-3 font-medium">Battery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {systemInfo.sensors.map((sensor, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-200">{sensor.name}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 text-emerald-400 text-xs">
                        <Wifi className="w-3 h-3" /> Online
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{sensor.lastReading}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${sensor.battery}%` }} />
                        </div>
                        <span className="text-xs text-slate-400">{sensor.battery}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Late Fusion Score */}
        <div className="lg:col-span-5 bg-gradient-to-b from-blue-950/30 to-slate-900/40 backdrop-blur-md border border-blue-900/30 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-5">
            <Cpu className="w-4 h-4 text-blue-400" />
            Late Fusion Score
          </h3>

          {/* Score display */}
          <div className="text-center mb-6">
            <div className="relative inline-flex items-center justify-center w-32 h-32">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#1e293b" strokeWidth="8" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="url(#fusionGrad)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${78 * 3.27} ${327 - 78 * 3.27}`} />
                <defs>
                  <linearGradient id="fusionGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold text-white">78</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">/ 100</span>
              </div>
            </div>
            <p className="text-sm text-red-400 font-semibold mt-2">High Stress</p>
          </div>

          {/* Breakdown */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Computer Vision Score</span>
                <span className="text-blue-400 font-medium">82%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: '82%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">IoT Sensor Score</span>
                <span className="text-cyan-400 font-medium">74%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full" style={{ width: '74%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
