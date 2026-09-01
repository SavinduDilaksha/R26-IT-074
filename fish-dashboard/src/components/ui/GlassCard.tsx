import type { ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';

type GlowColor = 'none' | 'cyan' | 'teal' | 'rose' | 'purple' | 'amber';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  glow?: GlowColor;
  bright?: boolean;
  children?: ReactNode;
}

const glowMap: Record<GlowColor, string> = {
  none: 'border-white/10',
  cyan: 'shadow-[0_0_18px_rgba(6,182,212,0.12)] border-cyan-500/25',
  teal: 'shadow-[0_0_18px_rgba(45,212,191,0.12)] border-teal-500/25',
  rose: 'shadow-[0_0_18px_rgba(244,63,94,0.12)] border-rose-500/25',
  purple: 'shadow-[0_0_18px_rgba(168,85,247,0.12)] border-purple-500/25',
  amber: 'shadow-[0_0_18px_rgba(251,191,36,0.12)] border-amber-500/25',
};

export default function GlassCard({
  glow = 'none',
  bright = false,
  className,
  children,
  ...rest
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={cn(
        bright ? 'glass-bright' : 'glass',
        'rounded-2xl relative overflow-hidden',
        glowMap[glow],
        className,
      )}
      {...rest}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
