import React from 'react';
import { BrainCircuit, Cpu, Camera, Wifi, Activity, Clock, Zap, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { modelMetrics, confusionMatrix, detectionDistribution, systemInfo } from '../../data/mockData';

export default function ModelInsightsTab() {
  return (
    <div className="space-y-6">
      {/* Model Info + Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Model Info Card */}
        <div className="lg:col-span-4 bg-gradient-to-b from-blue-950/30 to-slate-900/40 backdrop-blur-md border border-blue-900/30 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <BrainCircuit className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{modelMetrics.modelName}</h3>
              <p className="text-[11px] text-slate-500">Object Detection & Classification</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Input Resolution', value: modelMetrics.inputResolution },
              { label: 'Inference FPS', value: `${modelMetrics.fps} fps` },
              { label: 'Avg Latency', value: modelMetrics.avgLatency },
              { label: 'Total Inferences', value: modelMetrics.totalInferences.toLocaleString() },
              { label: 'Last Trained', value: modelMetrics.lastTrained },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800/40 last:border-0">
                <span className="text-xs text-slate-400">{item.label}</span>
                <span className="text-sm font-medium text-slate-200">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Accuracy', value: modelMetrics.accuracy, color: '#22c55e' },
            { label: 'Precision', value: modelMetrics.precision, color: '#3b82f6' },
            { label: 'Recall', value: modelMetrics.recall, color: '#8b5cf6' },
            { label: 'F1-Score', value: modelMetrics.f1Score, color: '#06b6d4' },
          ].map((m, i) => (
            <div key={i} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 text-center">
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-3">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#1e293b" strokeWidth="6" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke={m.color} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${m.value * 2.136} ${213.6 - m.value * 2.136}`} />
                </svg>
                <span className="absolute text-lg font-bold text-white">{m.value}%</span>
              </div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Confusion Matrix + Detection Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Confusion Matrix */}
        <div className="lg:col-span-7 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5">
          <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2 mb-5">
            <Activity className="w-4 h-4 text-blue-400" />
            Confusion Matrix
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-2 text-[10px] text-slate-500"></th>
                  <th className="p-2 text-[10px] text-slate-500 text-center" colSpan={3}>Predicted</th>
                </tr>
                <tr>
                  <th className="p-2 text-[10px] text-slate-500"></th>
                  {confusionMatrix.labels.map((l, i) => (
                    <th key={i} className="p-2 text-[10px] text-slate-400 text-center font-medium">{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {confusionMatrix.data.map((row, ri) => (
                  <tr key={ri}>
                    <td className="p-2 text-[10px] text-slate-400 font-medium whitespace-nowrap">{confusionMatrix.labels[ri]}</td>
                    {row.map((val, ci) => {
                      const isDiag = ri === ci;
                      const maxVal = Math.max(...confusionMatrix.data.flat());
                      const opacity = val / maxVal;
                      return (
                        <td key={ci} className="p-1">
                          <div
                            className={`py-3 px-2 text-center rounded-lg text-sm font-bold transition-all ${isDiag ? 'text-white' : 'text-slate-400'}`}
                            style={{
                              backgroundColor: isDiag
                                ? `rgba(34, 197, 94, ${opacity * 0.4})`
                                : `rgba(239, 68, 68, ${opacity * 0.2})`,
                              border: `1px solid ${isDiag ? `rgba(34, 197, 94, ${opacity * 0.3})` : `rgba(239, 68, 68, ${opacity * 0.15})`}`,
                            }}
                          >
                            {val}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detection Distribution */}
        <div className="lg:col-span-5 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5">
          <h3 className="text-base font-semibold text-slate-200 mb-5">Detection Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={detectionDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                  {detectionDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {detectionDistribution.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                <span className="text-xs text-slate-400">{d.name} ({d.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Late Fusion Architecture Diagram */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6">
        <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2 mb-6">
          <Cpu className="w-4 h-4 text-blue-400" />
          Late Fusion Architecture
        </h3>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6">
          {/* CV Stream */}
          <div className="bg-blue-950/30 border border-blue-900/30 rounded-xl p-4 text-center w-full lg:w-48">
            <Camera className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">CV Stream</p>
            <p className="text-[10px] text-slate-500 mt-1">YOLOv8n Nano</p>
            <p className="text-[10px] text-slate-500">Behavior Detection</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-600 rotate-90 lg:rotate-0 flex-shrink-0" />
          {/* Fusion */}
          <div className="bg-gradient-to-b from-violet-950/30 to-slate-900/40 border border-violet-900/30 rounded-xl p-4 text-center w-full lg:w-56">
            <Zap className="w-6 h-6 text-violet-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">Late Fusion</p>
            <p className="text-[10px] text-slate-500 mt-1">Feature Concatenation</p>
            <p className="text-[10px] text-slate-500">Decision Layer</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-600 rotate-90 lg:rotate-0 flex-shrink-0" />
          {/* Decision */}
          <div className="bg-red-950/30 border border-red-900/30 rounded-xl p-4 text-center w-full lg:w-48">
            <Activity className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">Decision</p>
            <p className="text-[10px] text-slate-500 mt-1">Stress Classification</p>
            <p className="text-[10px] text-slate-500">Alert Generation</p>
          </div>
          {/* IoT Stream */}
          <div className="lg:absolute lg:relative bg-cyan-950/30 border border-cyan-900/30 rounded-xl p-4 text-center w-full lg:w-48 lg:-order-1 lg:hidden">
          </div>
        </div>
        {/* IoT below on separate row */}
        <div className="flex justify-center mt-4">
          <div className="bg-cyan-950/30 border border-cyan-900/30 rounded-xl p-4 text-center w-full lg:w-48">
            <Wifi className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">IoT Stream</p>
            <p className="text-[10px] text-slate-500 mt-1">pH, Temp, NH3, Turbidity</p>
            <p className="text-[10px] text-slate-500">Sensor Fusion</p>
          </div>
        </div>
      </div>

      {/* Hardware Status */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            System Hardware
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/50">
          {/* Raspberry Pi */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-white">Raspberry Pi</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 ml-auto">Online</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-400">CPU Temp</span><span className="text-slate-200">{systemInfo.raspberryPi.cpuTemp}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">CPU Usage</span><span className="text-slate-200">{systemInfo.raspberryPi.cpuUsage}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Memory</span><span className="text-slate-200">{systemInfo.raspberryPi.memory}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Uptime</span><span className="text-slate-200">{systemInfo.raspberryPi.uptime}</span></div>
            </div>
          </div>
          {/* Camera 1 */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">{systemInfo.camera1.name}</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-400">Status</span><span className="text-emerald-400">Online</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Resolution</span><span className="text-slate-200">{systemInfo.camera1.resolution}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">FPS</span><span className="text-slate-200">{systemInfo.camera1.fps}</span></div>
            </div>
          </div>
          {/* Camera 2 */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-white">{systemInfo.camera2.name}</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-400">Status</span><span className="text-emerald-400">Online</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Resolution</span><span className="text-slate-200">{systemInfo.camera2.resolution}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">FPS</span><span className="text-slate-200">{systemInfo.camera2.fps}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
