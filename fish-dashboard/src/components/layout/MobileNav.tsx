import { useState } from 'react';
import {
  LayoutDashboard,
  Camera,
  Droplets,
  Zap,
  Bell,
  BrainCircuit,
  Fish,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ViewKey } from '@/App';
import { cn } from '@/lib/cn';
import { useAuth } from '@/context/AuthContext';

const MAIN_NAV: { id: ViewKey; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'vision', label: 'Vision', icon: Camera },
  { id: 'water', label: 'Water', icon: Droplets },
  { id: 'feeder', label: 'Feeder', icon: Zap },
];

const MORE_NAV: { id: ViewKey; label: string; icon: typeof LayoutDashboard; tag?: string }[] = [
  { id: 'diagnostics', label: 'AI Diagnostics', icon: BrainCircuit, tag: 'Fusion' },
  { id: 'tanks', label: 'My Tanks', icon: Fish },
  { id: 'alerts', label: 'Alerts & History', icon: Bell },
];

export default function MobileNav({
  active,
  onSelect,
}: {
  active: ViewKey;
  onSelect: (key: ViewKey) => void;
}) {
  const [showMore, setShowMore] = useState(false);
  const { user, logout } = useAuth();

  const isMoreActive = MORE_NAV.some((n) => n.id === active);

  return (
    <>
      {/* Expanded More Menu Drawer */}
      <AnimatePresence>
        {showMore && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col justify-end">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="glass rounded-t-3xl border-t border-ocean-700/60 p-5 space-y-4 pb-24 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-ocean-800/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">🐠</span>
                  <span className="font-display font-bold text-ocean-100">AquaSphere Navigation</span>
                </div>
                <button
                  onClick={() => setShowMore(false)}
                  className="p-1 rounded-full text-ocean-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {MORE_NAV.map(({ id, label, icon: Icon, tag }) => {
                  const isActive = active === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        onSelect(id);
                        setShowMore(false);
                      }}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all text-left',
                        isActive
                          ? 'bg-ocean-500/30 text-teal-300 border border-teal-500/40 shadow-inner'
                          : 'glass text-ocean-300 hover:text-white',
                      )}
                    >
                      <Icon size={18} className={isActive ? 'text-teal-300' : 'text-ocean-400'} />
                      <span className="flex-1">{label}</span>
                      {tag && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
                          {tag}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {user && (
                <div className="pt-3 border-t border-ocean-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center font-bold text-xs text-slate-950">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-ocean-100">{user.name}</div>
                      <div className="font-mono text-[9px] text-ocean-400">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowMore(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-mono"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 glass border-t border-ocean-800/60 backdrop-blur-xl">
        <div className="flex items-center justify-around">
          {MAIN_NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setShowMore(false);
                onSelect(id);
              }}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors min-h-[56px] active:scale-95',
                active === id ? 'text-teal-300 font-semibold' : 'text-ocean-400 hover:text-ocean-200',
              )}
            >
              <Icon size={19} />
              <span className="font-mono text-[9px] uppercase tracking-wider">{label}</span>
            </button>
          ))}

          {/* More Menu Trigger */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors min-h-[56px] active:scale-95',
              isMoreActive || showMore ? 'text-teal-300 font-semibold' : 'text-ocean-400 hover:text-ocean-200',
            )}
          >
            <Menu size={19} />
            <span className="font-mono text-[9px] uppercase tracking-wider">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
