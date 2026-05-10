import React from 'react';
import {
  HeartPulse, AlertTriangle, Droplet, Thermometer, Wind, Activity, Info, BookOpen, Zap,
} from 'lucide-react';

const SAFE_RANGES = [
  { param: 'pH Level', safe: '7.0 – 8.5', ideal: '7.5 – 8.0', icon: Droplet, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', note: 'Molly fish prefer slightly alkaline water' },
  { param: 'Temperature', safe: '24°C – 29°C', ideal: '26°C – 28°C', icon: Thermometer, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', note: 'Avoid sudden changes > 2°C' },
  { param: 'Ammonia (NH₃)', safe: '0 – 0.02 mg/L', ideal: '0 mg/L', icon: Wind, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', note: 'Any detectable ammonia is harmful. Do water change immediately.' },
  { param: 'Turbidity', safe: '0 – 20 NTU', ideal: '< 10 NTU', icon: Droplet, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', note: 'High turbidity = dirty water, check filter' },
];

const EMERGENCY_STEPS = [
  {
    condition: '🚨 Fish Gasping at Surface (Hypoxia)',
    color: 'border-red-900/50 bg-red-950/20',
    headerColor: 'text-red-400',
    steps: [
      'Increase oxygen pump power immediately',
      'Do a 30% water change with aerated water',
      'Remove excess food/waste from tank floor',
      'Reduce temperature slightly (by 1–2°C) if > 29°C',
      'If no improvement in 1 hour, consult aquarium store',
    ],
  },
  {
    condition: '⚠️ Erratic / Darting Swimming (Chemical Stress)',
    color: 'border-amber-900/50 bg-amber-950/20',
    headerColor: 'text-amber-400',
    steps: [
      'Test ammonia and nitrite levels immediately',
      'Perform 30–40% water change using dechlorinated water',
      'Add water conditioner / detoxifier',
      'Check if any new chemicals/cleaning products near tank',
      'Remove carbon filter and replace with new one',
    ],
  },
  {
    condition: '💧 High Ammonia Levels',
    color: 'border-amber-900/40 bg-amber-950/15',
    headerColor: 'text-amber-300',
    steps: [
      'Do 20–25% water change immediately',
      'Stop feeding for 1–2 days',
      'Check filter is working properly',
      'Add beneficial bacteria supplement',
      'Test again after 24 hours',
    ],
  },
];

export default function CareGuideTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-pink-500/10 rounded-xl border border-pink-500/20">
          <HeartPulse className="w-6 h-6 text-pink-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Molly Fish Care Guide</h2>
          <p className="text-sm text-slate-400">Your daily reference for healthy aquarium management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Safe Parameter Ranges */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" /> Safe Water Parameters for Molly Fish
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {SAFE_RANGES.map((r, i) => {
              const Icon = r.icon;
              return (
                <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${r.border} ${r.bg}`}>
                  <div className={`p-1.5 rounded-lg ${r.bg} border ${r.border} flex-shrink-0`}>
                    <Icon className={`w-3.5 h-3.5 ${r.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{r.param}</span>
                      <div className="flex gap-2 text-right flex-shrink-0">
                        <span className={`text-xs font-bold ${r.color}`}>{r.ideal}</span>
                        <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">Ideal</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Safe range: {r.safe}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <Info className="w-2.5 h-2.5" /> {r.note}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Emergency Steps */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-red-400" /> Emergency Response Steps
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {EMERGENCY_STEPS.map((e, i) => (
              <div key={i} className={`border rounded-xl overflow-hidden ${e.color}`}>
                <div className="px-4 py-2.5 border-b border-slate-800/40">
                  <p className={`text-sm font-bold ${e.headerColor}`}>{e.condition}</p>
                </div>
                <ol className="p-4 space-y-2">
                  {e.steps.map((step, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-400 mt-0.5">{j + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
