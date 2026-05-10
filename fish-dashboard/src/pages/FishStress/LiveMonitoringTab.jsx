import React, { useState } from 'react';
import { Camera, Video, ImageIcon, Eye, EyeOff, AlertTriangle, Fish } from 'lucide-react';
import { detectionEvents, sensorData } from '../../data/mockData';
import StatusBadge from '../../components/ui/StatusBadge';

export default function LiveMonitoringTab() {
  const [showBboxes, setShowBboxes] = useState(true);

  const stats = {
    total: detectionEvents.length,
    stressed: detectionEvents.filter(d => d.behavior !== 'Normal').length,
    normal: detectionEvents.filter(d => d.behavior === 'Normal').length,
  };

  return (
    <div className="space-y-6">
      {/* Detection Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Fish Detected', value: stats.total, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
          { label: 'Normal', value: stats.normal, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { label: 'Stressed', value: stats.stressed, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
          { label: 'FPS', value: '32', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-slate-500 uppercase tracking-wide mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Dual Camera Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Camera */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/60 flex justify-between items-center">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-200">
              <Camera className="w-4 h-4 text-blue-400" />
              Top Camera (Bird's Eye)
            </h3>
            <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              LIVE
            </span>
          </div>
          <div className="relative aspect-video bg-slate-950 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 to-slate-950 opacity-60"></div>
            <div className="relative z-10 flex flex-col items-center text-slate-600">
              <Camera className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-xs">Top View Stream</p>
            </div>
            {/* Bounding boxes */}
            {showBboxes && (
              <>
                <div className="absolute top-[20%] left-[25%] w-20 h-14 border-2 border-red-500/70 bg-red-500/10 z-20 rounded-sm">
                  <span className="absolute -top-5 left-0 text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded-sm font-bold">Hypoxia 94%</span>
                </div>
                <div className="absolute top-[45%] left-[55%] w-18 h-12 border-2 border-emerald-500/70 bg-emerald-500/10 z-20 rounded-sm">
                  <span className="absolute -top-5 left-0 text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-sm font-bold">Normal 98%</span>
                </div>
                <div className="absolute top-[65%] left-[35%] w-16 h-12 border-2 border-emerald-500/70 bg-emerald-500/10 z-20 rounded-sm">
                  <span className="absolute -top-5 left-0 text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-sm font-bold">Normal 96%</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Front Camera */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/60 flex justify-between items-center">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-200">
              <Camera className="w-4 h-4 text-cyan-400" />
              Front Camera (Side View)
            </h3>
            <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              LIVE
            </span>
          </div>
          <div className="relative aspect-video bg-slate-950 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 to-slate-950 opacity-60"></div>
            <div className="relative z-10 flex flex-col items-center text-slate-600">
              <Camera className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-xs">Front View Stream</p>
            </div>
            {showBboxes && (
              <>
                <div className="absolute top-[30%] left-[20%] w-22 h-16 border-2 border-amber-500/70 bg-amber-500/10 z-20 rounded-sm">
                  <span className="absolute -top-5 left-0 text-[9px] bg-amber-600 text-white px-1.5 py-0.5 rounded-sm font-bold">Chem. Stress 87%</span>
                </div>
                <div className="absolute top-[50%] left-[60%] w-20 h-14 border-2 border-red-500/70 bg-red-500/10 z-20 rounded-sm">
                  <span className="absolute -top-5 left-0 text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded-sm font-bold">Hypoxia 91%</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Detection List */}
        <div className="lg:col-span-8 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-200">
              <Fish className="w-4 h-4 text-blue-400" />
              Current Detections
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-800/50">
                  <th className="text-left px-5 py-3 font-medium">Fish ID</th>
                  <th className="text-left px-5 py-3 font-medium">Behavior</th>
                  <th className="text-left px-5 py-3 font-medium">Confidence</th>
                  <th className="text-left px-5 py-3 font-medium">Position</th>
                  <th className="text-left px-5 py-3 font-medium">Camera</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {detectionEvents.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-200">{d.id}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                        <span style={{ color: d.color }} className="font-medium">{d.behavior}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-300">{d.confidence}%</td>
                    <td className="px-5 py-3 text-slate-400">{d.position}</td>
                    <td className="px-5 py-3 text-slate-400">{d.camera}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-4 space-y-4">
          {/* Actions */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Quick Actions</h3>
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
                {showBboxes ? 'Hide' : 'Show'} Bounding Boxes
              </button>
            </div>
          </div>

          {/* Sensor Ticker */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Live Sensors</h3>
            <div className="space-y-3">
              {Object.entries(sensorData).map(([key, s]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{s.label}</span>
                  <span className={`text-sm font-semibold ${s.status === 'critical' ? 'text-red-400' : s.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {s.value} {s.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
