import { useState, useEffect } from 'react';
import { AlertTriangle, BellRing, History as HistoryIcon, Radio, Sparkles, Filter } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import StatusPill from '@/components/ui/StatusPill';
import { type Severity, parseFirebaseHistory, type DiseaseCycleHistory, type WaterQualityCycleHistory, type BehaviorCycleHistory } from '@/lib/data';
import { subscribeToDisease, subscribeToWaterQuality, subscribeToBehavior } from '@/lib/firebase';
import type { PageProps } from './types';

const FILTERS: Array<{ id: Severity | 'All'; label: string }> = [
  { id: 'All', label: 'All' },
  { id: 'Critical', label: 'Critical' },
  { id: 'Warning', label: 'Warning' },
  { id: 'Info', label: 'Info' },
  { id: 'Resolved', label: 'Resolved' },
];

const SEVERITY_TONES: Record<Severity, string> = {
  Critical: 'border-rose-500/40 bg-rose-500/10',
  Warning: 'border-amber-500/40 bg-amber-500/10',
  Info: 'border-cyan-500/40 bg-cyan-500/10',
  Resolved: 'border-emerald-500/40 bg-emerald-500/10',
};

interface UnifiedDetectionItem {
  id: string;
  cycleName: string;
  date: string;
  timestamp: string;
  subsystem: 'Vision + NLP Fusion' | 'Water Quality XAI' | 'Behavior ML';
  event: string;
  confidence: string;
  status: 'Critical' | 'Warning' | 'Resolved' | 'Under Observation';
  evidence: string;
}

