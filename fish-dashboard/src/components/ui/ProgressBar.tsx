import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface Props {
  value: number;
  color?: string;
  height?: number;
  className?: string;
  label?: string;
  rightLabel?: string;
  delay?: number;
}

export default function ProgressBar({
  value,
  color = '#2dd4bf',
  height = 8,
  className,
  label,
  rightLabel,
  delay = 0,
}: Props) {
  return (
    <div className={className}>
      {(label || rightLabel) && (
        <div className="flex justify-between mb-1 text-xs">
          {label && <span className="text-ocean-300">{label}</span>}
          {rightLabel && <span className="font-mono text-ocean-400">{rightLabel}</span>}
        </div>
      )}
      <div
        className={cn('w-full bg-white/10 rounded-full overflow-hidden')}
        style={{ height }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          transition={{ delay, duration: 0.7, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}
