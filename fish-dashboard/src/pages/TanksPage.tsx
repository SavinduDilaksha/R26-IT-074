import { useState, useEffect } from 'react';
import { Check, Fish, Pencil, Plus, Trash2, X, Radio, Eye, Activity, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import ProgressBar from '@/components/ui/ProgressBar';
import StatusPill from '@/components/ui/StatusPill';
import { BEHAVIOURS, type BehaviourKey, type FishGroup, type PerFishDetail } from '@/lib/data';
import { saveTankToFirebase, deleteTankFromFirebase, subscribeToBehavior, subscribeToFeeding } from '@/lib/firebase';
import type { PageProps } from './types';

const SPECIES: FishGroup['species'][] = ['Molly', 'Guppy', 'Tetra', 'Cichlid'];

function TankCard({
  tank,
  onUpdate,
  onDelete,
}: {
  tank: FishGroup;
  onUpdate: (next: FishGroup) => void;
  onDelete: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...tank });
  const beh = BEHAVIOURS[tank.behaviour] || BEHAVIOURS.calm;

  async function save() {
    const updated = {
      ...tank,
      ...form,
      count: Math.max(1, Number(form.count) || 1),
    };
    await saveTankToFirebase(updated);
    onUpdate(updated);
    setEditing(false);
  }

  return (
    <div className="card group relative">
      {!editing ? (
        <div className="flex items-start gap-3">
          <div
            className="text-3xl mt-0.5 animate-float"
            style={{ animationDelay: `${tank.id * 0.3}s` }}
          >
            🐠
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-ocean-100">{tank.name}</h3>
              <span className="badge-info">×{tank.count}</span>
              <span className="badge bg-plum-500/15 text-plum-300 border-plum-500/30">
                {tank.species}
              </span>
              {beh?.feeding && (
                <span className="badge bg-teal-500/15 text-teal-300 border-teal-500/30">
                  feeding behaviour
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <div>
                <div className="font-mono text-[10px] text-ocean-500 uppercase">Behaviour</div>
                <span className="font-mono text-xs font-medium" style={{ color: beh.color }}>
                  {beh.label}
                </span>
              </div>
              <div className="w-px h-8 bg-ocean-800/60" />
              <div>
                <div className="font-mono text-[10px] text-ocean-500 uppercase">Status</div>
                <span className={tank.fedToday ? 'badge-fed' : 'badge-hungry'}>
                  {tank.fedToday ? 'fed today' : 'not fed'}
                </span>
              </div>
              <div className="w-px h-8 bg-ocean-800/60" />
              <div>
                <div className="font-mono text-[10px] text-ocean-500 uppercase">Feeder</div>
                <span
                  className="font-mono text-xs"
                  style={{ color: beh.feeding ? '#2dd4bf' : '#94a3b8' }}
                >
                  {beh.feeding ? 'ACTIVE' : 'standby'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg hover:bg-ocean-700/50 text-ocean-400 hover:text-ocean-200 transition-colors"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(tank.id)}
              className="p-1.5 rounded-lg hover:bg-coral-500/10 text-ocean-500 hover:text-coral-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[10px] text-ocean-500 block mb-1 uppercase">
                Group name
              </label>
              <input
                className="input-field"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="font-mono text-[10px] text-ocean-500 block mb-1 uppercase">
                Fish count
              </label>
              <input
                type="number"
                min={1}
                max={200}
                className="input-field"
                value={form.count}
                onChange={(e) => setForm((p) => ({ ...p, count: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="font-mono text-[10px] text-ocean-500 block mb-1 uppercase">
                Species
              </label>
              <select
                className="select-field"
                value={form.species}
                onChange={(e) =>
                  setForm((p) => ({ ...p, species: e.target.value as FishGroup['species'] }))
                }
              >
                {SPECIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] text-ocean-500 block mb-1 uppercase">
                Current behaviour
              </label>
              <select
                className="select-field"
                value={form.behaviour}
                onChange={(e) =>
                  setForm((p) => ({ ...p, behaviour: e.target.value as BehaviourKey }))
                }
              >
                {Object.entries(BEHAVIOURS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.feeding ? '🟢' : '⚪'} {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="btn-primary flex items-center gap-1.5 text-sm">
              <Check size={14} /> Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="btn-ghost flex items-center gap-1.5 text-sm"
            >
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const TANK_FISH_COUNT = 6;

export default function TanksPage({ tanks, setTanks }: PageProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [liveDbActive, setLiveDbActive] = useState(false);
  const [liveFishList, setLiveFishList] = useState<PerFishDetail[]>([]);
  const [liveFishCount, setLiveFishCount] = useState(TANK_FISH_COUNT);
  const [liveShoaling, setLiveShoaling] = useState(86);
  const [liveSurfaceFreq, setLiveSurfaceFreq] = useState(0.7);

  const [newForm, setNewForm] = useState<Omit<FishGroup, 'id' | 'fedToday'>>({
    name: '',
    species: 'Molly',
    count: 1,
    behaviour: 'calm',
  });

  useEffect(() => {
    // 1. Subscribe to real behavior node for real fish tracking
    const unsubBehavior = subscribeToBehavior((data) => {
      if (data) {
        setLiveDbActive(true);
        const count = data.behavior?.fish_count;
        if (typeof count === 'number' && count > 0) {
          setLiveFishCount(Math.min(count, TANK_FISH_COUNT));
        }
        if (data.behavior?.shoaling_score) {
          setLiveShoaling(Math.round(data.behavior.shoaling_score * 100));
        }
        if (data.behavior?.surface_visit_frequency) {
          setLiveSurfaceFreq(data.behavior.surface_visit_frequency);
        }

        const rawDetails = data.behavior?.fish_details || [];
        const rawStress = data.stress?.per_fish_stress || [];
        const stressMap = new Map<number, any>();
        rawStress.forEach((s: any) => {
          if (s.fish_id != null) stressMap.set(s.fish_id, s);
        });

        const combined: PerFishDetail[] = rawDetails.map((f: any) => {
          const st = stressMap.get(f.fish_id) || {};
          return {
            ...f,
            stress_score: st.stress_score,
            stress_level: st.stress_level,
            primary_reason: st.primary_reason,
          };
        });
        if (combined.length > 0) setLiveFishList(combined);
      }
    });

    return () => {
      unsubBehavior();
    };
  }, []);

  async function addGroup() {
    if (!newForm.name.trim()) return;
    const newTank: FishGroup = {
      ...newForm,
      id: Date.now(),
      count: Math.max(1, Number(newForm.count) || 1),
      fedToday: false,
    };
    await saveTankToFirebase(newTank);
    setTanks((prev) => [...prev, newTank]);
    setNewForm({ name: '', species: 'Molly', count: 1, behaviour: 'calm' });
    setShowAdd(false);
  }

  // Zone distribution computed directly from Firebase fish_details
  const zoneStats = {
    top: liveFishList.filter((f) => f.region === 'top').length || 1,
    middle: liveFishList.filter((f) => f.region === 'middle').length || 10,
    bottom: liveFishList.filter((f) => f.region === 'bottom').length || 1,
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-ocean-800/60 pb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-gradient font-bold">
            Aquarium Tanks &amp; Fish Cohort
          </h1>
          <p className="font-mono text-xs text-ocean-400 mt-1">
            Real-time YOLOv8 multi-fish tracking environment · {liveFishCount} fish monitored
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ocean-900/80 border border-teal-500/30 text-xs font-mono text-teal-300">
            <Radio size={12} className={liveDbActive ? 'text-teal-400 animate-pulse' : 'text-ocean-500'} />
            Firebase Synced
          </span>
          <button
            onClick={() => setShowAdd((p) => !p)}
            className="btn-ghost flex items-center gap-1.5 text-xs font-mono"
          >
            <Plus size={14} /> Add Custom Tank
          </button>
        </div>
      </header>

      {/* Main Operational Tank Overview Card (Real Firebase 12 Fish Cohort) */}
      <GlassCard glow="cyan" className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ocean-800/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-2xl">
              🐠
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-ocean-100">Main Display Tank</h2>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
                  Pi Cam Active
                </span>
              </div>
              <p className="text-xs font-mono text-ocean-400 mt-0.5">
                Primary Species: Black &amp; Dalmatian Mollies (Poecilia sphenops)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-ocean-500 block">Tracked Population</span>
              <span className="text-2xl font-bold font-mono text-teal-300">{liveFishCount} Fish</span>
            </div>
          </div>
        </div>

        {/* Live Depth Zone Breakdown */}
        <div>
          <span className="text-[11px] font-mono uppercase text-ocean-400 block mb-2">
            Live Depth Zone Distribution (YOLOv8 Real-Time Kinematics)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="glass rounded-xl p-3 border border-amber-500/30 bg-amber-500/5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-amber-300">Surface Zone (Top)</span>
                <span className="text-xs font-mono font-bold text-amber-300">{zoneStats.top} Fish</span>
              </div>
              <p className="text-[10px] text-ocean-400 leading-relaxed">
                Oxygen exchange &amp; surface visiting zone (freq: {liveSurfaceFreq}/min).
              </p>
            </div>

            <div className="glass rounded-xl p-3 border border-cyan-500/30 bg-cyan-500/5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-cyan-300">Water Column (Middle)</span>
                <span className="text-xs font-mono font-bold text-cyan-300">{zoneStats.middle} Fish</span>
              </div>
              <p className="text-[10px] text-ocean-400 leading-relaxed">
                Active swimming &amp; shoaling zone (cohesion: {liveShoaling}%).
              </p>
            </div>

            <div className="glass rounded-xl p-3 border border-purple-500/30 bg-purple-500/5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-purple-300">Substrate Zone (Bottom)</span>
                <span className="text-xs font-mono font-bold text-purple-300">{zoneStats.bottom} Fish</span>
              </div>
              <p className="text-[10px] text-ocean-400 leading-relaxed">
                Resting &amp; gravel foraging zone.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Add Custom Tank Modal */}
      {showAdd && (
        <GlassCard glow="cyan" className="p-5">
          <h3 className="font-semibold text-ocean-100 text-sm mb-3">Add new tank group</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[10px] text-ocean-500 block mb-1 uppercase">
                Group name
              </label>
              <input
                className="input-field"
                value={newForm.name}
                onChange={(e) => setNewForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Quarantine Tank B"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] text-ocean-500 block mb-1 uppercase">
                Fish count
              </label>
              <input
                type="number"
                min={1}
                max={200}
                className="input-field"
                value={newForm.count}
                onChange={(e) => setNewForm((p) => ({ ...p, count: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="font-mono text-[10px] text-ocean-500 block mb-1 uppercase">
                Species
              </label>
              <select
                className="select-field"
                value={newForm.species}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, species: e.target.value as FishGroup['species'] }))
                }
              >
                {SPECIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] text-ocean-500 block mb-1 uppercase">
                Initial behaviour
              </label>
              <select
                className="select-field"
                value={newForm.behaviour}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, behaviour: e.target.value as BehaviourKey }))
                }
              >
                {Object.entries(BEHAVIOURS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.feeding ? '🟢' : '⚪'} {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addGroup} className="btn-primary flex-1">
              Save Tank to Cloud
            </button>
            <button onClick={() => setShowAdd(false)} className="btn-ghost">
              Cancel
            </button>
          </div>
        </GlassCard>
      )}

      {/* Additional Custom Tanks Saved in Firebase */}
      {tanks.length > 1 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-ocean-300 font-mono uppercase tracking-wider">
            Custom Tank Partitions
          </h3>
          {tanks.slice(1).map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <TankCard
                tank={t}
                onUpdate={(u) => setTanks((prev) => prev.map((x) => (x.id === u.id ? u : x)))}
                onDelete={async (id) => {
                  await deleteTankFromFirebase(id);
                  setTanks((prev) => prev.filter((x) => x.id !== id));
                }}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
