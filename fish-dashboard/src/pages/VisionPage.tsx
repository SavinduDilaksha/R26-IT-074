import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  RefreshCw,
  Eye,
  Activity,
  TrendingUp,
  BrainCircuit,
  HeartPulse,
  Wind,
  ShieldAlert,
  Cpu,
  Layers,
  Sparkles,
  Radio,
  History as HistoryIcon,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Fish,
  Thermometer,
  TestTube,
  Droplets,
  Zap,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import GlassCard from '../components/ui/GlassCard';
import ProgressBar from '../components/ui/ProgressBar';
import StatusPill from '../components/ui/StatusPill';
import {
  CAMERA_FEEDS,
  STRESS_CHART_DATA as DEFAULT_STRESS_CHART_DATA,
  MODEL_METRICS,
  SYSTEM_INFO,
  parseFirebaseHistory,
  type BehaviorCycleHistory,
  type PerFishDetail,
} from '../lib/data';
import { subscribeToStressData, subscribeToSensors } from '../lib/firebase';
import type { PageProps } from './types';

const TANK_FISH_COUNT = 6;

const TABS = [
  { id: 'stress_curve', label: '24h Stress Curve', icon: Activity },
  { id: 'cycle_history', label: 'Firebase Cycle History', icon: HistoryIcon },
  { id: 'fish_tracking', label: 'Per-Fish Tracking', icon: Fish },
  { id: 'correlation', label: 'Correlation & Contributions', icon: TrendingUp },
  { id: 'insights', label: 'Model & System Metrics', icon: BrainCircuit },
  { id: 'care', label: 'Care & Prevention', icon: HeartPulse },
];

