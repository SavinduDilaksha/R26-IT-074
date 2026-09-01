import { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  Camera,
  Droplets,
  Eye,
  Sparkles,
  TrendingUp,
  Zap,
  Radio,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import MetricCard from '@/components/ui/MetricCard';
import ProgressBar from '@/components/ui/ProgressBar';
import StatusPill from '@/components/ui/StatusPill';
import {
  BEHAVIOURS,
  FEEDER,
  FORECAST,
} from '@/lib/data';
import {
  subscribeToSensors,
  subscribeToDisease,
  subscribeToWaterQuality,
  subscribeToBehavior,
} from '@/lib/firebase';
import type { PageProps } from './types';

export default function DashboardPage({
  tanks,
  totalFish,
  fedToday,
  activeFeedingFish,
  alerts,
  feedLog,
  onNavigate,
}: PageProps) {
  const [sensorsData, setSensorsData] = useState<any>({
    temperature: 28.0,
    ph: 5.75,
    ionconcentration: 501,
    turbidity: 1580.2,
  });

  const [diseaseBreakdown, setDiseaseBreakdown] = useState<any>({
    symptom_confidence: 0.90,
    visual_confidence: 0.72,
    fused_confidence: 0.45,
    disease: 'Bacterial gill disease',
  });

  const [waterQualitySnapshot, setWaterQualitySnapshot] = useState<any>({
    bad_probability: 0.2646,
    status: 'Fair',
    primary_factor: 'PH',
  });

  const [behaviorStress, setBehaviorStress] = useState<any>({
    tank_stress_score: 0.619,
    tank_stress_level: 'High Stress',
  });

  useEffect(() => {
    const unsubSensors = subscribeToSensors((data) => {
      if (data) {
        setSensorsData({
          temperature: data.temperature ?? data.temp ?? 28.0,
          ph: data.ph ?? 5.75,
          ionconcentration: data.ionconcentration ?? 501,
          turbidity: data.turbidity ?? 1580.2,
        });
      }
    });

    const unsubDisease = subscribeToDisease((data) => {
      if (data) {
        setDiseaseBreakdown({
          symptom_confidence: data.breakdown?.symptom_confidence ?? 0.90,
          visual_confidence: data.breakdown?.visual_confidence ?? (data.breakdown?.yolo_confidence || 0.72),
          fused_confidence: data.confidence ?? 0.45,
          disease: data.disease || 'Bacterial gill disease',
        });
      }
    });

    const unsubWq = subscribeToWaterQuality((data) => {
      if (data) {
        const wq = data.water_quality || data;
        const shap = data.shap || {};
        setWaterQualitySnapshot({
          bad_probability: wq.bad_probability ?? 0.2646,
          status: wq.water_quality ?? wq.water_quality_status ?? 'Fair',
          primary_factor: shap.primary_factor ?? 'PH',
        });
      }
    });

    const unsubBeh = subscribeToBehavior((data) => {
      if (data?.stress) {
        setBehaviorStress({
          tank_stress_score: data.stress.tank_stress_score ?? 0.619,
          tank_stress_level: data.stress.tank_stress_level ?? 'High Stress',
        });
      }
    });

    return () => {
      unsubSensors();
      unsubDisease();
      unsubWq();
      unsubBeh();
    };
  }, []);

  const releaseAmount = +(activeFeedingFish * FEEDER.behaviourGrams).toFixed(2);
  const stressPct = Math.round((behaviorStress.tank_stress_score || 0.619) * 100);
  const overallHealth = Math.max(25, 100 - stressPct);
  const cameraOnline = 2;
  const aiAccuracy = 94.2;
  const waterRiskNow = Math.round((waterQualitySnapshot.bad_probability || 0.265) * 100);
  const waterRiskPeak = Math.max(waterRiskNow, 52);
  const totalGiven = feedLog.reduce((s, l) => s + l.amount, 0);

  const sensorCards = [
    {
      label: 'Temperature',
      value: `${typeof sensorsData.temperature === 'number' ? sensorsData.temperature.toFixed(1) : sensorsData.temperature}°C`,
      status: sensorsData.temperature > 30 ? 'High' : 'Optimal',
    },
    {
      label: 'pH Level',
      value: `${typeof sensorsData.ph === 'number' ? sensorsData.ph.toFixed(2) : sensorsData.ph}`,
      status: sensorsData.ph < 6.5 ? 'Elevated' : 'Optimal',
    },
    {
      label: 'Ion Conc. (EC)',
      value: `${sensorsData.ionconcentration} µS/cm`,
      status: sensorsData.ionconcentration > 500 ? 'Elevated' : 'Optimal',
    },
    {
      label: 'Turbidity',
      value: `${sensorsData.turbidity} ADC`,
      status: 'Optimal',
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-ocean-800/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gradient">
              Smart Aquarium Operations
            </h1>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shrink-0">
              v2.4 PRO
            </span>
          </div>
          <p className="text-ocean-400 mt-1.5 text-xs sm:text-sm max-w-2xl font-sans leading-relaxed">
            Real-time IoT telemetry, YOLOv8 vision pipeline, predictive water quality XAI, and intelligent feeding dispatch.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="inline-flex items-center gap-2 bg-ocean-950/80 border border-teal-500/30 rounded-xl px-3.5 py-2">
            <Radio size={12} className="text-teal-400 animate-pulse" />
            <span className="text-teal-300 font-mono text-[11px] font-semibold uppercase tracking-wider">
              Firebase RTDB · Live
            </span>
          </span>
        </div>
      </header>

      {/* Top KPIs */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricCard
          label="Overall fish health"
          value={`${overallHealth}%`}
          icon={Activity}
          tone={overallHealth < 50 ? 'rose' : 'green'}
          hint={`Stress: ${stressPct}% (${behaviorStress.tank_stress_level})`}
        />
        <MetricCard
          label="Active alerts"
          value={alerts.filter((a) => a.severity === 'Critical' || a.severity === 'Warning').length}
          icon={AlertTriangle}
          tone="rose"
        />
        <MetricCard
          label="Cameras online"
          value={`0${cameraOnline}`}
          icon={Camera}
          tone="cyan"
          hint="Top & Front Cam (Pi 4)"
        />
        <MetricCard
          label="Water risk · Current"
          value={`${waterRiskNow}%`}
          icon={Droplets}
          tone="amber"
          hint={`Status: ${waterQualitySnapshot.status}`}
        />
        <MetricCard
          label="AI accuracy"
          value={`${aiAccuracy}%`}
          icon={Sparkles}
          tone="purple"
          hint="YOLOv8 + Sensor Fusion"
        />
      </section>

      {/* Two-column main */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Fusion AI capsule */}
        <GlassCard glow="purple" className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-plum-300">
              <Sparkles size={18} /> Multimodal Fusion
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-plum-500/20 text-plum-300 border border-plum-500/30">
              {diseaseBreakdown.disease}
            </span>
          </div>

          <div className="flex items-center justify-center my-2">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 via-teal-400 to-plum-500 flex items-center justify-center text-slate-950 text-xl font-bold animate-pulse-soft shadow-lg shadow-plum-500/30">
              AI
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-ocean-400">Camera signal</span>
                <span className="text-cyan-300 font-bold">{Math.round(diseaseBreakdown.visual_confidence * 100)}%</span>
              </div>
              <ProgressBar value={Math.round(diseaseBreakdown.visual_confidence * 100)} color="#22d3ee" height={6} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-ocean-400">NLP symptom match</span>
                <span className="text-plum-300 font-bold">{Math.round(diseaseBreakdown.symptom_confidence * 100)}%</span>
              </div>
              <ProgressBar value={Math.round(diseaseBreakdown.symptom_confidence * 100)} color="#c084fc" height={6} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-ocean-400">Fusion decision confidence</span>
                <span className="text-teal-300 font-bold">{Math.round(diseaseBreakdown.fused_confidence * 100)}%</span>
              </div>
              <ProgressBar value={Math.round(diseaseBreakdown.fused_confidence * 100)} color="#2dd4bf" height={6} />
            </div>
          </div>

          <button
            onClick={() => onNavigate('diagnostics')}
            className="btn-ghost w-full mt-4 text-xs font-mono"
          >
            Open Diagnostics →
          </button>
        </GlassCard>

        {/* Water quality snapshot */}
        <GlassCard glow="rose" className="xl:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2 text-ocean-100">
                <Droplets size={18} className="text-rose-300" /> Real-time Water Quality Snapshot
              </h2>
              <p className="text-xs font-mono text-ocean-400 mt-0.5">
                IoT Sensor readings streaming from Firebase `sensors/latest`
              </p>
            </div>
            <button
              onClick={() => onNavigate('water')}
              className="text-xs font-mono text-cyan-300 hover:text-cyan-200 transition-colors"
            >
              Full XAI →
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {sensorCards.map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-ocean-950/50 border border-ocean-800/80 p-3.5 flex flex-col items-center text-center gap-1.5"
              >
                <span className="font-mono text-[10px] text-ocean-400 uppercase">{s.label}</span>
                <span className="text-xl font-display font-bold text-ocean-100">
                  {s.value}
                </span>
                <StatusPill status={s.status as any} />
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-ocean-800/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-ocean-400 flex items-center gap-1.5 font-mono">
                <TrendingUp size={14} className="text-rose-400" />
                Predicted Risk Curve · Primary Contributor: <strong className="text-amber-300">{waterQualitySnapshot.primary_factor}</strong>
              </span>
              <span className="text-xs font-mono text-rose-300">
                now {waterRiskNow}% · peak {waterRiskPeak}%
              </span>
            </div>
            <div className="flex items-end h-24 gap-1.5">
              {FORECAST.map((p) => (
                <div key={p.time} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{
                      height: `${p.risk}%`,
                      background:
                        p.risk >= 70
                          ? 'linear-gradient(to top, #f43f5e, #fb7185)'
                          : p.risk >= 40
                            ? 'linear-gradient(to top, #fbbf24, #fde68a)'
                            : 'linear-gradient(to top, #2dd4bf, #5eead4)',
                    }}
                  />
                  <span className="text-[10px] font-mono text-ocean-500">{p.time}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Smart feeder capsule */}
        <GlassCard glow={activeFeedingFish > 0 ? 'teal' : 'none'} className="p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Zap size={18} className="text-teal-300" /> Smart Feeder
          </h2>
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs text-ocean-500">Status</span>
            <span
              className={
                activeFeedingFish > 0
                  ? 'badge-fed'
                  : 'badge-info'
              }
            >
              {activeFeedingFish > 0 ? 'TRIGGERED' : 'STANDBY'}
            </span>
          </div>
          <div className="rounded-xl bg-ocean-950/40 border border-white/10 p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] text-ocean-500 uppercase">Behaving fish</div>
                <div className="font-display text-2xl text-ocean-100">{activeFeedingFish}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] text-ocean-500 uppercase">Release</div>
                <div className="font-display text-2xl text-teal-300">{releaseAmount}g</div>
                <div className="font-mono text-[10px] text-ocean-600">
                  {activeFeedingFish} × {FEEDER.behaviourGrams}g
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            {tanks.slice(0, 3).map((t) => {
              const beh = BEHAVIOURS[t.behaviour];
              return (
                <div key={t.id} className="flex items-center gap-2 text-xs">
                  <span className="text-ocean-200 font-medium">{t.name}</span>
                  <span className="text-ocean-500 font-mono">×{t.count}</span>
                  <span
                    className="font-mono text-[10px] ml-auto"
                    style={{ color: beh?.color || '#2dd4bf' }}
                  >
                    {t.behaviour}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[11px] text-ocean-500">
            <span>Total today: {totalGiven.toFixed(2)}g</span>
            <span>Fed: {fedToday}/{totalFish}</span>
          </div>
          <button
            onClick={() => onNavigate('feeder')}
            className="btn-accent w-full mt-4 text-xs"
          >
            Open feeder
          </button>
        </GlassCard>

        {/* Live Behavior & Stress Overview */}
        <GlassCard className="xl:col-span-2 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-ocean-100">
              <Eye size={18} className="text-cyan-300" />
              Live Computer Vision &amp; Behavior Status
            </h2>
            <button
              onClick={() => onNavigate('vision')}
              className="text-xs font-mono text-teal-300 hover:text-teal-200"
            >
              Vision Monitor →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase text-ocean-500">Total Tracked Fish</span>
              <div className="text-2xl font-bold font-mono text-teal-300">{totalFish} Fish</div>
              <p className="text-[11px] text-ocean-400">YOLOv8 active multi-object tracking</p>
            </div>

            <div className="glass rounded-xl p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase text-ocean-500">Tank Stress Level</span>
              <div className="text-2xl font-bold font-mono text-rose-400">{stressPct} / 100</div>
              <p className="text-[11px] text-rose-300/80">{behaviorStress.tank_stress_level}</p>
            </div>

            <div className="glass rounded-xl p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase text-ocean-500">Primary Stress Driver</span>
              <div className="text-lg font-bold text-amber-300 truncate">pH Anomaly</div>
              <p className="text-[11px] text-ocean-400">50.2% late-fusion contribution</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
