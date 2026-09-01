import { useMemo, useState, useEffect } from 'react';
import { Activity, Calculator, Eye, Info, Zap, Radio, History as HistoryIcon } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import ProgressBar from '@/components/ui/ProgressBar';
import {
  BEHAVIOURS,
  FEED_FREQ,
  FEEDER,
  FOOD_TYPES,
  type FoodEntry,
} from '@/lib/data';
import { sendFeederTrigger, subscribeToFeeding } from '@/lib/firebase';
import type { PageProps } from './types';

export default function FeederPage({
  tanks,
  setTanks,
  feedLog,
  setFeedLog,
  totalFish,
  fedToday,
  activeFeedingFish,
}: PageProps) {
  const [foodType, setFoodType] = useState<keyof typeof FOOD_TYPES>('flake');
  const [calcCount, setCalcCount] = useState(totalFish || 6);
  const [calcBehaving, setCalcBehaving] = useState(activeFeedingFish || 0);
  const [freq, setFreq] = useState(2);
  const [quickGroup, setQuickGroup] = useState<number>(tanks[0]?.id ?? 1);
  const [triggering, setTriggering] = useState(false);
  const [liveDbActive, setLiveDbActive] = useState(false);

  // Live Firebase feeding state
  const [liveFeedNode, setLiveFeedNode] = useState<any>({
    dispensed: false,
    dispensed_amount: 0.0,
    daily_food_dispensed: 0.05,
    portion_per_turn: 0.05,
    reason: 'No hungry fish detected',
    hunger_level: 'Normal',
    hungry_count: 0,
    frames_analyzed: 294,
    presence_ratio: 0.136,
  });

  const [lastFed, setLastFed] = useState<{
    label: string;
    amt: number;
    feedingCount: number;
    time: string;
    skipped: boolean;
  } | null>(null);

  useEffect(() => {
    const unsubFeeding = subscribeToFeeding((data) => {
      if (data) {
        setLiveDbActive(true);
        const feed = data.feed || {};
        const hunger = data.hunger || {};

        setLiveFeedNode({
          dispensed: !!feed.dispensed,
          dispensed_amount: feed.dispensed_amount ?? 0.0,
          daily_food_dispensed: feed.daily_food_dispensed ?? 0.05,
          portion_per_turn: feed.portion_per_turn ?? 0.05,
          reason: feed.reason || 'No hungry fish detected',
          hunger_level: hunger.hunger_level || 'Normal',
          hungry_count: hunger.hungry_count ?? 0,
          frames_analyzed: hunger.frames_analyzed ?? 294,
          presence_ratio: hunger.presence_ratio ?? 0.136,
        });

        // Load complete feed history from Firebase RTDB (feeding/history)
        if (data.history && typeof data.history === 'object') {
          const entries: FoodEntry[] = Object.entries(data.history).map(([key, val]: [string, any], idx) => ({
            id: idx + 1,
            time: val.timestamp
              ? new Date(val.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
              : 'Just now',
            group: val.group || 'Main Display',
            food: (val.food in FOOD_TYPES ? val.food : 'flake') as keyof typeof FOOD_TYPES,
            behaviourCount: val.hungry_count ?? val.rounds ?? 1,
            amount: val.dispensed_amount ?? val.amount ?? 0.05,
            note: val.is_automatic ? 'automatic feed (top camera)' : 'manual override (cloud command)',
          }));
          if (entries.length > 0) setFeedLog(entries.reverse());
        }
      }
    });

    return () => {
      unsubFeeding();
    };
  }, []);

  const standardPerSession = +(FEEDER.gramsPerFish * calcCount / freq).toFixed(2);
  const standardPerDay = +(FEEDER.gramsPerFish * calcCount).toFixed(2);
  const behaviourRelease = +(FEEDER.behaviourGrams * calcBehaving).toFixed(2);
  const releaseAmount = +(liveFeedNode.hungry_count * FEEDER.behaviourGrams).toFixed(2);
  const totalGiven = useMemo(() => feedLog.reduce((s, l) => s + l.amount, 0), [feedLog]);

  async function doQuickFeed() {
    setTriggering(true);
    const group = tanks.find((t) => t.id === Number(quickGroup)) || tanks[0];
    const targetName = group ? group.name : 'Main Display';
    const amt = liveFeedNode.portion_per_turn || 0.05;
    const time = new Date().toLocaleTimeString('en', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Send real command to Firebase Realtime Database
    await sendFeederTrigger(targetName, amt);

    setFeedLog((prev) => [
      {
        id: Date.now(),
        time,
        group: `${targetName} ×${totalFish || 6}`,
        food: foodType,
        behaviourCount: 1,
        amount: amt,
        note: 'manual override (dispatched to RTDB)',
      },
      ...prev,
    ]);

    setLastFed({
      label: targetName,
      amt,
      feedingCount: 1,
      time,
      skipped: false,
    });
    setTriggering(false);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-ocean-800/60 pb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-gradient font-bold">
            Intelligent Behaviour Feeder
          </h1>
          <p className="font-mono text-xs text-ocean-400 mt-1">
            Top-camera hunger vision pipeline (`feeding/latest`) &amp; historical dispensing log
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ocean-900/80 border border-teal-500/30 text-xs font-mono text-teal-300">
            <Radio size={12} className={liveDbActive ? 'text-teal-400 animate-pulse' : 'text-ocean-500'} />
            Firebase Synced
          </span>
        </div>
      </header>

      {/* Live feeder status */}
      <GlassCard glow={liveFeedNode.hungry_count > 0 ? 'teal' : 'none'} className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-ocean-100 flex items-center gap-2 text-sm">
              <Eye size={16} className="text-cyan-300" />
              Vision Hunger Classifier (`feeding/latest/hunger`)
            </h2>
            <p className="text-xs font-mono text-ocean-400 mt-0.5">
              Source: Top Camera YOLOv8 Temporal Average · {liveFeedNode.frames_analyzed} frames analyzed
            </p>
          </div>
          <span className={liveFeedNode.hungry_count > 0 ? 'badge-fed' : 'badge-info'}>
            {liveFeedNode.hungry_count > 0 ? 'TRIGGERED' : 'STANDBY'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-ocean-950/50 border border-ocean-800/80 p-4">
            <span className="font-mono text-[10px] text-ocean-500 uppercase block mb-1">
              Hungry Fish Detected
            </span>
            <div className="font-display text-3xl text-teal-300">
              {liveFeedNode.hungry_count} fish
            </div>
            <p className="text-xs font-mono text-ocean-400 mt-1">
              Presence Ratio: {Math.round(liveFeedNode.presence_ratio * 100)}%
            </p>
          </div>

          <div className="rounded-xl bg-ocean-950/50 border border-ocean-800/80 p-4">
            <span className="font-mono text-[10px] text-ocean-500 uppercase block mb-1">
              Daily Dispensed Total
            </span>
            <div className="font-display text-3xl text-cyan-300">
              {liveFeedNode.daily_food_dispensed}g
            </div>
            <p className="text-xs font-mono text-ocean-400 mt-1">
              Portion / Turn: {liveFeedNode.portion_per_turn}g
            </p>
          </div>

          <div className="rounded-xl bg-ocean-950/50 border border-ocean-800/80 p-4">
            <span className="font-mono text-[10px] text-ocean-500 uppercase block mb-1">
              Dispense Decision Reason
            </span>
            <div className="font-semibold text-sm text-ocean-200 mt-1">
              {liveFeedNode.reason}
            </div>
            <p className="text-xs font-mono text-ocean-500 mt-1">
              Hunger Level: {liveFeedNode.hunger_level}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Quick feed trigger */}
      <GlassCard className="p-6">
        <h2 className="font-semibold text-ocean-100 mb-4 flex items-center gap-2 text-sm">
          <Zap size={16} className="text-cyan-300" /> Manual Override Trigger (`feeding/commands`)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="font-mono text-[10px] text-ocean-500 block mb-1.5 uppercase tracking-wider">
              Food Type Selection
            </label>
            <select
              className="select-field"
              value={foodType}
              onChange={(e) => setFoodType(e.target.value as keyof typeof FOOD_TYPES)}
            >
              {Object.entries(FOOD_TYPES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label} — {v.tip}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={doQuickFeed} disabled={triggering} className="btn-primary w-full flex items-center justify-center gap-2">
              <Zap size={14} /> {triggering ? 'Dispatching…' : 'Release 0.05g Now ↗'}
            </button>
          </div>
        </div>
        {lastFed && (
          <div className="mt-3 text-sm font-mono text-teal-300 flex items-center gap-2">
            <span>✓</span> {lastFed.amt}g dispatched to Firebase for {lastFed.label} at {lastFed.time}
          </div>
        )}
      </GlassCard>

      {/* Feed log directly loaded from Firebase RTDB (feeding/history) */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-ocean-100 text-sm flex items-center gap-2">
              <HistoryIcon size={16} className="text-cyan-300" />
              Firebase Operational Feed History (`feeding/history`)
            </h2>
            <p className="text-xs font-mono text-ocean-400 mt-0.5">
              Over {feedLog.length} recorded automatic and manual feed events
            </p>
          </div>
          <span className="text-xs font-mono text-teal-300 bg-teal-500/10 px-3 py-1 rounded-xl border border-teal-500/30">
            Total Logged: {totalGiven.toFixed(2)}g
          </span>
        </div>

        <div className="divide-y divide-ocean-800/40 max-h-96 overflow-y-auto pr-1">
          {feedLog.length === 0 && (
            <div className="py-10 text-center font-mono text-sm text-ocean-600">
              No feeds received from Firebase yet
            </div>
          )}
          {feedLog.map((entry) => (
            <div key={entry.id} className="flex items-center gap-3 py-3 text-xs">
              <div className="font-mono text-ocean-400 w-16 shrink-0">{entry.time}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ocean-200 truncate">{entry.group}</div>
                <div className="font-mono text-[10px] text-ocean-500">
                  {entry.behaviourCount} hungry fish · {entry.note}
                </div>
              </div>
              <span className="badge bg-ocean-500/15 text-ocean-300 border-ocean-500/25 shrink-0 font-mono text-[10px]">
                {FOOD_TYPES[entry.food]?.label || 'flake'}
              </span>
              <div className="font-mono text-sm text-teal-300 font-bold w-16 text-right shrink-0">
                {entry.amount.toFixed(2)}g
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
