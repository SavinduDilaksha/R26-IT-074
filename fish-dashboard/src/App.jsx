import React from 'react';
import { 
  Activity, 
  Thermometer, 
  Droplet, 
  Wind, 
  AlertTriangle,
  Camera,
  BrainCircuit,
  Info,
  Settings,
  Bell
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
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
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-500/30 relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-slate-800/60 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <Activity className="text-blue-400 w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 flex items-center gap-3">
                Aquarium AI Dashboard
                <span className="text-[10px] sm:text-xs font-semibold text-blue-300 ml-2 border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 rounded-full tracking-wider uppercase">Live</span>
              </h1>
              <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  System Online
                </span>
                <span className="text-slate-700">•</span>
                Model: CNN-LSTM-v2
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Live Feed & Analytics */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Live Feed Section */}
            <div className="group bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-slate-700 hover:shadow-blue-900/5">
              <div className="px-5 py-3.5 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/60">
                <h2 className="text-base font-semibold flex items-center gap-2 text-slate-200">
                  <Camera className="w-4 h-4 text-blue-400" />
                  Live Computer Vision Feed
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider bg-red-500/10 text-red-400 px-2 py-1 rounded-md border border-red-500/20 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    REC
                  </span>
                </div>
              </div>
              
              <div className="relative aspect-video bg-slate-950 w-full overflow-hidden flex items-center justify-center">
                {/* Simulated water background gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 opacity-40 z-0"></div>
                
                <div className="relative z-10 flex flex-col items-center justify-center text-slate-600 transition-opacity duration-300">
                  <Camera className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm font-medium tracking-wide">Processing Video Stream...</p>
                </div>

                {/* Simulated Fish Bounding Box */}
                <div className="absolute top-1/4 left-1/3 w-64 h-48 z-20 group-hover:scale-[1.02] transition-transform duration-700 ease-in-out">
                  {/* Bounding box outline with glowing effect */}
                  <div className="absolute inset-0 border-2 border-red-500/80 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.3)]"></div>
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-400"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-400"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-400"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-400"></div>
                  
                  {/* Label */}
                  <div className="absolute -top-8 left-[-2px] bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-2.5 py-1.5 flex items-center gap-1.5 shadow-lg rounded-t-sm rounded-br-sm border border-red-400/50">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Molly Fish: Hypoxia (94%)
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Chart */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg transition-all duration-300 hover:border-slate-700 hover:shadow-blue-900/5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-base font-semibold flex items-center gap-2 text-slate-200">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Stress Level Trend (Last 24h)
                </h2>
                <select className="bg-slate-950 border border-slate-800 text-xs text-slate-400 rounded-md px-2 py-1 outline-none focus:border-slate-600">
                  <option>Last 24 Hours</option>
                  <option>Last 7 Days</option>
                </select>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                      itemStyle={{ color: '#ef4444', fontWeight: 600 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="stressLevel" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorStress)" 
                      activeDot={{ r: 6, fill: '#ef4444', stroke: '#0f172a', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Column: Status & Sensors */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* AI Analysis Status Card */}
            <div className="bg-gradient-to-b from-red-950/40 to-slate-900/40 backdrop-blur-md border border-red-900/50 rounded-2xl p-5 shadow-[0_0_30px_rgba(220,38,38,0.08)] relative overflow-hidden group">
              {/* Animated top border line */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-70"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h2 className="text-base font-semibold flex items-center gap-2 text-white">
                  <BrainCircuit className="w-5 h-5 text-red-400 animate-pulse" />
                  AI Analysis Results
                </h2>
                <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-red-500/30">Action Required</span>
              </div>
              
              <div className="bg-[#020617]/60 rounded-xl p-4 border border-red-900/30 relative z-10">
                <p className="text-xs text-slate-400 mb-1.5 uppercase tracking-wide font-medium">Current Status</p>
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400 flex items-center gap-2">
                  High Stress
                </p>
                <div className="mt-4 p-3.5 bg-red-500/10 rounded-lg border border-red-500/20 shadow-inner">
                  <p className="text-sm text-red-200 leading-relaxed">
                    <span className="font-semibold block mb-1 text-red-300">Observation:</span> 
                    Extended surface gasping detected across multiple specimens. High probability of hypoxia.
                  </p>
                </div>
              </div>
            </div>

            {/* Sensor Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* pH Level */}
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:bg-slate-800/40 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Droplet className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-500/20">NORMAL</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">7.2</h3>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide font-medium">pH Level</p>
                </div>
              </div>

              {/* Temperature */}
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:bg-slate-800/40 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Thermometer className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-500/20">NORMAL</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">28.4<span className="text-base text-slate-500 font-normal">°C</span></h3>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide font-medium">Temperature</p>
                </div>
              </div>

              {/* Ammonia */}
              <div className="bg-slate-900/40 backdrop-blur-md border border-amber-900/30 rounded-2xl p-4 flex flex-col justify-between hover:bg-slate-800/40 transition-colors group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl"></div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 group-hover:scale-110 transition-transform">
                    <Wind className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-500/20">WARNING</span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-amber-50 tracking-tight">0.05 <span className="text-sm font-normal text-slate-500">mg/L</span></h3>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide font-medium">Ammonia (NH3)</p>
                </div>
              </div>

              {/* Dissolved Oxygen */}
              <div className="bg-slate-900/40 backdrop-blur-md border border-red-900/50 rounded-2xl p-4 flex flex-col justify-between hover:bg-slate-800/40 transition-colors group relative overflow-hidden shadow-[0_4px_20px_rgba(220,38,38,0.05)]">
                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-red-500/10 rounded-full blur-2xl"></div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30 group-hover:scale-110 transition-transform">
                    <Activity className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 animate-pulse">CRITICAL</span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-red-400 tracking-tight">3.5 <span className="text-sm font-normal text-red-400/60">mg/L</span></h3>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide font-medium">Dissolved O2</p>
                </div>
              </div>
            </div>

            {/* Alert Logs */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition-colors">
              <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
                <h2 className="text-base font-semibold flex items-center gap-2 text-slate-200">
                  <Info className="w-4 h-4 text-blue-400" />
                  Recent Alerts
                </h2>
                <button className="text-[10px] text-blue-400 hover:text-blue-300 font-medium uppercase tracking-wider">View All</button>
              </div>
              <div className="divide-y divide-slate-800/50">
                {alertLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-slate-800/60 transition-colors group cursor-pointer">
                    <div className="flex items-start justify-between mb-1.5">
                      <span className={`text-sm font-semibold flex items-center gap-2 ${log.severity === 'critical' ? 'text-red-400' : 'text-amber-400'}`}>
                        {log.severity === 'critical' ? <AlertTriangle className="w-3.5 h-3.5" /> : <Wind className="w-3.5 h-3.5" />}
                        {log.issue}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">{log.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-blue-400 transition-colors"></span>
                      Auto-Action: <span className="text-slate-300">{log.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
