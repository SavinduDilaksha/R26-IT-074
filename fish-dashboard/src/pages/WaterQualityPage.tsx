import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Info,
  RefreshCw,
  Thermometer,
  TestTube,
  Wind,
  Shield,
  Zap,
  Radio,
  History as HistoryIcon,
  Droplets,
  Clock,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import ProgressBar from '@/components/ui/ProgressBar';
import StatusPill from '@/components/ui/StatusPill';
import {
  FORECAST,
  parseFirebaseHistory,
  type WaterQualityCycleHistory,
} from '@/lib/data';
import { subscribeToSensors, subscribeToWaterQuality } from '@/lib/firebase';
import type { PageProps } from './types';

interface SensorItem {
  key: string;
  label: string;
  value: string;
  unit?: string;
  status: 'Optimal' | 'Elevated' | 'High' | 'Critical' | 'Low';
  color: string;
}

const INITIAL_SENSORS: SensorItem[] = [
  { key: 'temp', label: 'Temperature', value: '28.5', unit: '°C', status: 'Optimal', color: '#f97316' },
  { key: 'ph', label: 'pH Level', value: '6.65', unit: '', status: 'Optimal', color: '#3b82f6' },
  { key: 'ionconcentration', label: 'Ion Concentration (EC)', value: '477', unit: 'µS/cm', status: 'Optimal', color: '#eab308' },
  { key: 'turbidity', label: 'Turbidity', value: '1602.6', unit: 'ADC', status: 'Optimal', color: '#06b6d4' },
];

