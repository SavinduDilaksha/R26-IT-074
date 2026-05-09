import React, { useState, useEffect } from 'react'
import { Calculator, Info, Zap } from 'lucide-react'
import { MOLLY, FOOD_TYPES, FEED_FREQ, BEHAVIOURS } from '../data.js'

export default function FoodCalculator() {
  const [foodType,      setFoodType]      = useState('flake')
  const [totalCount,    setTotalCount]    = useState(6)
  const [behCount,      setBehCount]      = useState(4)
  const [freq,          setFreq]          = useState(2)

  // Standard: 0.5g × total fish count
  const standardPerSession = parseFloat((MOLLY.gramsPerFish * totalCount / freq).toFixed(2))
  const standardPerDay     = parseFloat((MOLLY.gramsPerFish * totalCount).toFixed(2))

  // Behaviour-driven: 0.1g × fish showing behaviour
  const behaviourRelease   = parseFloat((MOLLY.behaviourGrams * behCount).toFixed(2))

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="font-display text-3xl text-gradient">Food Calculator</h1>
        <p className="font-mono text-xs text-ocean-500 mt-1">Standard feed + behaviour-driven release amounts</p>
      </div>

      {/* Inputs */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="font-mono text-xs text-ocean-500 block mb-1.5">Total Mollies in tank</label>
            <input
              type="number" min="1" max="200"
              className="input-field"
              value={totalCount}
              onChange={e => {
                const v = Math.max(1, parseInt(e.target.value) || 1)
                setTotalCount(v)
                if (behCount > v) setBehCount(v)
              }}
            />
          </div>
          <div>
            <label className="font-mono text-xs text-ocean-500 block mb-1.5">Food type</label>
            <select className="select-field" value={foodType} onChange={e => setFoodType(e.target.value)}>
              {Object.entries(FOOD_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-mono text-xs text-ocean-500 block mb-1.5">Feeds per day</label>
            <select className="select-field" value={freq} onChange={e => setFreq(parseInt(e.target.value))}>
              {FEED_FREQ.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
        </div>

        {/* Standard feed result */}
        <div className="rounded-2xl overflow-hidden border border-ocean-600/20 mb-4">
          <div className="bg-ocean-800/40 px-4 py-2 border-b border-ocean-700/30">
            <span className="font-mono text-xs text-ocean-400 uppercase tracking-widest">Standard feed — {totalCount} fish × {MOLLY.gramsPerFish}g</span>
          </div>
          <div className="bg-gradient-to-r from-ocean-800/20 to-ocean-900/20 p-4 flex items-center justify-between">
            <div>
              <div className="font-mono text-xs text-ocean-500 mb-1">Per session</div>
              <div className="font-display text-4xl text-ocean-200">{standardPerSession}<span className="text-xl text-ocean-400">g</span></div>
            </div>
            <div className="text-right">
              <div className="font-mono text-xs text-ocean-500 mb-1">Daily total ({freq}×)</div>
              <div className="font-display text-4xl text-ocean-200">{standardPerDay}<span className="text-xl text-ocean-400">g</span></div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Info size={13} className="text-ocean-600 mt-0.5 shrink-0" />
          <span className="font-mono text-xs text-ocean-500">{FOOD_TYPES[foodType].tip}</span>
        </div>
      </div>

      {/* Behaviour-driven calculator */}
      <div className="card border border-teal-500/20">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
            <Zap size={13} className="text-teal-400" />
          </div>
          <h2 className="font-semibold text-ocean-200 text-sm">Behaviour-driven release calculator</h2>
        </div>

        <div className="mb-4">
          <label className="font-mono text-xs text-ocean-500 block mb-1.5">
            Fish currently showing feeding behaviour <span className="text-ocean-600">(max {totalCount})</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range" min="0" max={totalCount} step="1"
              value={behCount}
              onChange={e => setBehCount(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="font-mono text-lg font-medium text-ocean-200 w-8 text-right">{behCount}</span>
          </div>
          <div className="flex justify-between font-mono text-xs text-ocean-600 mt-1 px-0.5">
            <span>0</span><span>{totalCount}</span>
          </div>
        </div>

        {behCount === 0 ? (
          <div className="rounded-xl bg-ocean-800/30 border border-ocean-700/30 px-4 py-3 text-center">
            <div className="font-mono text-sm text-ocean-500">No feeding behaviour — feeder stays closed</div>
          </div>
        ) : (
          <div className="rounded-xl bg-teal-500/10 border border-teal-500/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-xs text-teal-500 mb-1">Food to release</div>
                <div className="font-display text-4xl text-teal-300">{behaviourRelease}<span className="text-xl text-teal-500">g</span></div>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs text-teal-600 mb-1">Formula</div>
                <div className="font-mono text-sm text-teal-400">{behCount} fish × {MOLLY.behaviourGrams}g</div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 flex items-start gap-2">
          <Info size={13} className="text-ocean-600 mt-0.5 shrink-0" />
          <span className="font-mono text-xs text-ocean-600">
            Feeder only releases food when fish actively show feeding behaviour. Non-behaving fish receive nothing until next cycle.
          </span>
        </div>
      </div>

      {/* Formula summary */}
      <div className="card">
        <h2 className="font-semibold text-ocean-200 text-sm mb-3 flex items-center gap-2">
          <Calculator size={15} className="text-ocean-400" /> Formula reference
        </h2>
        <div className="space-y-2">
          {[
            { label: 'Standard feed',       formula: 'total fish × 0.5g',           color: '#7dd3fc' },
            { label: 'Behaviour-driven',     formula: 'behaving fish × 0.1g',        color: '#2dd4bf' },
            { label: 'No behaviour detected',formula: '0g — feeder stays closed',    color: '#94a3b8' },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between py-2 border-b border-ocean-800/30 last:border-0">
              <span className="font-mono text-xs text-ocean-500">{row.label}</span>
              <span className="font-mono text-xs font-medium" style={{ color: row.color }}>{row.formula}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
