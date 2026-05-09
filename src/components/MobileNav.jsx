import React from 'react'
import { LayoutDashboard, Calculator, BrainCircuit, ScrollText, Fish } from 'lucide-react'

const NAV = [
  { id: 'dashboard',  label: 'Home',       icon: LayoutDashboard },
  { id: 'calculator', label: 'Calc',        icon: Calculator },
  { id: 'analysis',   label: 'AI',          icon: BrainCircuit },
  { id: 'log',        label: 'Log',         icon: ScrollText },
  { id: 'fish',       label: 'Fish',        icon: Fish },
]

export default function MobileNav({ activeTab, onTabChange }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 glass border-t border-ocean-800/60">
      <div className="flex">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors
              ${activeTab === id ? 'text-ocean-300' : 'text-ocean-600'}`}
          >
            <Icon size={18} />
            <span className="font-mono text-[10px]">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
