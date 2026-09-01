import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: 'cyan' | 'teal' | 'rose' | 'amber' | 'purple' | 'green';
  hint?: string;
}

const toneMap = {
  cyan: { dot: 'bg-cyan-400', text: 'text-cyan-300', iconBg: 'bg-cyan-500/10 border-cyan-500/20' },
  teal: { dot: 'bg-teal-400', text: 'text-teal-300', iconBg: 'bg-teal-500/10 border-teal-500/20' },
  rose: { dot: 'bg-rose-500', text: 'text-rose-300', iconBg: 'bg-rose-500/10 border-rose-500/20' },
  amber: { dot: 'bg-amber-400', text: 'text-amber-300', iconBg: 'bg-amber-500/10 border-amber-500/20' },
  purple: { dot: 'bg-purple-400', text: 'text-purple-300', iconBg: 'bg-purple-500/10 border-purple-500/20' },
  green: { dot: 'bg-emerald-400', text: 'text-emerald-300', iconBg: 'bg-emerald-500/10 border-emerald-500/20' },
};

export default function MetricCard({ label, value, icon: Icon, tone = 'cyan', hint }: Props) {
  const t = toneMap[tone];
  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-2 hover:border-ocean-400/40 hover:-translate-y-0.5 transition-all duration-200 border border-ocean-800/80">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-ocean-400 uppercase tracking-wider font-semibold truncate">
          {label}
        </span>
        <div className={cn('p-1.5 rounded-lg border flex items-center justify-center shrink-0', t.iconBg)}>
          <Icon size={14} className={t.text} />
        </div>
      </div>
      <div className="font-mono text-2xl sm:text-3xl font-bold text-ocean-100 tracking-tight leading-none">
        {value}
      </div>
      {hint && <div className={cn('text-[10px] font-mono mt-0.5 truncate', t.text)}>{hint}</div>}
    </div>
  );
}
