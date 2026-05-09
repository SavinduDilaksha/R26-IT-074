import React from 'react'
import { LayoutDashboard, Calculator, BrainCircuit, ScrollText, Fish, Waves } from 'lucide-react'

const NAV = [
  { id: 'dashboard',  label: 'Dashboard',       icon: LayoutDashboard },
  { id: 'calculator', label: 'Food Calculator',  icon: Calculator },
  { id: 'analysis',   label: 'AI Analysis',      icon: BrainCircuit },
  { id: 'log',        label: 'Feed Log',         icon: ScrollText },
  { id: 'fish',       label: 'My Mollies',       icon: Fish },
]

export default function Sidebar({ activeTab, onTabChange, totalFish, fedToday }) {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 glass rounded-3xl m-4 mr-0 p-5 z-10">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-ocean-400 to-teal-500 flex items-center justify-center shadow-lg shadow-ocean-900/50">
          <Waves size={20} className="text-white" />
        </div>
        <div>
          <div className="font-display text-lg text-ocean-100 leading-tight">Molly Tank</div>
          <div className="font-mono text-xs text-ocean-400">Feeding Tracker</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left
              ${activeTab === id
                ? 'bg-ocean-500/20 text-ocean-200 border border-ocean-500/30 shadow-inner'
                : 'text-ocean-400 hover:text-ocean-200 hover:bg-ocean-800/40'
              }`}
          >
            <Icon size={17} className={activeTab === id ? 'text-ocean-300' : 'text-ocean-500'} />
            {label}
            {id === 'analysis' && (
              <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30">
                API
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer stats */}
      <div className="mt-6 pt-5 border-t border-ocean-800/60">
        <div className="grid grid-cols-2 gap-2">
          <div className="glass rounded-xl p-3 text-center">
            <div className="font-display text-2xl text-ocean-200">{totalFish}</div>
            <div className="font-mono text-[10px] text-ocean-500 mt-0.5">total fish</div>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <div className="font-display text-2xl text-teal-400">{fedToday}</div>
            <div className="font-mono text-[10px] text-ocean-500 mt-0.5">fed today</div>
          </div>
        </div>
        <div className="mt-3 text-center">
          <span className="text-[10px] font-mono text-ocean-600">Powered by Claude API</span>
        </div>
      </div>
    </aside>
  )
}