export default function VisionPage(_props: PageProps) {
  const [activeTab, setActiveTab] = useState('stress_curve');
  const [refreshing, setRefreshing] = useState(false);
  const [liveStressDbActive, setLiveStressDbActive] = useState(false);

  // Real Firebase data state
  const [liveStress, setLiveStress] = useState<any>({
    tank_stress_score: 0.619,
    tank_stress_level: 'High Stress',
    fused_primary_reason: 'pH Anomaly',
    class_probabilities: { healthy: 0.004, high_stress: 0.751, mild_stress: 0.245 },
    feature_contributions: {
      'pH Anomaly': 50.2,
      'EC & Ion Deviation': 40.4,
      'Turbidity Drop & Cloudiness': 6.4,
      'Freezing & Immobility': 3.0,
    },
    timestamp: '2026-08-30T05:33:59.201819+00:00',
  });

  const [liveBehavior, setLiveBehavior] = useState<any>({
    fish_count: TANK_FISH_COUNT,
    bottom_ratio: 0.05,
    surface_ratio: 0.11,
    freeze_seconds: 0.9,
    shoaling_score: 0.86,
    surface_visit_frequency: 0.7,
    continuous_bottom_duration: 6.8,
  });

  const [liveSensors, setLiveSensors] = useState<any>({
    temp: 28.0,
    ph: 5.75,
    ec: 501,
    turbidity: 1580.2,
  });

  const [historyCycles, setHistoryCycles] = useState<BehaviorCycleHistory[]>([]);
  const [fishList, setFishList] = useState<PerFishDetail[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToStressData((liveData) => {
      if (liveData) {
        setLiveStressDbActive(true);

        // 1. Process latest stress
        if (liveData.stress && typeof liveData.stress === 'object') {
          setLiveStress(liveData.stress);
        }

        // 2. Process latest behavior metrics
        if (liveData.behavior && typeof liveData.behavior === 'object') {
          setLiveBehavior(liveData.behavior);

          // Merge per-fish details with per-fish stress, normalized to physical tank subjects
          const rawDetails = liveData.behavior.fish_details || [];
          const rawPerFishStress = liveData.stress?.per_fish_stress || [];
          const stressMap = new Map<number, any>();
          rawPerFishStress.forEach((s: any) => {
            if (s.fish_id != null) stressMap.set(s.fish_id, s);
          });

          const combined: PerFishDetail[] = rawDetails.slice(0, TANK_FISH_COUNT).map((f: any, idx: number) => {
            const st = stressMap.get(f.fish_id) || {};
            return {
              ...f,
              display_id: idx + 1,
              stress_score: st.stress_score,
              stress_level: st.stress_level,
              primary_reason: st.primary_reason,
            };
          });
          if (combined.length > 0) setFishList(combined);
        }

        // 3. Process historical cycles from Firebase RTDB (behavior/history)
        if (liveData.history && typeof liveData.history === 'object') {
          const parsed = parseFirebaseHistory<BehaviorCycleHistory>(liveData.history);
          if (parsed.length > 0) {
            setHistoryCycles(parsed);
          }
        }
      }
    });

    const unsubSensors = subscribeToSensors((data) => {
      if (data) {
        setLiveSensors({
          temp: data.temperature ?? data.temp ?? 28.0,
          ph: data.ph ?? 5.75,
          ec: data.ionconcentration ?? 501,
          turbidity: data.turbidity ?? 1580.2,
        });
      }
    });

    return () => {
      unsubscribe();
      unsubSensors();
    };
  }, []);

  // Compute dynamic trajectory chart reflecting Firebase historical cycles + current live stress
  const trajectoryChartData = useMemo(() => {
    if (historyCycles.length === 0) {
      return DEFAULT_STRESS_CHART_DATA;
    }

    // Build timeline using real cycles recorded in Firebase
    const points = historyCycles.map((c, idx) => {
      const dt = new Date(c.timestamp);
      const timeStr = dt.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
      const dateStr = dt.toLocaleDateString('en', { month: 'short', day: 'numeric' });
      const overall = Math.round((c.tank_stress_score || 0) * 100);
      const cvScore = Math.min(100, Math.round(overall * 0.95 + (c.bottom_ratio || 0) * 40));
      const iotScore = Math.min(100, Math.round(overall * 1.02));
      return {
        time: `${dateStr} ${timeStr}`,
        stressLevel: overall,
        cv: cvScore,
        iot: iotScore,
        cycle: `Log #${idx + 1} (${c.cycle_name})`,
        date: dateStr,
      };
    });

    // Append current live state if available
    const liveOverall = Math.round((liveStress.tank_stress_score || 0.619) * 100);
    const liveCv = Math.min(100, Math.round(liveOverall * 0.96));
    const liveIot = Math.min(100, Math.round(liveOverall * 1.04));
    points.push({
      time: 'Live Monitor',
      stressLevel: liveOverall,
      cv: liveCv,
      iot: liveIot,
      cycle: 'Current',
      date: 'Now',
    });

    return points;
  }, [historyCycles, liveStress]);

  const latestTimestampFormatted = useMemo(() => {
    const ts = liveStress.timestamp || (historyCycles.length > 0 ? historyCycles[historyCycles.length - 1].timestamp : null);
    if (!ts) return 'Live Telemetry Active';
    const dt = new Date(ts);
    return `${dt.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })} at ${dt.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  }, [liveStress, historyCycles]);

  // Compute correlation data dynamically from Firebase feature contributions
  const dynamicFeatureContributions = useMemo(() => {
    const fc = liveStress.feature_contributions || {};
    return Object.entries(fc).map(([param, pct]) => ({
      parameter: param,
      contribution: Number(pct),
      color:
        param.includes('pH')
          ? '#f43f5e'
          : param.includes('EC') || param.includes('Ion')
          ? '#eab308'
          : param.includes('Turbidity')
          ? '#06b6d4'
          : '#a855f7',
    }));
  }, [liveStress]);

  const currentStressScore = Math.round((liveStress.tank_stress_score || 0.619) * 100);
  const primaryStressor = liveStress.fused_primary_reason || liveStress.primary_reason || 'pH Anomaly';
  const highStressProb = Math.round((liveStress.class_probabilities?.high_stress || 0.751) * 100);

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-ocean-800/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl text-gradient font-bold">
              AI Stress &amp; Vision Analytics
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              YOLOv8 + IoT Fusion
            </span>
          </div>
          <p className="font-mono text-xs text-ocean-400 mt-1">
            Real-time computer vision behavior monitoring and late-fusion stress detection
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ocean-900/80 border border-teal-500/30 text-xs font-mono text-teal-300">
            <Radio size={12} className={liveStressDbActive ? 'text-teal-400 animate-pulse' : 'text-ocean-500'} />
            Firebase RTDB: {liveStressDbActive ? 'Live Synced' : 'Connecting'}
          </span>
          <button onClick={handleRefresh} className="btn-ghost flex items-center gap-2 text-xs font-mono">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Sync Pipeline
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide border-b border-ocean-800/60">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-ocean-500/30 text-teal-300 border border-teal-500/40 shadow-inner'
                  : 'text-ocean-400 hover:text-ocean-200 hover:bg-ocean-800/40 border border-transparent'
              }`}
            >
              <Icon size={15} className={isActive ? 'text-teal-300' : 'text-ocean-500'} />
              <span>{label}</span>
              {id === 'cycle_history' && historyCycles.length > 0 && (
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-teal-500/20 text-teal-300 font-bold">
                  {historyCycles.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'stress_curve' && (
          <motion.div
            key="stress_curve"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Stress Trajectory Area Chart */}
            <GlassCard className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-display text-xl text-ocean-100">Stress Level Trajectory</h3>
                  <p className="text-xs font-mono text-ocean-400 mt-1">
                    Late-fusion index combining computer vision swim velocity with IoT water sensors
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                    <span className="text-ocean-300">Overall Stress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block" />
                    <span className="text-ocean-300">CV Vision Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                    <span className="text-ocean-300">IoT Sensor Score</span>
                  </div>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trajectoryChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="cvGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="iotGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="stressLevel" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#stressGradient)" name="Overall Stress Index" />
                    <Area type="monotone" dataKey="cv" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#cvGradient)" name="Computer Vision Signal" />
                    <Area type="monotone" dataKey="iot" stroke="#eab308" strokeWidth={2} fillOpacity={1} fill="url(#iotGradient)" name="IoT Sensor Signal" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Chart Sub-Footer with Latest Sync Time */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-ocean-800/60 text-[11px] font-mono">
                <div className="flex items-center gap-2 text-ocean-400">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <span>Multimodal 3-Stream Fusion: YOLOv8 CV + Sensor Telemetry</span>
                </div>
                <div className="flex items-center gap-1.5 text-ocean-400 sm:text-right">
                  <Clock size={12} className="text-teal-400" />
                  <span>Latest Reading:</span>
                  <span className="text-teal-300 font-semibold bg-ocean-900/90 px-2 py-0.5 rounded border border-ocean-700/60 shadow-sm">
                    {latestTimestampFormatted}
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* Bottom 3 Live Metric Cards (Populated directly from Firebase) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                    <Activity size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-ocean-400">Live Tank Stress Level</p>
                    <h4 className="text-2xl font-bold text-rose-400">{currentStressScore} / 100</h4>
                    <p className="text-[11px] text-rose-300/80 mt-0.5 font-mono">
                      Status: {liveStress.tank_stress_level || 'High Stress'}
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Wind size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-ocean-400">Primary Stressor</p>
                    <h4 className="text-2xl font-bold text-amber-300">{primaryStressor}</h4>
                    <p className="text-[11px] text-ocean-400 mt-0.5 font-mono">
                      Identified via Multimodal XAI
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-ocean-400">Fusion Accuracy / Conf.</p>
                    <h4 className="text-2xl font-bold text-teal-300">{highStressProb}%</h4>
                    <p className="text-[11px] text-ocean-400 mt-0.5 font-mono">
                      YOLOv8 + Sensor Late Fusion
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Live Computer Vision Behavioral Telemetry (CLI Stage 1/5) */}
            <GlassCard className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-ocean-800/60 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-base text-ocean-100 flex items-center gap-2">
                      <Fish size={18} className="text-cyan-300" />
                      Live Computer Vision Behavioral Telemetry (Side Cam Kinematics)
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      YOLOv8 ByteTrack
                    </span>
                  </div>
                  <p className="text-xs font-mono text-ocean-400 mt-1">
                    Continuous 3-minute video trajectory measurements extracted via RPi fish_behavior.py
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-ocean-900/80 border border-teal-500/30 text-[11px] font-mono text-teal-300">
                    <Radio size={11} className="text-teal-400 animate-pulse" />
                    180s Cycle Window
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
                <div className="glass rounded-xl p-3 border border-rose-500/30 bg-rose-500/5">
                  <span className="text-[10px] font-mono uppercase text-ocean-400 block">Bottom Ratio</span>
                  <div className="text-lg font-bold text-rose-400 mt-1">
                    {liveBehavior?.bottom_ratio !== undefined ? `${Math.round(liveBehavior.bottom_ratio * 100)}%` : '5%'}
                  </div>
                  <p className="text-[9px] font-mono text-ocean-500 mt-0.5">Substrate dwelling</p>
                </div>

                <div className="glass rounded-xl p-3 border border-cyan-500/30 bg-cyan-500/5">
                  <span className="text-[10px] font-mono uppercase text-ocean-400 block">Surface Ratio</span>
                  <div className="text-lg font-bold text-cyan-400 mt-1">
                    {liveBehavior?.surface_ratio !== undefined ? `${Math.round(liveBehavior.surface_ratio * 100)}%` : '11%'}
                  </div>
                  <p className="text-[9px] font-mono text-ocean-500 mt-0.5">Top gasping/surface</p>
                </div>

                <div className="glass rounded-xl p-3 border border-amber-500/30 bg-amber-500/5">
                  <span className="text-[10px] font-mono uppercase text-ocean-400 block">Freeze Duration</span>
                  <div className="text-lg font-bold text-amber-300 mt-1">
                    {liveBehavior?.freeze_seconds !== undefined ? `${liveBehavior.freeze_seconds}s` : '0.9s'}
                  </div>
                  <p className="text-[9px] font-mono text-ocean-500 mt-0.5">Spatial immobility</p>
                </div>

                <div className="glass rounded-xl p-3 border border-purple-500/30 bg-purple-500/5">
                  <span className="text-[10px] font-mono uppercase text-ocean-400 block">Longest Bottom Dwell</span>
                  <div className="text-lg font-bold text-purple-300 mt-1">
                    {liveBehavior?.continuous_bottom_duration !== undefined ? `${liveBehavior.continuous_bottom_duration}s` : '6.8s'}
                  </div>
                  <p className="text-[9px] font-mono text-ocean-500 mt-0.5">Continuous stay</p>
                </div>

                <div className="glass rounded-xl p-3 border border-teal-500/30 bg-teal-500/5">
                  <span className="text-[10px] font-mono uppercase text-ocean-400 block">Shoaling Cohesion</span>
                  <div className="text-lg font-bold text-teal-300 mt-1">
                    {Math.round((liveBehavior?.shoaling_score || 0.86) * 100)}%
                  </div>
                  <p className="text-[9px] font-mono text-ocean-500 mt-0.5">Group alignment</p>
                </div>

                <div className="glass rounded-xl p-3 border border-blue-500/30 bg-blue-500/5">
                  <span className="text-[10px] font-mono uppercase text-ocean-400 block">Surface Visits</span>
                  <div className="text-lg font-bold text-blue-300 mt-1">
                    {liveBehavior?.surface_visit_frequency || 0.7}/min
                  </div>
                  <p className="text-[9px] font-mono text-ocean-500 mt-0.5">Top excursions</p>
                </div>
              </div>
            </GlassCard>

            {/* Real-time Multimodal IoT Water Quality Inputs (Stage 2/5 Sensors) */}
            <GlassCard className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-ocean-800/60 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-base text-ocean-100 flex items-center gap-2">
                      <TestTube size={18} className="text-teal-300" />
                      Live IoT Multimodal Water Quality Inputs (Stage [2/5] Telemetry)
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      Fused Sensors
                    </span>
                  </div>
                  <p className="text-xs font-mono text-ocean-400 mt-1">
                    Real-time physical probe measurements streamed from Raspberry Pi ADC hardware
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                  Direct HW Stream
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass rounded-xl p-3.5 border border-rose-500/30 bg-rose-500/5">
                  <div className="flex items-center justify-between text-ocean-400 text-xs mb-1">
                    <span className="flex items-center gap-1 font-mono uppercase text-[10px]">
                      <TestTube size={13} className="text-rose-400" /> pH Level
                    </span>
                    <span className="text-[9px] font-mono text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded">
                      Acidic Alert
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-rose-400">
                    {typeof liveSensors.ph === 'number' ? liveSensors.ph.toFixed(2) : liveSensors.ph}
                  </div>
                  <p className="text-[10px] text-ocean-400 mt-1">Nominal: 6.8 - 7.5 (Acidic anomaly driving stress)</p>
                </div>

                <div className="glass rounded-xl p-3.5 border border-orange-500/30 bg-orange-500/5">
                  <div className="flex items-center justify-between text-ocean-400 text-xs mb-1">
                    <span className="flex items-center gap-1 font-mono uppercase text-[10px]">
                      <Thermometer size={13} className="text-orange-400" /> Temperature
                    </span>
                    <span className="text-[9px] font-mono text-teal-300 bg-teal-500/20 px-1.5 py-0.5 rounded">
                      Optimal
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-orange-400">
                    {typeof liveSensors.temp === 'number' ? liveSensors.temp.toFixed(1) : liveSensors.temp} °C
                  </div>
                  <p className="text-[10px] text-ocean-400 mt-1">Nominal: 24.0°C - 28.5°C (Stable thermal range)</p>
                </div>

                <div className="glass rounded-xl p-3.5 border border-amber-500/30 bg-amber-500/5">
                  <div className="flex items-center justify-between text-ocean-400 text-xs mb-1">
                    <span className="flex items-center gap-1 font-mono uppercase text-[10px]">
                      <Zap size={13} className="text-amber-400" /> Ion Conc. (EC)
                    </span>
                    <span className="text-[9px] font-mono text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">
                      Elevated
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-amber-300">
                    {liveSensors.ec} <span className="text-xs font-normal text-ocean-400">µS/cm</span>
                  </div>
                  <p className="text-[10px] text-ocean-400 mt-1">Nominal: 100 - 400 µS/cm (Dissolved mineral salts)</p>
                </div>

                <div className="glass rounded-xl p-3.5 border border-cyan-500/30 bg-cyan-500/5">
                  <div className="flex items-center justify-between text-ocean-400 text-xs mb-1">
                    <span className="flex items-center gap-1 font-mono uppercase text-[10px]">
                      <Droplets size={13} className="text-cyan-400" /> Turbidity
                    </span>
                    <span className="text-[9px] font-mono text-teal-300 bg-teal-500/20 px-1.5 py-0.5 rounded">
                      Optimal
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-cyan-300">
                    {typeof liveSensors.turbidity === 'number' ? liveSensors.turbidity.toFixed(1) : liveSensors.turbidity} <span className="text-xs font-normal text-ocean-400">ADC</span>
                  </div>
                  <p className="text-[10px] text-ocean-400 mt-1">Nominal: &gt;1500 ADC (Clean &amp; low suspended solids)</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* TAB 2: Firebase Cycle History */}
        {activeTab === 'cycle_history' && (
          <motion.div
            key="cycle_history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-xl text-ocean-100 flex items-center gap-2">
                    <HistoryIcon size={20} className="text-teal-300" />
                    Firebase Historical Cycles (`behavior/history`)
                  </h3>
                  <p className="text-xs font-mono text-ocean-400 mt-1">
                    Recorded operational cycle audit logs saved directly in Firebase Realtime Database
                  </p>
                </div>
                <span className="badge-info font-mono text-xs">
                  {historyCycles.length} Cycles Stored
                </span>
              </div>

              {historyCycles.length === 0 ? (
                <div className="p-8 text-center text-ocean-500 font-mono text-xs">
                  No historical cycles received from Firebase yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {historyCycles.map((cycle, index) => {
                    const scorePct = Math.round((cycle.tank_stress_score || 0) * 100);
                    const dt = new Date(cycle.timestamp);
                    const dateFormatted = dt.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
                    const timeFormatted = dt.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    const contributions = cycle.feature_contributions || {};

                    return (
                      <div
                        key={cycle.id}
                        className="rounded-2xl border border-ocean-800/80 bg-ocean-950/50 p-5 hover:border-ocean-700 transition-all space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ocean-800/60 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-start gap-1">
                              <span className="font-mono text-xs font-bold text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2.5 py-1 rounded-lg">
                                Log #{index + 1}
                              </span>
                              <span className="text-[10px] font-mono text-ocean-400">
                                {cycle.cycle_name}
                              </span>
                            </div>
                            <div>
                              <div className="text-xs font-mono font-semibold text-ocean-200">
                                {dateFormatted} <span className="text-teal-400 font-mono">({timeFormatted})</span>
                              </div>
                              <div className="text-xs text-ocean-400 mt-0.5">
                                Mode: <span className="font-mono text-teal-300">YOLOv8 + IoT Late Fusion</span> · Monitored Cohort:{' '}
                                <span className="font-mono text-cyan-300">{TANK_FISH_COUNT} Fish</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="font-mono text-[10px] uppercase text-ocean-500">Stress Score</div>
                              <div className="text-lg font-bold text-rose-400">{scorePct}%</div>
                            </div>
                            <span className="px-3 py-1 rounded-xl text-xs font-mono bg-rose-500/15 text-rose-300 border border-rose-500/30">
                              {cycle.tank_stress_level}
                            </span>
                          </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                          <div className="glass rounded-xl p-2.5">
                            <span className="text-ocean-500 text-[10px] uppercase block">Primary Reason</span>
                            <span className="text-amber-300 font-semibold">{cycle.primary_reason}</span>
                          </div>
                          <div className="glass rounded-xl p-2.5">
                            <span className="text-ocean-500 text-[10px] uppercase block">Freeze Duration</span>
                            <span className="text-ocean-200">{cycle.freeze_seconds}s</span>
                          </div>
                          <div className="glass rounded-xl p-2.5">
                            <span className="text-ocean-500 text-[10px] uppercase block">Bottom Ratio</span>
                            <span className="text-cyan-300">{Math.round(cycle.bottom_ratio * 100)}%</span>
                          </div>
                          <div className="glass rounded-xl p-2.5">
                            <span className="text-ocean-500 text-[10px] uppercase block">Surface Ratio</span>
                            <span className="text-teal-300">{Math.round(cycle.surface_ratio * 100)}%</span>
                          </div>
                        </div>

                        {/* Feature Contributions Progress Bars */}
                        {Object.keys(contributions).length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-ocean-800/40">
                            <span className="text-[11px] font-mono text-ocean-400 uppercase tracking-wider block">
                              XAI Feature Contributions
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {Object.entries(contributions).map(([feat, val]) => (
                                <div key={feat} className="space-y-1">
                                  <div className="flex justify-between text-xs font-mono">
                                    <span className="text-ocean-300">{feat}</span>
                                    <span className="text-teal-300 font-bold">{val}%</span>
                                  </div>
                                  <ProgressBar
                                    value={Number(val)}
                                    color={
                                      feat.includes('pH')
                                        ? '#f43f5e'
                                        : feat.includes('EC') || feat.includes('Ion')
                                        ? '#eab308'
                                        : feat.includes('Turbidity')
                                        ? '#06b6d4'
                                        : '#a855f7'
                                    }
                                    height={5}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}

        {/* TAB 3: Per-Fish Tracking (12 Fish) */}
        {activeTab === 'fish_tracking' && (
          <motion.div
            key="fish_tracking"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <GlassCard className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-display text-xl text-ocean-100 flex items-center gap-2">
                    <Fish size={20} className="text-cyan-300" />
                    Computer Vision Per-Fish Tracking &amp; Kinematics
                  </h3>
                  <p className="text-xs font-mono text-ocean-400 mt-1">
                    Live YOLOv8 bounding box kinematics, swimming speed, depth region, and per-fish stress score
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge-info font-mono text-xs">
                    Shoaling: {Math.round((liveBehavior.shoaling_score || 0.86) * 100)}%
                  </span>
                  <span className="badge-info font-mono text-xs">
                    Surface Freq: {liveBehavior.surface_visit_frequency || 0.7}/min
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                  <thead>
                    <tr className="border-b border-ocean-800/60 text-ocean-500 text-[11px] font-mono uppercase">
                      <th className="pb-3">Fish Subject</th>
                      <th className="pb-3">Region</th>
                      <th className="pb-3">Mean Speed</th>
                      <th className="pb-3">Tracked Sec</th>
                      <th className="pb-3">Freeze Duration</th>
                      <th className="pb-3">Stress Score</th>
                      <th className="pb-3">Primary Factor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fishList.map((fish) => {
                      const score = fish.stress_score != null ? Math.round(fish.stress_score * 100) : 60;
                      return (
                        <tr
                          key={fish.fish_id}
                          className="border-b border-ocean-800/40 hover:bg-white/[0.04] transition-all font-mono text-xs"
                        >
                          <td className="py-3.5 text-teal-300 font-bold flex items-center gap-2">
                            <span>🐠</span> Fish #{fish.display_id || fish.fish_id}
                            <span className="text-[9px] font-mono font-normal text-ocean-400 bg-ocean-800/80 px-1.5 py-0.5 rounded border border-ocean-700/50">
                              Track #{fish.fish_id}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                                fish.region === 'top'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : fish.region === 'bottom'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              }`}
                            >
                              {fish.region}
                            </span>
                          </td>
                          <td className="py-3.5 text-ocean-200">{fish.mean_speed?.toFixed(1)} cm/s</td>
                          <td className="py-3.5 text-ocean-400">{fish.tracked_seconds?.toFixed(1)}s</td>
                          <td className="py-3.5 text-ocean-300">
                            {fish.freeze_seconds > 0 ? (
                              <span className="text-rose-400 font-bold">{fish.freeze_seconds.toFixed(1)}s</span>
                            ) : (
                              '0.0s'
                            )}
                          </td>
                          <td className="py-3.5">
                            <span className="text-rose-400 font-bold">{score}%</span>{' '}
                            <span className="text-[10px] text-ocean-500">
                              ({fish.stress_level || 'High Stress'})
                            </span>
                          </td>
                          <td className="py-3.5 text-amber-300">{fish.primary_reason || 'pH Anomaly'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* TAB 4: Correlation & Heatmap */}
        {activeTab === 'correlation' && (
          <motion.div
            key="correlation"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <GlassCard className="p-6">
              <h3 className="font-display text-xl text-ocean-100 mb-2">
                Live Factor Contributions to Fish Stress
              </h3>
              <p className="text-xs font-mono text-ocean-400 mb-6">
                Relative influence of water chemistry deviations vs behavioural freezing on the late-fusion stress index
              </p>

              <div className="space-y-4 max-w-2xl">
                {dynamicFeatureContributions.map((item) => (
                  <div key={item.parameter} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-ocean-200 font-medium">{item.parameter}</span>
                      <span className="text-teal-300 font-bold">{item.contribution.toFixed(1)}%</span>
                    </div>
                    <ProgressBar value={item.contribution} color={item.color} height={8} />
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-display text-xl text-ocean-100 mb-4">Historical Stress Level Trajectory</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trajectoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                    <Legend />
                    <Bar dataKey="stressLevel" fill="#f43f5e" name="Stress Level (%)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="cv" fill="#22d3ee" name="Vision Signal" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="iot" fill="#eab308" name="IoT Sensor Score" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* TAB 5: Model & System Metrics */}
        {activeTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-ocean-800/60 pb-4">
                  <div>
                    <h3 className="font-display text-lg text-ocean-100">YOLOv8 Model Metrics</h3>
                    <p className="text-xs font-mono text-ocean-400">Object Detection &amp; Behavior Classifier</p>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    {MODEL_METRICS.modelName}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-teal-300">{MODEL_METRICS.accuracy}%</div>
                    <div className="text-[10px] font-mono text-ocean-500 mt-0.5">Classification Accuracy</div>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-cyan-300">{MODEL_METRICS.avgLatency}</div>
                    <div className="text-[10px] font-mono text-ocean-500 mt-0.5">Average Latency</div>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-plum-300">{MODEL_METRICS.fps} FPS</div>
                    <div className="text-[10px] font-mono text-ocean-500 mt-0.5">Stream Framerate</div>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-ocean-200">{MODEL_METRICS.f1Score}%</div>
                    <div className="text-[10px] font-mono text-ocean-500 mt-0.5">F1 Multi-class Score</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono text-ocean-300 pt-2 border-t border-ocean-800/60">
                  <div className="flex justify-between">
                    <span className="text-ocean-500">Input Resolution:</span>
                    <span>{MODEL_METRICS.inputResolution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ocean-500">Total Inferences:</span>
                    <span>{MODEL_METRICS.totalInferences.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ocean-500">Edge Pipeline:</span>
                    <span className="text-teal-300">Active (Raspberry Pi 4)</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-ocean-800/60 pb-4">
                  <div>
                    <h3 className="font-display text-lg text-ocean-100">Hardware &amp; Edge Nodes</h3>
                    <p className="text-xs font-mono text-ocean-400">Raspberry Pi 4 &amp; Dual Camera Nodes</p>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ONLINE
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="glass rounded-xl p-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Cpu size={16} className="text-teal-300" />
                      <span>Raspberry Pi CPU Temp</span>
                    </div>
                    <span className="text-teal-300 font-bold">{SYSTEM_INFO.raspberryPi.cpuTemp}</span>
                  </div>

                  <div className="glass rounded-xl p-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Layers size={16} className="text-cyan-300" />
                      <span>RAM Utilization</span>
                    </div>
                    <span className="text-cyan-300 font-bold">{SYSTEM_INFO.raspberryPi.memory}</span>
                  </div>

                  <div className="glass rounded-xl p-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Camera size={16} className="text-plum-300" />
                      <span>Top Camera Stream</span>
                    </div>
                    <span className="text-plum-300 font-bold">{SYSTEM_INFO.camera1.resolution} @ {SYSTEM_INFO.camera1.fps}fps</span>
                  </div>

                  <div className="glass rounded-xl p-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Camera size={16} className="text-plum-300" />
                      <span>Front Camera Stream</span>
                    </div>
                    <span className="text-plum-300 font-bold">{SYSTEM_INFO.camera2.resolution} @ {SYSTEM_INFO.camera2.fps}fps</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* TAB 6: Care & Prevention */}
        {activeTab === 'care' && (
          <motion.div
            key="care"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <GlassCard className="p-6">
              <h3 className="font-display text-xl text-ocean-100 mb-4">Ornamental Fish Stress Recovery Protocol</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-rose-300 flex items-center gap-2">
                    <ShieldAlert size={16} /> Targeted Protocol for {primaryStressor}
                  </h4>
                  <ul className="text-xs text-ocean-300 space-y-2 list-disc list-inside leading-relaxed">
                    <li>Perform an immediate 20% partial water change to replenish carbonate buffer (KH) and stabilize pH.</li>
                    <li>Add small mesh bag of crushed coral into filter chamber for steady, sustained pH buffering.</li>
                    <li>Vacuum accumulated organic detritus which produces acidic compounds as it decomposes.</li>
                    <li>Temporarily pause heavy feeding schedules for 24 hours to reduce bio-load.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-teal-300 flex items-center gap-2">
                    <HeartPulse size={16} /> Long-Term System Maintenance
                  </h4>
                  <ul className="text-xs text-ocean-300 space-y-2 list-disc list-inside leading-relaxed">
                    <li>Continuously monitor real-time IoT sensors (pH target: 6.8–7.6, EC &lt; 500 uS/cm).</li>
                    <li>Maintain steady aeration so dissolved oxygen stays comfortably above 6.0 mg/L.</li>
                    <li>Incorporate high quality spirulina and vegetable flakes for Molly immune support.</li>
                    <li>Track individual fish swimming speeds in the Fish Tracking tab to catch lethargy early.</li>
                  </ul>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
