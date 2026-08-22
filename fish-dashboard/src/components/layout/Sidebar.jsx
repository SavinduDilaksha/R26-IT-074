import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Activity,
  Fish,
  Droplets,
  Microscope,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Waves,
} from 'lucide-react';

const navItems = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/fish-stress', label: 'Fish Stress', icon: Activity },
  { path: '/fish-feeding', label: 'Fish Feeding', icon: Fish },
  { path: '/water-quality', label: 'Water Quality', icon: Droplets },
  { path: '/disease-detection', label: 'Disease Detection', icon: Microscope },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col
          bg-[#0a0f1e]/95 backdrop-blur-xl border-r border-slate-800/60
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[72px]' : 'w-[260px]'}
          ${collapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800/60">
          <div className="flex-shrink-0 p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/20">
            <Waves className="w-5 h-5 text-blue-400" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 whitespace-nowrap">
                AquaVision
              </h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider whitespace-nowrap">Smart Aquarium</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-600/15 to-cyan-600/10 text-white border border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.08)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-r-full" />
                    )}
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-400' : 'group-hover:text-blue-300'}`} />
                    {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-slate-800/60 space-y-2">
          {/* Collapse toggle */}
          <button
            onClick={onToggle}
            className="hidden lg:flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-5 h-5 flex-shrink-0" /> : <ChevronLeft className="w-5 h-5 flex-shrink-0" />}
            {!collapsed && <span>Collapse</span>}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
