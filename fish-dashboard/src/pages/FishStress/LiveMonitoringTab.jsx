import React, { useState, useEffect } from 'react';
import { Camera, Video, ImageIcon, Eye, EyeOff, Fish, Activity, Thermometer, Droplet, Wind, Clock } from 'lucide-react';

// Bounding box pools per camera
const TOP_BOXES = [
  { left: '22%', top: '18%', w: 80, h: 52, label: 'Swimming to Surface', conf: 94, color: '#ef4444' },
  { left: '52%', top: '42%', w: 70, h: 48, label: 'Normal', conf: 98, color: '#22c55e' },
  { left: '30%', top: '62%', w: 64, h: 44, label: 'Normal', conf: 96, color: '#22c55e' },
];
const FRONT_BOXES = [
  { left: '18%', top: '28%', w: 76, h: 52, label: 'Chemical Stress', conf: 87, color: '#f59e0b' },
  { left: '58%', top: '48%', w: 72, h: 50, label: 'Swimming to Surface', conf: 91, color: '#ef4444' },
  { left: '40%', top: '68%', w: 60, h: 40, label: 'Normal', conf: 99, color: '#22c55e' },
];

const BASE_SENSORS = { ph: 7.2, temperature: 28.4, ammonia: 0.05, turbidity: 12 };
const SENSOR_LABELS = {
  ph: { label: 'pH Level', unit: '', icon: Droplet, color: 'text-emerald-400' },
  temperature: { label: 'Temperature', unit: '°C', icon: Thermometer, color: 'text-blue-400' },
  ammonia: { label: 'Ammonia (NH₃)', unit: 'mg/L', icon: Wind, color: 'text-amber-400' },
  turbidity: { label: 'Turbidity', unit: 'NTU', icon: Activity, color: 'text-violet-400' },
};

function getStatus(key, val) {
  if (key === 'ammonia') return val > 0.05 ? 'critical' : val > 0.02 ? 'warning' : 'normal';
  if (key === 'turbidity') return val > 25 ? 'critical' : val > 20 ? 'warning' : 'normal';
  if (key === 'ph') return (val < 6.8 || val > 8.5) ? 'warning' : 'normal';
  if (key === 'temperature') return (val > 29 || val < 23) ? 'warning' : 'normal';
  return 'normal';
}