export default function WaterQualityPage(_props: PageProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [sensors, setSensors] = useState(INITIAL_SENSORS);
  const [liveDbActive, setLiveDbActive] = useState(false);
  const [lastSensorTimestamp, setLastSensorTimestamp] = useState<string>('2026-09-01T08:01:37.093061+00:00');
  const [historyCycles, setHistoryCycles] = useState<WaterQualityCycleHistory[]>([]);

  const [waterQualityState, setWaterQualityState] = useState<{
    status: string;
    badProbability: number;
    primaryFactor: string;
    actionableSolution: string;
    issueDetected: string;
    remediationSteps: string[];
    shapBackend: string;
    hoursUntilChange?: number;
  }>({
    status: 'Fair',
    badProbability: 0.2646,
    primaryFactor: 'PH',
    actionableSolution: 'Perform a partial water change to replenish carbonate buffer (KH) and raise pH.',
    issueDetected: 'Water pH has dropped to 5.75 (acidic, risk of beneficial bacteria crash).',
    remediationSteps: [
      'Perform a 20%–25% partial water change to replenish natural mineral buffers.',
      'Add a small mesh bag of crushed coral into filter chamber for steady, sustained buffering.',
      'Dose aquarium pH-Up buffer or diluted sodium bicarbonate in small increments.',
      'Vacuum accumulated organic detritus which produces acidic compounds as it decomposes.',
    ],
    shapBackend: 'KernelExplainer / TreeExplainer (SHAP)',
    hoursUntilChange: 52.9,
  });

  const [xaiFactors, setXaiFactors] = useState<Array<{ parameter: string; contribution: number; color: string; detail: string }>>([
    { parameter: 'Temperature (TEMP)', contribution: 37.4, color: '#f97316', detail: 'Temperature stable at 28.0°C in optimal tropical fish range.' },
    { parameter: 'Acidity (PH)', contribution: 31.1, color: '#f43f5e', detail: 'Water pH dropped to 5.75 (acidic, risk of beneficial bacteria crash).' },
    { parameter: 'Cloudiness (TURBIDITY)', contribution: 19.8, color: '#06b6d4', detail: 'Turbidity sensor: 1580.2 ADC. Minor suspended organic particles.' },
    { parameter: 'Ion Concentration (EC)', contribution: 11.7, color: '#eab308', detail: 'Dissolved mineral salts slightly elevated at 501 µS/cm (ideal: 100-500 µS/cm).' },
  ]);

  const latestSensorTimestampFormatted = useMemo(() => {
    const dt = new Date(lastSensorTimestamp || Date.now());
    return `${dt.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })} at ${dt.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  }, [lastSensorTimestamp]);

  useEffect(() => {
    const unsubSensors = subscribeToSensors((liveData) => {
      if (liveData) {
        setLiveDbActive(true);
        const tempVal = liveData.temperature ?? liveData.temp ?? 28.5;
        const phVal = liveData.ph ?? 6.65;
        const ecVal = liveData.ionconcentration ?? liveData.ec ?? 477;
        const turbVal = liveData.turbidity ?? 1602.6;
        if (liveData.timestamp) {
          setLastSensorTimestamp(liveData.timestamp);
        }

        setSensors([
          {
            key: 'temp',
            label: 'Temperature',
            value: typeof tempVal === 'number' ? tempVal.toFixed(1) : String(tempVal),
            unit: '°C',
            status: tempVal > 30 ? 'High' : tempVal < 24 ? 'Low' : 'Optimal',
            color: '#f97316',
          },
          {
            key: 'ph',
            label: 'pH Level',
            value: typeof phVal === 'number' ? phVal.toFixed(2) : String(phVal),
            unit: '',
            status: phVal < 6.5 ? 'Elevated' : phVal > 8.0 ? 'High' : 'Optimal',
            color: phVal < 6.5 ? '#f43f5e' : '#3b82f6',
          },
          {
            key: 'ionconcentration',
            label: 'Ion Concentration (EC)',
            value: typeof ecVal === 'number' ? ecVal.toFixed(0) : String(ecVal),
            unit: 'µS/cm',
            status: ecVal > 500 ? 'Elevated' : 'Optimal',
            color: '#eab308',
          },
          {
            key: 'turbidity',
            label: 'Turbidity',
            value: typeof turbVal === 'number' ? turbVal.toFixed(1) : String(turbVal),
            unit: 'ADC',
            status: turbVal < 1400 ? 'Elevated' : 'Optimal',
            color: '#06b6d4',
          },
        ]);
      }
    });

    const unsubWq = subscribeToWaterQuality((liveWq) => {
      if (liveWq) {
        setLiveDbActive(true);
        const wq = liveWq.water_quality || liveWq;
        const shap = liveWq.shap || {};

        const rawStatus = wq.water_quality_status || wq.water_quality || 'Good';
        const badProb = typeof wq.bad_probability === 'number' ? wq.bad_probability : 0.1574;
        const primFactor = shap.primary_factor || wq.most_contributed_feature || 'TURBIDITY';
        const issue = shap.issue_detected || wq.issue_detected || 'Water quality parameters within safe biological boundaries.';
        const solution = shap.actionable_solution || wq.actionable_solution || 'Perform a 20% partial water change and inspect mechanical filter media.';
        
        let steps = shap.remediation_steps || wq.remediation_steps;
        if (!steps || !Array.isArray(steps) || steps.length === 0) {
          if (primFactor.toUpperCase().includes('PH')) {
            steps = [
              'Perform a 20%–25% partial water change to replenish natural carbonate mineral buffers.',
              'Add a small mesh bag of crushed coral into filter chamber for steady, sustained buffering.',
              'Dose aquarium pH-Up buffer or diluted sodium bicarbonate in small increments.',
              'Vacuum accumulated organic detritus which produces acidic compounds as it decomposes.',
            ];
          } else if (primFactor.toUpperCase().includes('TURBIDITY')) {
            steps = [
              'Perform a 20% partial water change using dechlorinated, temperature-matched water.',
              'Rinse mechanical filter sponge/floss in old aquarium water to restore flow.',
              'Reduce feeding portions for 24 hours to prevent organic particulate accumulation.',
              'Add activated carbon or fine polishing pad to help bind fine suspended particles.',
            ];
          } else if (primFactor.toUpperCase().includes('TEMP')) {
            steps = [
              'Increase surface agitation / air stone bubbling (warm water holds significantly less dissolved oxygen).',
              'Install an aquarium cooling fan blowing across the water surface to induce evaporative cooling.',
              'Reduce aquarium LED lighting hours to minimize radiant heat transfer.',
            ];
          } else {
            steps = [
              'Perform a 20% partial water change to dilute dissolved mineral salts.',
              'Inspect chemical filtration media.',
            ];
          }
        }

        setWaterQualityState({
          status: rawStatus,
          badProbability: badProb,
          primaryFactor: primFactor,
          actionableSolution: solution,
          issueDetected: issue,
          remediationSteps: steps,
          shapBackend: shap.shap_backend || 'KernelExplainer / TreeExplainer (SHAP)',
          hoursUntilChange: wq.estimated_hours_until_water_change ?? 60.7,
        });

        // Parse real SHAP contribution percentages if present
        const contribs = shap.contribution_percentages || shap.feature_importance;
        if (contribs && typeof contribs === 'object') {
          const mapped = Object.entries(contribs).map(([param, val]) => {
            const numVal = Number(val);
            let color = '#3b82f6';
            let detail = `${param} contribution to prediction`;
            if (param.toUpperCase().includes('TEMP')) {
              color = '#f97316';
              detail = `Temperature factor contribution: ${numVal}% toward model score.`;
            } else if (param.toUpperCase().includes('PH')) {
              color = '#f43f5e';
              detail = `Water pH dropped below target buffer range (${numVal}% influence).`;
            } else if (param.toUpperCase().includes('TURBIDITY')) {
              color = '#06b6d4';
              detail = `Optical turbidity sensor reading (${numVal}% influence).`;
            } else if (param.toUpperCase().includes('ION')) {
              color = '#eab308';
              detail = `Conductivity and dissolved mineral salts (${numVal}% influence).`;
            }
            return {
              parameter: param,
              contribution: numVal,
              color,
              detail,
            };
          }).sort((a, b) => b.contribution - a.contribution);
          setXaiFactors(mapped);
        }

        // Parse historical cycles from Firebase RTDB (water_quality/history)
        if (liveWq.history && typeof liveWq.history === 'object') {
          const parsed = parseFirebaseHistory<WaterQualityCycleHistory>(liveWq.history);
          if (parsed.length > 0) {
            setHistoryCycles(parsed);
          }
        }
      }
    });

    return () => {
      unsubSensors();
      unsubWq();
    };
  }, []);

  function handleAnalysis() {
    setAnalyzing(true);
    setAnalysisDone(false);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalysisDone(true);
    }, 1200);
  }

  const isAlert = waterQualityState.badProbability >= 0.25 || waterQualityState.status === 'Critical' || waterQualityState.status === 'Poor';

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-ocean-800/60 pb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-gradient font-bold">
            Predictive Water Quality (XAI)
          </h1>
          <p className="font-mono text-xs text-ocean-400 mt-1">
            Explainable AI risk prediction · real-time IoT sensor analytics &amp; historical cycles
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ocean-900/80 border border-teal-500/30 text-xs font-mono text-teal-300">
            <Radio size={12} className={liveDbActive ? 'text-teal-400 animate-pulse' : 'text-ocean-500'} />
            Firebase RTDB: {liveDbActive ? 'Live Synced' : 'Connecting'}
          </span>
          <button onClick={handleAnalysis} disabled={analyzing} className="btn-ghost flex items-center gap-2 text-xs font-mono">
            <RefreshCw size={14} className={analyzing ? 'animate-spin' : ''} />
            Scan Sensors
          </button>
        </div>
      </header>

      {/* Dynamic Water Quality Banner driven by Firebase RTDB */}
      {isAlert ? (
        <GlassCard glow="rose" className="p-6 border-l-4 border-l-rose-500 bg-rose-950/20">
          <div className="flex flex-col md:flex-row gap-5 items-start md:items-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7 text-rose-400 animate-pulse-soft" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="badge bg-rose-500/20 text-rose-300 border-rose-500/40 font-mono">
                  ⚠ {waterQualityState.status.toUpperCase()} STATUS
                </span>
                <span className="text-xs font-mono text-ocean-400">
                  Bad Water Probability · {(waterQualityState.badProbability * 100).toFixed(1)}%
                </span>
                {waterQualityState.hoursUntilChange && (
                  <span className="text-xs font-mono text-teal-300/80 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                    Est. Water Change: in {waterQualityState.hoursUntilChange}h
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-rose-300">
                Primary Contributor: {waterQualityState.primaryFactor}
              </h3>
              <p className="text-sm text-ocean-300 mt-1 leading-relaxed">
                {waterQualityState.issueDetected}
              </p>
              <p className="text-xs text-teal-300 mt-1 font-mono">
                💡 Recommended Action: {waterQualityState.actionableSolution}
              </p>
            </div>
            <button
              onClick={handleAnalysis}
              disabled={analyzing}
              className="btn-ghost text-sm flex items-center gap-2 shrink-0"
            >
              {analyzing ? <RefreshCw size={14} className="animate-spin" /> : 'Deep XAI Scan'}
            </button>
          </div>

          <AnimatePresence>
            {analysisDone && (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-sm space-y-2"
              >
                <p className="font-bold text-cyan-300 flex items-center gap-2 font-mono text-xs uppercase">
                  <Info size={15} /> SHAP Remediation Actions ({waterQualityState.shapBackend})
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-ocean-200">
                  {waterQualityState.remediationSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      ) : (
        <GlassCard glow="teal" className="p-6 border-l-4 border-l-teal-500 bg-teal-950/20">
          <div className="flex flex-col md:flex-row gap-5 items-start md:items-center">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7 text-teal-300" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="badge bg-teal-500/20 text-teal-300 border-teal-500/40 font-mono">
                  ✓ {waterQualityState.status.toUpperCase()} WATER QUALITY
                </span>
                <span className="text-xs font-mono text-ocean-400">
                  Health Index · {((1 - waterQualityState.badProbability) * 100).toFixed(1)}% Pristine
                </span>
              </div>
              <h3 className="text-xl font-bold text-teal-300">
                All sensor parameters operating within safe aquatic thresholds
              </h3>
              <p className="text-sm text-ocean-400 mt-1 leading-relaxed">
                {waterQualityState.issueDetected} {waterQualityState.actionableSolution}
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Realtime Sensors (4 Primary Live Readings from Firebase) */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-ocean-800/60 pb-3">
          <div>
            <h3 className="text-base font-semibold flex items-center gap-2 text-ocean-100">
              <Activity className="w-5 h-5 text-cyan-300" /> Real-time IoT Sensor Data (`sensors/latest`)
            </h3>
            <p className="text-xs font-mono text-ocean-400 mt-0.5">
              Continuous probe measurements streamed from Raspberry Pi ADC hardware
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-ocean-400 flex items-center gap-1.5">
              <Clock size={12} className="text-teal-400" /> Latest Probe Sync:
              <span className="text-teal-300 font-semibold bg-ocean-900/90 px-2 py-0.5 rounded border border-ocean-700/60 shadow-sm">
                {latestSensorTimestampFormatted}
              </span>
            </span>
            <span className="font-mono text-xs text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/30 flex items-center gap-1.5">
              <Radio size={12} className="animate-pulse" /> Live Telemetry
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sensors.map((s, i) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-2xl border p-4 flex flex-col items-center text-center gap-2"
              style={{
                background: `${s.color}10`,
                borderColor: `${s.color}30`,
              }}
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner"
                style={{ background: `${s.color}20`, color: s.color }}
              >
                {s.key === 'temp' ? (
                  <Thermometer size={20} />
                ) : s.key === 'ph' ? (
                  <Droplets size={20} />
                ) : s.key === 'ionconcentration' ? (
                  <Zap size={20} />
                ) : (
                  <Activity size={20} />
                )}
              </div>
              <p className="text-[11px] font-mono text-ocean-400 uppercase tracking-wider">
                {s.label}
              </p>
              <p className="text-2xl font-bold font-mono text-ocean-100">
                {s.value}
                {s.unit && <span className="text-xs text-ocean-400 ml-1 font-normal">{s.unit}</span>}
              </p>
              <StatusPill status={s.status} />
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* XAI insights + factor breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard glow="cyan" className="lg:col-span-2 p-6 space-y-4">
          <h3 className="text-base font-semibold flex items-center gap-2 text-ocean-100">
            <Info size={18} className="text-cyan-300" /> Explainable AI Insights (SHAP Factor Contributions)
          </h3>
          <p className="text-xs font-mono text-ocean-400 mb-4">
            Percentage influence of individual chemical &amp; physical parameters on the water quality classification
          </p>
          <div className="space-y-4">
            {xaiFactors.map((f, i) => (
              <div key={f.parameter} className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-ocean-200 font-medium">{f.parameter}</span>
                  <span className="font-bold" style={{ color: f.color }}>
                    {f.contribution.toFixed(1)}%
                  </span>
                </div>
                <ProgressBar value={f.contribution} color={f.color} height={8} />
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-ocean-950/60 border border-ocean-800/60 mt-4 text-xs font-mono text-ocean-300">
            <p className="text-teal-300 font-semibold mb-1">Natural Language Explanation:</p>
            <p className="text-ocean-300 leading-relaxed">
              High temperature (28°C) acts as a stabilizing baseline. Low acidic pH (5.75) is the primary driver of risk probability, followed by suspended particulate turbidity (1580 ADC) and dissolved salts (501 µS/cm).
            </p>
          </div>
        </GlassCard>

        {/* Step-by-Step Remediation Action Card */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-base font-semibold flex items-center gap-2 text-teal-300">
            <CheckCircle2 size={18} /> Actionable Remediation
          </h3>
          <p className="text-xs font-mono text-ocean-400">
            Automated prescription from SHAP attribution pipeline:
          </p>
          <div className="space-y-2.5">
            {waterQualityState.remediationSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-ocean-200">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Historical Cycles from Firebase RTDB (water_quality/history) */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-ocean-100 flex items-center gap-2">
            <HistoryIcon size={18} className="text-cyan-300" />
            Water Quality Historical Cycles (`water_quality/history`)
          </h3>
          <span className="badge-info font-mono text-xs">
            {historyCycles.length} Cycles Logged
          </span>
        </div>

        {historyCycles.length === 0 ? (
          <div className="p-6 text-center text-ocean-500 font-mono text-xs">
            No historical cycles loaded from Firebase yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {historyCycles.map((cycle, index) => {
              const dt = new Date(cycle.timestamp);
              const dateFormatted = dt.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
              const timeFormatted = dt.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              const badPct = Math.round((cycle.bad_probability || 0) * 100);
              const inputs = (cycle.inputs_used || {}) as Record<string, any>;

              const tempRaw = inputs.temp ?? inputs.TEMP ?? inputs.temperature ?? inputs.Temperature ?? '28.5';
              const phRaw = inputs.ph ?? inputs.PH ?? inputs.pH ?? (cycle.issue_detected?.match(/pH.*?([0-9]+\.[0-9]+)/i)?.[1] ?? '6.65');
              const ecRaw = inputs.ionconcentration ?? inputs.IONCONCENTRATION ?? inputs.ec ?? inputs.EC ?? '477';
              const turbRaw = inputs.turbidity ?? inputs.TURBIDITY ?? (cycle.issue_detected?.match(/Sensor:\s*([0-9]+(?:\.[0-9]+)?)/i)?.[1] ?? '1602.6');

              const tempDisplay = typeof tempRaw === 'number' ? tempRaw.toFixed(1) : String(tempRaw);
              const phDisplay = typeof phRaw === 'number' ? phRaw.toFixed(2) : String(phRaw);
              const ecDisplay = typeof ecRaw === 'number' ? ecRaw.toFixed(0) : String(ecRaw);
              const turbDisplay = typeof turbRaw === 'number' ? turbRaw.toFixed(1) : String(turbRaw);

              return (
                <div
                  key={cycle.id}
                  className="rounded-2xl border border-ocean-800/80 bg-ocean-950/40 p-5 space-y-3 hover:border-ocean-700 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-ocean-800/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2.5 py-0.5 rounded-lg">
                        {cycle.cycle_name || `Log #${index + 1}`}
                      </span>
                      <span className="text-[11px] font-mono text-ocean-400">
                        {dateFormatted} ({timeFormatted})
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-semibold ${
                        cycle.status === 'Good' || cycle.status === 'GOOD WATER QUALITY'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {cycle.status} (Risk: {badPct}%)
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-ocean-200">
                      <strong>Issue:</strong> {cycle.issue_detected || 'Parameters evaluated by SHAP explainer.'}
                    </p>
                    <p className="text-ocean-400">
                      <strong>Primary Factor:</strong>{' '}
                      <span className="text-amber-300 font-mono">{cycle.primary_factor || 'PH'}</span>
                    </p>
                    <p className="text-teal-300/90 text-[11px] pt-1">
                      💡 {cycle.actionable_solution || 'Maintain balanced buffering and biological filtration.'}
                    </p>
                  </div>

                  {/* 4 Sensor Telemetry Probe Boxes (Always rendered with rich colors) */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-ocean-800/40 text-[11px] font-mono text-center">
                    <div className="glass rounded-lg p-1.5 border border-orange-500/20 bg-orange-500/5">
                      <span className="text-ocean-500 block text-[9px]">Temp</span>
                      <span className="text-orange-300 font-bold">{tempDisplay}°C</span>
                    </div>
                    <div className="glass rounded-lg p-1.5 border border-rose-500/20 bg-rose-500/5">
                      <span className="text-ocean-500 block text-[9px]">pH</span>
                      <span className="text-rose-300 font-bold">{phDisplay}</span>
                    </div>
                    <div className="glass rounded-lg p-1.5 border border-amber-500/20 bg-amber-500/5">
                      <span className="text-ocean-500 block text-[9px]">Ion / EC</span>
                      <span className="text-amber-300 font-bold">{ecDisplay}</span>
                    </div>
                    <div className="glass rounded-lg p-1.5 border border-cyan-500/20 bg-cyan-500/5">
                      <span className="text-ocean-500 block text-[9px]">Turbidity</span>
                      <span className="text-cyan-300 font-bold">{turbDisplay}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
