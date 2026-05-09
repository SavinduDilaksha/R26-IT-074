import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, AlertTriangle, Info, CheckCircle2, Thermometer, Wind, TestTube, Activity, RefreshCw } from 'lucide-react';

import { GlassCard } from '../components/shared/GlassCard';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
  Area, AreaChart, ReferenceLine
} from 'recharts';

const xaiData = [
  { parameter: 'Ammonia',      contribution: 42, color: '#f43f5e' },
  { parameter: 'Dissolved O₂', contribution: 28, color: '#eab308' },
  { parameter: 'Temperature',  contribution: 18, color: '#f97316' },
  { parameter: 'pH Level',     contribution:  8, color: '#3b82f6' },
  { parameter: 'Turbidity',    contribution:  4, color: '#06b6d4' },
];

const forecastData = [
  { time: 'Now',  risk: 15 },
  { time: '+1h', risk: 28 },
  { time: '+2h', risk: 52 },
  { time: '+3h', risk: 85 },
  { time: '+4h', risk: 91 },
  { time: '+5h', risk: 96 },
];

export default function WaterQualityPage() {
  const [analyzing,    setAnalyzing]    = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);

  const handleAnalysis = () => {
    setAnalyzing(true); setAnalysisDone(false);
    setTimeout(() => { setAnalyzing(false); setAnalysisDone(true); }, 2000);
  };

  const CustomXAILabel = (props) => {
    const { x, y, width, value } = props;
    return (
      <text x={x + width + 5} y={y + 12} fill="white" fontSize={11} fontWeight="bold">
        {value}%
      </text>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gradient">Predictive Water Quality (XAI)</h2>
        <p className="text-muted-foreground mt-1">Explainable AI Risk Prediction &amp; Real-Time Sensor Analytics</p>
      </div>

      <GlassCard className="p-6 border-l-4 border-l-rose-500 bg-rose-950/20">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-8 h-8 text-rose-500 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider">⚠ Critical Alert</span>
              <span className="text-sm text-muted-foreground">ML Prediction Confidence: 94.2%</span>
            </div>
            <h3 className="text-xl font-bold text-rose-400">Harmful Water Condition Predicted within 3 Hours</h3>
            <p className="text-sm text-muted-foreground mt-1">
              The AI risk engine detected a rapid anomaly formation driven by ammonia buildup, low dissolved oxygen, and rising temperature.
            </p>
          </div>
          <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
            <button onClick={handleAnalysis} disabled={analyzing} className="px-5 py-2.5 border border-white/20 hover:bg-white/10 disabled:opacity-60 font-medium rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
              {analyzing ? <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing...</> : 'View Deep Analysis'}
            </button>
          </div>
        </div>

        <AnimatePresence>

          {analysisDone && (
            <motion.div key="analysis-done" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-sm space-y-1">
              <p className="font-bold text-cyan-400 flex items-center gap-2">
                <Info className="w-4 h-4" /> Deep Analysis Report — Harmful Condition Root Cause
              </p>
              <p className="text-white">🔴 <strong>Primary Factor: Ammonia (42% contribution)</strong> — spike detected due to organic waste decomposition.</p>
              <p className="text-white">🟡 <strong>Secondary: Dissolved O₂ (28%)</strong> — dropped to 4.8 mg/L, well below the 6.0 mg/L safety threshold.</p>
              <p className="text-white">🟠 <strong>Tertiary: Temperature (18%)</strong> — rose to 28.5°C, reducing oxygen solubility further.</p>
              <p className="text-muted-foreground text-xs mt-2">See the XAI chart and factor breakdown below for full parameter impact visualization.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" /> Real-Time IoT Sensor Data
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: Thermometer, label: 'Temperature', value: '28.5 °C', status: '↑ High', statusColor: 'text-rose-400', borderColor: 'border-rose-500/30', iconColor: '#f97316', bgColor: 'bg-rose-500/5' },
            { icon: Droplet, label: 'pH Level', value: '7.2', status: '✓ Optimal', statusColor: 'text-emerald-400', borderColor: 'border-emerald-500/30', iconColor: '#3b82f6', bgColor: 'bg-emerald-500/5' },
            { icon: Wind, label: 'Dissolved O₂', value: '4.8 mg/L', status: '↓ Critical', statusColor: 'text-rose-400', borderColor: 'border-rose-500/30', iconColor: '#eab308', bgColor: 'bg-rose-500/5' },
            { icon: TestTube, label: 'Ammonia', value: '0.50 ppm', status: '↑ Critical', statusColor: 'text-rose-400', borderColor: 'border-rose-500/30', iconColor: '#f43f5e', bgColor: 'bg-rose-500/5' },
            { icon: AlertTriangle, label: 'Turbidity', value: '12 NTU', status: '~ Elevated', statusColor: 'text-amber-400', borderColor: 'border-amber-500/30', iconColor: '#06b6d4', bgColor: 'bg-amber-500/5' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className={`p-4 ${s.bgColor} border ${s.borderColor} rounded-xl flex flex-col items-center text-center gap-1`}>
              <s.icon className="w-6 h-6 mb-1" style={{ color: s.iconColor }} />
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
              <p className="text-lg font-bold text-white">{s.value}</p>
              <span className={`text-[10px] font-semibold ${s.statusColor}`}>{s.status}</span>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-400" /> Explainable AI Insights — Why Harmful?
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Parameter contribution to the predicted harmful condition (%)</p>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={xaiData} layout="vertical" margin={{ top: 4, right: 60, left: 10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="rgba(255,255,255,0.08)" />
                <XAxis type="number" domain={[0, 50]} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="parameter" type="category" width={100} tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 600 }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', fontSize: 12 }} formatter={(value) => [`${value}% contribution`, 'XAI Impact']} />
                <Bar dataKey="contribution" radius={[0, 6, 6, 0]} barSize={28} label={<CustomXAILabel />}>
                  {xaiData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            {xaiData.map((d) => (
              <div key={d.parameter} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: d.color }}></span>
                {d.parameter} ({d.contribution}%)
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Factor Breakdown</h3>
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-rose-400 text-sm">🔴 Primary — Ammonia</span>
              <span className="text-xs font-bold bg-rose-500/30 text-rose-200 px-2 py-0.5 rounded-full">42%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: '42%' }} transition={{ delay: 0.3, duration: 0.8 }} className="h-full bg-rose-500 rounded-full" />
            </div>
            <p className="text-xs text-rose-200/80">Ammonia spiked to 0.50 ppm (safe limit: 0.02 ppm) — 25× above safe levels. Likely cause: organic waste decay.</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-amber-400 text-sm">🟡 Secondary — Dissolved O₂</span>
              <span className="text-xs font-bold bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-full">28%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: '28%' }} transition={{ delay: 0.5, duration: 0.8 }} className="h-full bg-amber-500 rounded-full" />
            </div>
            <p className="text-xs text-amber-200/80">DO dropped to 4.8 mg/L (safe limit: ≥6.0 mg/L). Accelerates ammonia toxicity and reduces fish respiration.</p>
          </div>
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-orange-400 text-sm">🟠 Tertiary — Temperature</span>
              <span className="text-xs font-bold bg-orange-500/30 text-orange-200 px-2 py-0.5 rounded-full">18%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: '18%' }} transition={{ delay: 0.7, duration: 0.8 }} className="h-full bg-orange-500 rounded-full" />
            </div>
            <p className="text-xs text-orange-200/80">Temperature rose to 28.5°C (+1.5°C above optimal). Reduces O₂ solubility and amplifies ammonia toxicity.</p>
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-400" /> Risk Level Forecast (Next 5 Hours)
          </h3>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 4, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Danger 70%', fill: '#f43f5e', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', fontSize: 12 }} formatter={(v) => [`${v}%`, 'Risk Level']} />
                <Area type="monotone" dataKey="risk" stroke="#f43f5e" strokeWidth={3} fill="url(#riskGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-400" /> AI Recommendations
          </h3>
          <div className="space-y-3">
            {[
              { icon: Wind, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', title: 'Increase Aeration', desc: 'Activate auxiliary air pumps to raise DO above 6.0 mg/L.' },
              { icon: TestTube, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', title: 'Ammonia Neutralizer', desc: 'Add 50 mL of Ammonia Binder per 100 gallons immediately.' },
              { icon: Thermometer, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', title: 'Gradual Cooling', desc: 'Engage chiller to reduce temp by 1.5°C over 4 hours.' },
            ].map((r, i) => (
              <div key={i} className={`flex gap-3 p-3 rounded-xl ${r.bg} border ${r.border}`}>
                <r.icon className={`w-5 h-5 ${r.color} shrink-0 mt-0.5`} />
                <div>
                  <p className="text-sm font-semibold">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
