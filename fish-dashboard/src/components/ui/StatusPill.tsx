import { cn } from '@/lib/cn';

const TONE_MAP: Record<string, { badge: string; dot: string }> = {
  Critical: { badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30', dot: 'bg-rose-500 animate-pulse' },
  Warning: { badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
  Healthy: { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
  Optimal: { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
  Resolved: { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
  'Under Observation': { badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
  Elevated: { badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
  High: { badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30', dot: 'bg-orange-400' },
  Low: { badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', dot: 'bg-cyan-400' },
  Info: { badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', dot: 'bg-cyan-400' },
};

export default function StatusPill({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const tone = TONE_MAP[status] ?? { badge: 'bg-ocean-500/15 text-ocean-300 border-ocean-500/30', dot: 'bg-ocean-400' };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-medium uppercase tracking-wider',
        tone.badge,
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', tone.dot)} />
      <span>{status}</span>
    </span>
  );
}
