import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export const GlassCard = ({ 
  children, 
  className, 
  glowColor = 'none',
  ...props 
}) => {
  const glowClasses = {
    blue: 'shadow-[0_0_15px_rgba(59,130,246,0.1)] border-blue-500/20',
    cyan: 'shadow-[0_0_15px_rgba(6,182,212,0.1)] border-cyan-500/20',
    purple: 'shadow-[0_0_15px_rgba(168,85,247,0.1)] border-purple-500/20',
    rose: 'shadow-[0_0_15px_rgba(244,63,94,0.1)] border-rose-500/20',
    none: 'border-white/10'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'glass-panel rounded-2xl p-6 relative overflow-hidden',
        glowClasses[glowColor],
        className
      )}
      {...props}
    >
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
