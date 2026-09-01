import {
  LayoutDashboard,
  Camera,
  BrainCircuit,
  Droplets,
  Zap,
  Fish,
  Bell,
  Waves,
  LogOut,
  Shield,
} from 'lucide-react';
import type { ViewKey } from '@/App';
import { cn } from '@/lib/cn';
import { useAuth } from '@/context/AuthContext';

interface Props {
  active: ViewKey;
  onSelect: (key: ViewKey) => void;
  totalFish: number;
  fedToday: number;
  activeAlerts: number;
}

export const NAV: { id: ViewKey; label: string; icon: typeof LayoutDashboard; tag?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'vision', label: 'Vision Monitor', icon: Camera, tag: 'YOLOv8' },
  { id: 'diagnostics', label: 'AI Diagnostics', icon: BrainCircuit, tag: 'Fusion' },
  { id: 'water', label: 'Water Quality', icon: Droplets, tag: 'XAI' },
  { id: 'feeder', label: 'Smart Feeder', icon: Zap },
  { id: 'tanks', label: 'My Tanks', icon: Fish },
  { id: 'alerts', label: 'Alerts & History', icon: Bell },
];

export default function Sidebar({ active, onSelect, totalFish, fedToday, activeAlerts }: Props) {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 glass rounded-2xl m-4 mr-0 p-5 z-10 sticky top-4 h-[calc(100vh-2rem)] border border-ocean-800/80">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-ocean-800/60">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-teal-500 to-ocean-600 flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
          <Waves size={22} className="text-slate-950 font-bold" />
        </div>
        <div className="min-w-0">
          <div className="font-display text-lg font-bold text-ocean-100 leading-tight tracking-tight flex items-center gap-1.5">
            <span>AquaSphere</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded font-semibold">
              AI
            </span>
          </div>
          <div className="font-mono text-[9px] text-ocean-400 tracking-widest uppercase">
            Smart Aquarium OS
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto scrollbar-hide">
        {NAV.map(({ id, label, icon: Icon, tag }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={cn(
                'relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left cursor-pointer group',
                isActive
                  ? 'bg-ocean-500/20 text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'text-ocean-400 hover:text-ocean-100 hover:bg-ocean-900/50 border border-transparent',
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-cyan-400 to-teal-400 rounded-r-full" />
              )}
              <Icon size={17} className={isActive ? 'text-teal-300' : 'text-ocean-500 group-hover:text-ocean-300'} />
              <span className="flex-1 truncate">{label}</span>
              {tag && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-ocean-900 text-ocean-300 border border-ocean-700/60 font-medium">
                  {tag}
                </span>
              )}
              {id === 'alerts' && activeAlerts > 0 && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {activeAlerts}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile & telemetry footer */}
      <div className="mt-4 pt-4 border-t border-ocean-800/60 space-y-3">
        {/* User profile card */}
        {user && (
          <div className="bg-ocean-950/70 rounded-xl p-2.5 flex items-center justify-between gap-2 border border-ocean-800/80">
            <div className="flex items-center gap-2.5 min-w-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-lg border border-teal-400/40 object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center font-bold text-xs text-slate-950 shrink-0 shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-xs font-semibold text-ocean-100 truncate">{user.name}</div>
                <div className="font-mono text-[9px] text-teal-300 truncate flex items-center gap-1">
                  <Shield size={10} className="text-teal-400 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-ocean-400 hover:text-rose-300 transition-colors shrink-0 cursor-pointer"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}

        {/* Telemetry summary */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-ocean-950/60 rounded-xl p-2 text-center border border-ocean-800/60">
            <div className="font-mono text-lg font-bold text-ocean-100">{totalFish}</div>
            <div className="font-mono text-[9px] text-ocean-400 uppercase tracking-wider">total fish</div>
          </div>
          <div className="bg-ocean-950/60 rounded-xl p-2 text-center border border-ocean-800/60">
            <div className="font-mono text-lg font-bold text-teal-300">{fedToday}</div>
            <div className="font-mono text-[9px] text-ocean-400 uppercase tracking-wider">fed today</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