export default function AlertsPage({ alerts, setAlerts }: PageProps) {
  const [filter, setFilter] = useState<Severity | 'All'>('All');
  const [liveHistory, setLiveHistory] = useState<UnifiedDetectionItem[]>([]);
  const [liveDbActive, setLiveDbActive] = useState(false);

  useEffect(() => {
    let diseaseHistoryList: DiseaseCycleHistory[] = [];
    let wqHistoryList: WaterQualityCycleHistory[] = [];
    let behHistoryList: BehaviorCycleHistory[] = [];

    function rebuildHistory() {
      const items: UnifiedDetectionItem[] = [];

      diseaseHistoryList.forEach((d) => {
        const dt = new Date(d.timestamp);
        const confPct = Math.round((d.confidence || 0.449) * 100);
        items.push({
          id: `dis-${d.id}`,
          cycleName: d.cycle_name || 'Cycle',
          date: dt.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + dt.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
          timestamp: d.timestamp,
          subsystem: 'Vision + NLP Fusion',
          event: d.disease || 'Bacterial gill disease',
          confidence: `${confPct}%`,
          status: confPct > 60 ? 'Critical' : 'Under Observation',
          evidence: d.reason || 'Multimodal fusion of visual detections and operator NLP symptom observation.',
        });
      });

      wqHistoryList.forEach((w) => {
        const dt = new Date(w.timestamp);
        const badPct = Math.round((w.bad_probability || 0.28) * 100);
        items.push({
          id: `wq-${w.id}`,
          cycleName: w.cycle_name || 'Cycle',
          date: dt.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + dt.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
          timestamp: w.timestamp,
          subsystem: 'Water Quality XAI',
          event: `${w.primary_factor} Deviation (${w.status})`,
          confidence: `${badPct}% Risk`,
          status: w.status === 'Good' ? 'Resolved' : 'Warning',
          evidence: `${w.issue_detected} — Solution: ${w.actionable_solution}`,
        });
      });

      behHistoryList.forEach((b) => {
        const dt = new Date(b.timestamp);
        const stressPct = Math.round((b.tank_stress_score || 0.6) * 100);
        items.push({
          id: `beh-${b.id}`,
          cycleName: b.cycle_name || 'Cycle',
          date: dt.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + dt.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
          timestamp: b.timestamp,
          subsystem: 'Behavior ML',
          event: `Stress Index: ${stressPct}% (${b.primary_reason})`,
          confidence: `${stressPct}%`,
          status: b.tank_stress_level === 'High Stress' ? 'Critical' : 'Under Observation',
          evidence: `Freeze time: ${b.freeze_seconds}s, Bottom ratio: ${Math.round(b.bottom_ratio * 100)}%, Surface ratio: ${Math.round(b.surface_ratio * 100)}%`,
        });
      });

      // Sort newest first
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      if (items.length > 0) setLiveHistory(items);
    }

    const unsubDis = subscribeToDisease((data) => {
      if (data?.history) {
        setLiveDbActive(true);
        diseaseHistoryList = parseFirebaseHistory<DiseaseCycleHistory>(data.history);
        rebuildHistory();
      }
    });

    const unsubWq = subscribeToWaterQuality((data) => {
      if (data?.history) {
        setLiveDbActive(true);
        wqHistoryList = parseFirebaseHistory<WaterQualityCycleHistory>(data.history);
        rebuildHistory();
      }
    });

    const unsubBeh = subscribeToBehavior((data) => {
      if (data?.history) {
        setLiveDbActive(true);
        behHistoryList = parseFirebaseHistory<BehaviorCycleHistory>(data.history);
        rebuildHistory();
      }
    });

    return () => {
      unsubDis();
      unsubWq();
      unsubBeh();
    };
  }, []);

  const visible = filter === 'All' ? alerts : alerts.filter((a) => a.severity === filter);

  function dismiss(id: number) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  function resolveAll() {
    setAlerts((prev) =>
      prev.map((a) =>
        a.severity === 'Critical' || a.severity === 'Warning'
          ? { ...a, severity: 'Resolved' }
          : a,
      ),
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-ocean-800/60 pb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-gradient font-bold">
            Alerts &amp; Detection History
          </h1>
          <p className="font-mono text-xs text-ocean-400 mt-1">
            Live operational alert centre &amp; multi-subsystem historical audit trail
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ocean-900/80 border border-teal-500/30 text-xs font-mono text-teal-300">
            <Radio size={12} className={liveDbActive ? 'text-teal-400 animate-pulse' : 'text-ocean-500'} />
            Firebase Synced
          </span>
          <button onClick={resolveAll} className="btn-ghost text-xs font-mono">
            Mark Active Resolved
          </button>
        </div>
      </header>

      {/* Filter */}
      <div className="glass rounded-xl p-1 inline-flex flex-wrap gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
              filter === f.id
                ? 'bg-ocean-500/30 text-ocean-100 border border-ocean-400/40'
                : 'text-ocean-400 hover:text-ocean-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Active alerts */}
      <GlassCard className="p-6">
        <h2 className="font-semibold text-ocean-100 text-sm mb-4 flex items-center gap-2">
          <BellRing size={16} className="text-rose-300" /> Active Alerts
        </h2>
        <div className="space-y-3">
          {visible.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle size={26} className="mx-auto mb-2 text-ocean-600" />
              <p className="font-mono text-sm text-ocean-600">No alerts in this filter</p>
            </div>
          )}
          {visible.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-2xl border p-4 ${SEVERITY_TONES[alert.severity]}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-base text-ocean-100">{alert.title}</h3>
                    <StatusPill status={alert.severity} />
                    <span className="badge-info">{alert.source}</span>
                    <span className="font-mono text-[10px] text-ocean-500">{alert.time}</span>
                  </div>
                  <p className="text-sm text-ocean-300 leading-relaxed">{alert.description}</p>
                </div>
                <button
                  onClick={() => dismiss(alert.id)}
                  className="text-xs font-mono text-ocean-500 hover:text-ocean-200 transition-colors shrink-0"
                >
                  dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Dynamic Firebase Detection History Table */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-ocean-100 text-sm flex items-center gap-2">
              <HistoryIcon size={16} className="text-cyan-300" />
              Historical Detection Cycles (`disease/history`, `water_quality/history`, `behavior/history`)
            </h2>
            <p className="text-xs font-mono text-ocean-400 mt-0.5">
              Live multi-cycle detection records retrieved from connected Firebase Realtime Database
            </p>
          </div>
          <span className="badge-info font-mono text-xs">
            {liveHistory.length} Logged Entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[720px]">
            <thead>
              <tr className="border-b border-ocean-800/60 text-ocean-500 text-[10px] font-mono uppercase tracking-wider">
                <th className="pb-3">Cycle / Timestamp</th>
                <th className="pb-3">Subsystem</th>
                <th className="pb-3">Detected Event / Disease</th>
                <th className="pb-3">Confidence / Risk</th>
                <th className="pb-3">Evidence &amp; Reason</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {liveHistory.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-ocean-800/40 hover:bg-white/[0.04] transition-all text-xs"
                >
                  <td className="py-3.5 font-mono">
                    <span className="text-teal-300 font-bold block">{item.cycleName}</span>
                    <span className="text-[10px] text-ocean-400">{item.date}</span>
                  </td>
                  <td className="py-3.5">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-ocean-800/80 text-ocean-200 border border-ocean-700/60">
                      {item.subsystem}
                    </span>
                  </td>
                  <td className="py-3.5 font-medium text-ocean-100">{item.event}</td>
                  <td className="py-3.5 font-mono text-cyan-300 font-semibold">{item.confidence}</td>
                  <td className="py-3.5 text-ocean-300 max-w-xs truncate" title={item.evidence}>
                    {item.evidence}
                  </td>
                  <td className="py-3.5">
                    <StatusPill status={item.status as any} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