const STATUS_COLOR = { normal: 'text-emerald-400', warning: 'text-amber-400', critical: 'text-red-400' };
const TOOLTIP_STYLE = { backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc', fontSize: 11 };

export default function LiveMonitoringTab() {
  const [showBboxes, setShowBboxes] = useState(true);
  const [sensors, setSensors] = useState({ ...BASE_SENSORS });
  const [elapsed, setElapsed] = useState(0);
  const [detections, setDetections] = useState({
    total: 6, stressed: 3, normal: 3,
  });

  // Real-time sensor + detection simulation
  useEffect(() => {
    const sensorInterval = setInterval(() => {
      setSensors(prev => ({
        ph: +(prev.ph + (Math.random() - 0.5) * 0.06).toFixed(2),
        temperature: +(prev.temperature + (Math.random() - 0.5) * 0.2).toFixed(1),
        ammonia: +(Math.max(0, prev.ammonia + (Math.random() - 0.45) * 0.005)).toFixed(3),
        turbidity: +(Math.max(0, prev.turbidity + (Math.random() - 0.5) * 0.6)).toFixed(1),
      }));
      // randomly fluctuate stressed count by ±1 within 0-6
      setDetections(prev => {
        const stressed = Math.max(0, Math.min(6, prev.stressed + (Math.random() > 0.6 ? 1 : Math.random() > 0.4 ? -1 : 0)));
        return { total: 6, stressed, normal: 6 - stressed };
      });
      setElapsed(0);
    }, 3000);
    const counter = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => { clearInterval(sensorInterval); clearInterval(counter); };
  }, []);

  const statCards = [
    { label: 'Fish Detected', value: detections.total, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Normal', value: detections.normal, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Stressed', value: detections.stressed, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { label: 'Updated', value: `${elapsed}s`, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Live Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <div key={i} className={`bg-slate-900/40 backdrop-blur-md border ${s.border} rounded-xl p-4 text-center transition-all`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-slate-500 uppercase tracking-wide mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Dual Camera Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { title: 'Top Camera (Bird\'s Eye)', accent: 'text-blue-400', gradient: 'from-blue-950/30', boxes: TOP_BOXES },
          { title: 'Front Camera (Side View)', accent: 'text-cyan-400', gradient: 'from-cyan-950/30', boxes: FRONT_BOXES },
        ].map((cam, ci) => (
          <div key={ci} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/60 flex justify-between items-center">
              <h3 className={`text-sm font-semibold flex items-center gap-2 ${cam.accent}`}>
                <Camera className="w-4 h-4" /> {cam.title}
              </h3>
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />LIVE
              </span>
            </div>
            <div className={`relative aspect-video bg-slate-950`}>
              <div className={`absolute inset-0 bg-gradient-to-b ${cam.gradient} to-slate-950 opacity-60`} />
              {/* Animated water background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="absolute rounded-full border border-blue-400/40 animate-ping"
                    style={{ width: `${50 + i * 35}px`, height: `${50 + i * 35}px`, top: `${25 + i * 7}%`, left: `${20 + i * 18}%`, animationDuration: `${2.5 + i * 0.7}s`, animationDelay: `${i * 0.4}s` }} />
                ))}
              </div>
              {/* Fish silhouettes */}
              <div className="absolute text-4xl opacity-10" style={{ top: '40%', left: '45%', animation: 'float 5s ease-in-out infinite' }}>🐠</div>
              <div className="absolute text-2xl opacity-10" style={{ top: '60%', left: '25%', animation: 'float 7s ease-in-out infinite reverse' }}>🐟</div>
              {/* Bounding boxes */}
              {showBboxes && cam.boxes.map((box, bi) => (
                <div key={bi} className="absolute z-20"
                  style={{ left: box.left, top: box.top, width: box.w, height: box.h }}>
                  <div className="absolute inset-0 rounded-sm" style={{ border: `2px solid ${box.color}99`, backgroundColor: `${box.color}12` }} />
                  <div className="absolute top-0 left-0 w-2.5 h-2.5" style={{ borderTop: `2px solid ${box.color}`, borderLeft: `2px solid ${box.color}` }} />
                  <div className="absolute top-0 right-0 w-2.5 h-2.5" style={{ borderTop: `2px solid ${box.color}`, borderRight: `2px solid ${box.color}` }} />
                  <div className="absolute bottom-0 left-0 w-2.5 h-2.5" style={{ borderBottom: `2px solid ${box.color}`, borderLeft: `2px solid ${box.color}` }} />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5" style={{ borderBottom: `2px solid ${box.color}`, borderRight: `2px solid ${box.color}` }} />
                  <span className="absolute -top-6 left-0 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-sm whitespace-nowrap"
                    style={{ backgroundColor: box.color }}>
                    {box.label} {box.conf}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detection Table + Live Sensors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Detection Table */}
        <div className="lg:col-span-8 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-200">
              <Fish className="w-4 h-4 text-blue-400" /> Live Detection Results
            </h3>
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Updated {elapsed}s ago
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-800/50">
                  <th className="text-left px-5 py-3 font-medium">Fish ID</th>
                  <th className="text-left px-5 py-3 font-medium">Detected Behavior</th>
                  <th className="text-left px-5 py-3 font-medium">Confidence</th>
                  <th className="text-left px-5 py-3 font-medium">Position</th>
                  <th className="text-left px-5 py-3 font-medium">Camera</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {[
                  { id: 'F-001', behavior: 'Swimming to Surface', conf: 94, pos: 'Surface', cam: 'Top', color: '#ef4444' },
                  { id: 'F-002', behavior: 'Normal Swimming', conf: 98, pos: 'Middle', cam: 'Front', color: '#22c55e' },
                  { id: 'F-003', behavior: 'Normal Swimming', conf: 96, pos: 'Bottom', cam: 'Top', color: '#22c55e' },
                  { id: 'F-004', behavior: 'Erratic Darting', conf: Math.max(80, 87 + Math.round((Math.random() - 0.5) * 4)), pos: 'Bottom', cam: 'Front', color: '#f59e0b' },
                  { id: 'F-005', behavior: 'Swimming to Surface', conf: 91, pos: 'Surface', cam: 'Top', color: '#ef4444' },
                  { id: 'F-006', behavior: 'Normal Swimming', conf: 99, pos: 'Middle', cam: 'Front', color: '#22c55e' },
                ].map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-200">{d.id}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                        <span style={{ color: d.color }} className="font-medium text-xs">{d.behavior}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${d.conf}%`, backgroundColor: d.color }} />
                        </div>
                        <span className="text-xs text-slate-300">{d.conf}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{d.pos}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{d.cam} Cam</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Actions + Live Sensors */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Actions */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Camera Controls</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 hover:bg-red-500/20 transition-colors">
                <Video className="w-4 h-4" /> Start Recording
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm text-blue-400 hover:bg-blue-500/20 transition-colors">
                <ImageIcon className="w-4 h-4" /> Take Snapshot
              </button>
              <button
                onClick={() => setShowBboxes(!showBboxes)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-300 hover:bg-slate-800 transition-colors"
              >
                {showBboxes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showBboxes ? 'Hide' : 'Show'} Detection Boxes
              </button>
            </div>
          </div>

          {/* Live Sensor Readings */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Sensor Readings
            </h3>
            <div className="space-y-3">
              {Object.entries(sensors).map(([key, val]) => {
                const cfg = SENSOR_LABELS[key];
                const Icon = cfg.icon;
                const st = getStatus(key, val);
                return (
                  <div key={key} className="flex items-center justify-between py-1.5 border-b border-slate-800/40 last:border-0">
                    <span className="flex items-center gap-2 text-xs text-slate-400">
                      <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                      {cfg.label}
                    </span>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${STATUS_COLOR[st]}`}>
                        {val < 1 ? val.toFixed(3) : val} <span className="text-[10px] font-normal text-slate-500">{cfg.unit}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-600 mt-3 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Refreshes every 3 seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
