import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BrainCircuit,
  Sparkles,
  Upload,
  AlertCircle,
  Microscope,
  Radio,
  History as HistoryIcon,
  CheckCircle2,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import ProgressBar from '@/components/ui/ProgressBar';
import {
  NLP_SUGGESTIONS,
  parseFirebaseHistory,
  type DiseaseCycleHistory,
} from '@/lib/data';
import {
  saveSymptomObservation,
  subscribeToDisease,
  subscribeToSymptoms,
} from '@/lib/firebase';
import type { PageProps } from './types';

export default function DiagnosticsPage(_props: PageProps) {
  const [observation, setObservation] = useState('wound in gills');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(true);
  const [syncedFirebase, setSyncedFirebase] = useState(false);
  const [historyCycles, setHistoryCycles] = useState<DiseaseCycleHistory[]>([]);

  // Live Firebase disease state
  const [liveDisease, setLiveDisease] = useState<any>({
    disease: 'Bacterial gill disease',
    confidence: 0.449,
    reason: "Fused evidence for 'Bacterial gill disease': Visual Model (No Fish / Image Detected 0%), NLP Symptoms (89%)",
    breakdown: { symptom_confidence: 0.89, yolo_confidence: 0.0, yolo_class: 'No Fish / Image Detected' },
  });

  useEffect(() => {
    // 1. Subscribe to Firebase symptoms/user_input
    const unsubSymptoms = subscribeToSymptoms((val) => {
      if (val?.user_input) {
        setObservation(val.user_input);
      }
    });

    // 2. Subscribe to Firebase disease/latest & disease/history
    const unsubDisease = subscribeToDisease((data) => {
      if (data) {
        if (data.disease) {
          setLiveDisease({
            disease: data.disease,
            confidence: data.confidence ?? 0.449,
            reason: data.reason || "Fused evidence for 'Bacterial gill disease'",
            breakdown: data.breakdown || {},
          });
        }

        if (data.history && typeof data.history === 'object') {
          const parsed = parseFirebaseHistory<DiseaseCycleHistory>(data.history);
          if (parsed.length > 0) {
            setHistoryCycles(parsed);
          }
        }
      }
    });

    return () => {
      unsubSymptoms();
      unsubDisease();
    };
  }, []);

  async function runAnalysis() {
    setAnalyzing(true);
    setAnalyzed(false);
    setSyncedFirebase(false);

    // Save symptom string to Firebase RTDB (symptoms/user_input & symptoms/history)
    await saveSymptomObservation(observation);
    setSyncedFirebase(true);

    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
    }, 1000);
  }

  const nlpConfidencePct = Math.round((liveDisease.breakdown?.symptom_confidence || 0.89) * 100);
  const visualConfidencePct = Math.round((liveDisease.breakdown?.visual_confidence ?? liveDisease.breakdown?.yolo_confidence ?? 0) * 100);
  const fusedConfidencePct = Math.round((liveDisease.confidence || 0.449) * 100);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-ocean-800/60 pb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-gradient font-bold">
            AI Diagnostics &amp; Disease Detection
          </h1>
          <p className="font-mono text-xs text-ocean-400 mt-1">
            Operator NLP observations · multimodal fusion with YOLOv8 vision pipeline
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ocean-900/80 border border-teal-500/30 text-xs font-mono text-teal-300">
            <Radio size={12} className="text-teal-400 animate-pulse" />
            Firebase Synced
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* NLP input */}
        <GlassCard glow="cyan" className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
              <BrainCircuit size={18} /> Operator Observation (`symptoms/user_input`)
            </h2>
            {syncedFirebase && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <Radio size={10} className="animate-pulse" /> Cloud RTDB Synced
              </span>
            )}
          </div>
          <textarea
            placeholder="Describe fish behaviour or visible symptoms…"
            className="w-full h-40 bg-ocean-950/60 border border-ocean-700/40 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/40 text-sm leading-relaxed transition-all font-sans"
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
          />
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-[11px] font-mono text-ocean-400">Quick suggestions:</span>
            {['wound in gills', 'sluggish swimming', 'white spots', 'clamped fins'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setObservation(s)}
                className="text-xs font-mono px-2 py-0.5 rounded-lg bg-ocean-800/80 text-ocean-300 hover:text-cyan-300 border border-ocean-700/60 transition-colors"
              >
                + {s}
              </button>
            ))}
          </div>
          <button
            onClick={runAnalysis}
            disabled={analyzing || observation.trim().length === 0}
            className="btn-accent w-full flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <span className="inline-flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse-soft"
                      style={{ animationDelay: `${i * 0.18}s` }}
                    />
                  ))}
                </span>
                Syncing with Cloud AI…
              </>
            ) : (
              <>
                <Sparkles size={15} /> Save &amp; Analyse Observation
              </>
            )}
          </button>
        </GlassCard>

        {/* NLP result */}
        <GlassCard glow="purple" className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-plum-300 flex items-center gap-2">
              <Microscope size={18} /> Disease Diagnosis (`disease/latest`)
            </h2>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-plum-500/20 text-plum-300 border border-plum-500/30">
              Late Fusion Model
            </span>
          </div>

          <div className="rounded-2xl bg-ocean-950/50 border border-ocean-800/60 p-4 space-y-2">
            <span className="text-[10px] font-mono text-ocean-500 uppercase tracking-wider block">
              Fused Disease Prediction
            </span>
            <div className="text-xl font-bold text-rose-300 flex items-center gap-2">
              <span>🦠</span> {liveDisease.disease}
            </div>
            <p className="text-xs text-ocean-300 leading-relaxed font-sans pt-1">
              {liveDisease.reason}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-ocean-400">NLP Symptom Confidence:</span>
                <span className="text-plum-300 font-bold">{nlpConfidencePct}%</span>
              </div>
              <ProgressBar value={nlpConfidencePct} color="#c084fc" height={6} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-ocean-400">Computer Vision Signal:</span>
                <span className="text-cyan-300 font-bold">{visualConfidencePct}%</span>
              </div>
              <ProgressBar value={visualConfidencePct} color="#22d3ee" height={6} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-ocean-400">Fused Late-Stage Confidence:</span>
                <span className="text-teal-300 font-bold">{fusedConfidencePct}%</span>
              </div>
              <ProgressBar value={fusedConfidencePct} color="#2dd4bf" height={6} />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Multimodal Fusion Analysis Card */}
      <GlassCard className="p-8 bg-gradient-to-r from-cyan-500/5 via-teal-500/5 to-plum-500/5 border-white/10">
        <h2 className="text-2xl font-display text-center text-gradient mb-7 font-bold">
          Multimodal Fusion Pipeline
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-center">
          <div className="bg-ocean-950/60 rounded-2xl p-5 border border-cyan-500/20 space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-ocean-100">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
              Camera / YOLOv8 Detection
            </h3>
            <p className="text-[10px] uppercase font-mono text-ocean-500">Visual Diagnosis</p>
            <p className="text-base font-semibold text-cyan-300">
              {liveDisease.breakdown?.yolo_class || liveDisease.breakdown?.visual_class || 'Parasitic diseases'}
            </p>
            <ProgressBar value={visualConfidencePct} color="#22d3ee" rightLabel={`${visualConfidencePct}%`} />
          </div>

          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 via-teal-400 to-plum-500 flex items-center justify-center text-slate-950 text-xl font-bold animate-pulse-soft shadow-2xl shadow-plum-500/30"
            >
              AI
            </motion.div>
            <p className="mt-3 text-ocean-300 text-xs max-w-xs leading-relaxed font-sans">
              Combines YOLOv8 visual detections with NLP symptom embeddings for robust clinical decision support.
            </p>
          </div>

          <div className="bg-ocean-950/60 rounded-2xl p-5 border border-plum-500/20 space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-ocean-100">
              <span className="w-2.5 h-2.5 rounded-full bg-plum-400 inline-block" />
              Operator NLP Symptom Analysis
            </h3>
            <p className="text-[10px] uppercase font-mono text-ocean-500">NLP Target</p>
            <p className="text-base font-semibold text-plum-300">{liveDisease.disease}</p>
            <ProgressBar value={nlpConfidencePct} color="#c084fc" rightLabel={`${nlpConfidencePct}%`} />
          </div>
        </div>
      </GlassCard>

      {/* Historical Cycles from Firebase RTDB (disease/history) */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-ocean-100 flex items-center gap-2">
            <HistoryIcon size={18} className="text-cyan-300" />
            Disease Detection Historical Cycles (`disease/history`)
          </h3>
          <span className="badge-info font-mono text-xs">
            {historyCycles.length} Cycles Logged
          </span>
        </div>

        {historyCycles.length === 0 ? (
          <div className="p-6 text-center text-ocean-500 font-mono text-xs">
            No historical disease cycles recorded in Firebase yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {historyCycles.map((cycle) => {
              const dt = new Date(cycle.timestamp);
              const confPct = Math.round((cycle.confidence || 0.44) * 100);
              const bk = cycle.breakdown || {};

              return (
                <div
                  key={cycle.id}
                  className="rounded-2xl border border-ocean-800/80 bg-ocean-950/40 p-5 space-y-3 hover:border-ocean-700 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-ocean-800/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2.5 py-0.5 rounded-lg">
                        {cycle.cycle_name}
                      </span>
                      <span className="text-[11px] font-mono text-ocean-400">
                        {dt.toLocaleString()}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      {confPct}% Conf.
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-ocean-100 flex items-center gap-1.5">
                      <span>🦠</span> {cycle.disease}
                    </h4>
                    <p className="text-xs text-ocean-300 leading-relaxed font-sans">
                      {cycle.reason}
                    </p>
                  </div>

                  {(bk.symptom_confidence != null || bk.visual_confidence != null) && (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-ocean-800/40 text-xs font-mono">
                      <div>
                        <span className="text-ocean-500 text-[10px] uppercase block">NLP Signal</span>
                        <span className="text-plum-300 font-bold">
                          {Math.round((bk.symptom_confidence || 0) * 100)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-ocean-500 text-[10px] uppercase block">Visual Signal</span>
                        <span className="text-cyan-300 font-bold">
                          {Math.round((bk.visual_confidence || 0) * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
