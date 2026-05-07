import React from 'react';
import { 
  Activity, 
  Thermometer, 
  Droplet, 
  Wind, 
  AlertTriangle,
  Camera,
  BrainCircuit,
  Info
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Mock data for the stress trend chart
const chartData = [
  { time: '00:00', stressLevel: 20 },
  { time: '04:00', stressLevel: 25 },
  { time: '08:00', stressLevel: 30 },
  { time: '12:00', stressLevel: 80 },
  { time: '16:00', stressLevel: 85 },
  { time: '20:00', stressLevel: 90 },
  { time: '24:00', stressLevel: 95 },
];

const alertLogs = [
  { id: 1, time: '10:25 AM', issue: 'Low Oxygen', action: 'Oxygen Pump Activated', severity: 'critical' },
  { id: 2, time: '09:10 AM', issue: 'Ammonia Spike', action: 'User Notified', severity: 'warning' },
  { id: 3, time: '08:15 AM', issue: 'Slight Temperature Drop', action: 'Heater Adjusted', severity: 'warning' },
];

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
      
      {/* Header */}
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Activity className="text-blue-500 w-8 h-8" />
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Fish Stress Monitoring System <span className="text-sm font-normal text-slate-400 ml-2 border border-slate-700 bg-slate-900 px-2 py-1 rounded-full">AI Powered</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2 text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Online
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300">Connected to Model: CNN-LSTM-v2</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Live Feed & AI Status */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Live Feed Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Camera className="w-5 h-5 text-slate-400" />
                Live Camera Stream
              </h2>
              <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20 font-medium">REC • Live</span>
            </div>
            
            <div className="relative aspect-video bg-slate-800 w-full overflow-hidden flex items-center justify-center group">
              {/* Placeholder Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 opacity-80 z-0"></div>
              
              <div className="relative z-10 flex flex-col items-center justify-center text-slate-500 group-hover:opacity-10 transition-opacity duration-300">
                <Camera className="w-16 h-16 mb-4 opacity-50" />
                <p>Camera feed initializing...</p>
              </div>

              {/* Mock Bounding Box */}
              <div className="absolute top-1/4 left-1/3 w-64 h-48 border-2 border-red-500 bg-red-500/10 z-20 transition-all duration-500">
                <div className="absolute -top-7 left-[-2px] bg-red-500 text-white text-xs font-bold px-2 py-1 flex items-center gap-1 shadow-lg">
                  <AlertTriangle className="w-3 h-3" />
                  Molly Fish: Hypoxia Detected
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-slate-400" />
                Stress Level Trend (24h)
              </h2>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="stressLevel" 
                    stroke="#f43f5e" 
                    strokeWidth={3}
                    dot={{ fill: '#f43f5e', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Sensors & Logs */}
        <div className="space-y-6">
          
          {/* AI Analysis Status Card */}
          <div className="bg-slate-900 border border-red-900/50 rounded-xl p-5 shadow-[0_0_15px_rgba(220,38,38,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-white">
              <BrainCircuit className="w-5 h-5 text-red-400" />
              AI Analysis Results
            </h2>
            <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
              <p className="text-sm text-slate-400 mb-1">Current Behavior Status (CNN-LSTM)</p>
              <p className="text-xl font-bold text-red-400 flex items-center gap-2">
                High Stress
              </p>
              <div className="mt-3 p-3 bg-red-500/10 rounded border border-red-500/20">
                <p className="text-sm text-red-200">
                  <span className="font-semibold">Detected:</span> Surface Gasping Detected
                </p>
              </div>
            </div>
          </div>

          {/* Sensor Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* pH Level */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <Droplet className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded">Normal</span>
              </div>
              <div>
                <p className="text-sm text-slate-400">pH Level</p>
                <h3 className="text-2xl font-bold text-white">7.2</h3>
              </div>
            </div>

            {/* Temperature */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <Thermometer className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded">Normal</span>
              </div>
              <div>
                <p className="text-sm text-slate-400">Temperature</p>
                <h3 className="text-2xl font-bold text-white">28°C</h3>
              </div>
            </div>

            {/* Ammonia */}
            <div className="bg-slate-900 border border-yellow-900/30 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500/50"></div>
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Wind className="w-5 h-5 text-yellow-400" />
                </div>
                <span className="text-xs font-medium text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">Warning</span>
              </div>
              <div>
                <p className="text-sm text-slate-400">Ammonia (NH3)</p>
                <h3 className="text-2xl font-bold text-white">0.05 <span className="text-sm font-normal text-slate-500">mg/L</span></h3>
              </div>
            </div>

            {/* Dissolved Oxygen */}
            <div className="bg-slate-900 border border-red-900/50 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden shadow-[0_0_10px_rgba(220,38,38,0.05)]">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Activity className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-xs font-medium text-red-400 bg-red-400/10 px-2 py-1 rounded animate-pulse">Critical</span>
              </div>
              <div>
                <p className="text-sm text-slate-400">Dissolved Oxygen</p>
                <h3 className="text-2xl font-bold text-red-400">3.5 <span className="text-sm font-normal text-red-400/50">mg/L</span></h3>
              </div>
            </div>
          </div>

          {/* Alert Logs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Info className="w-5 h-5 text-slate-400" />
                Recent Alerts
              </h2>
            </div>
            <div className="divide-y divide-slate-800/50">
              {alertLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <span className={`text-sm font-medium ${log.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'}`}>
                      {log.issue}
                    </span>
                    <span className="text-xs text-slate-500">{log.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Action: {log.action}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
