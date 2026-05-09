import React, { useState } from 'react'
import { Zap, Droplets, Activity, Eye } from 'lucide-react'
import { MOLLY, BEHAVIOURS, FOOD_TYPES } from '../data.js'

function HungerBar({ value, color }) {
  return (
    <div className="w-full h-1.5 rounded-full bg-ocean-800/60 overflow-hidden mt-1">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
    </div>
  )
}

export default function Dashboard({ mollies, setMollies, feedLog, setFeedLog }) {
  const [quickGroup, setQuickGroup] = useState(mollies[0]?.id || 1)
  const [lastFed, setLastFed] = useState(null)

  const totalFish  = mollies.reduce((s, m) => s + m.count, 0)
  const fedCount   = mollies.filter(m => m.fedToday).reduce((s, m) => s + m.count, 0)
  const totalGiven = feedLog.reduce((s, l) => s + l.amount, 0)

  // Fish showing feeding behaviour right now
  const activeFeedingFish = mollies
    .filter(m => BEHAVIOURS[m.behaviour]?.feeding)
    .reduce((s, m) => s + m.count, 0)

  // Behaviour-driven food amount
  const behaviourAmount = parseFloat((activeFeedingFish * MOLLY.behaviourGrams).toFixed(2))

  function doQuickFeed() {
    const group = mollies.find(m => m.id === parseInt(quickGroup))
    if (!group) return
    const feedingCount = BEHAVIOURS[group.behaviour]?.feeding ? group.count : 0
    if (feedingCount === 0) {
      setLastFed({ label: group.name, amt: 0, time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }), skipped: true })
      return
    }
    const amt = parseFloat((feedingCount * MOLLY.behaviourGrams).toFixed(2))
    const time = new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
    setFeedLog(prev => [{
      id: Date.now(), time,
      group: `${group.name} ×${group.count}`,
      food: 'flake',
      behaviourCount: feedingCount,
      amount: amt,
      note: 'behaviour triggered'
    }, ...prev])
    setMollies(prev => prev.map(m => m.id === group.id ? { ...m, fedToday: true } : m))
    setLastFed({ label: group.name, amt, feedingCount, time, skipped: false })
  }

  const metrics = [
    { label: 'Mollies in tank', value: totalFish,            icon: Activity, color: 'text-ocean-300' },
    { label: 'Fed today',       value: fedCount,             icon: Droplets, color: 'text-teal-400'  },
    { label: 'Showing behaviour', value: activeFeedingFish,  icon: Eye,      color: activeFeedingFish > 0 ? 'text-teal-400' : 'text-ocean-400' },
    { label: 'Food given today', value: `${totalGiven.toFixed(1)}g`, icon: Zap, color: 'text-ocean-300' },
  ]

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="font-display text-3xl text-gradient">Dashboard</h1>
        <p className="font-mono text-xs text-ocean-500 mt-1">{new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Metrics — no "Still Hungry" */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card-bright flex flex-col gap-2">
            <Icon size={16} className={`${color} opacity-80`} />
            <div className="font-display text-3xl text-ocean-100">{value}</div>
            <div className="font-mono text-xs text-ocean-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Behaviour-driven feeder status */}
      <div className={`card border ${activeFeedingFish > 0 ? 'border-teal-500/30' : 'border-ocean-700/30'}`}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-ocean-200 flex items-center gap-2 text-sm">
            <Eye size={15} className="text-ocean-400" /> Behaviour-driven feeder
          </h2>
          <span className={`font-mono text-xs px-2.5 py-1 rounded-full border ${
            activeFeedingFish > 0
              ? 'bg-teal-500/15 text-teal-400 border-teal-500/30'
              : 'bg-ocean-800/40 text-ocean-500 border-ocean-700/30'
          }`}>
            {activeFeedingFish > 0 ? 'TRIGGERED' : 'STANDBY'}
          </span>
        </div>

        {activeFeedingFish > 0 ? (
          <div className="rounded-xl bg-teal-500/10 border border-teal-500/20 px-4 py-3 flex items-center justify-between">
            <div>
              <div className="font-mono text-xs text-teal-500 mb-0.5">Fish showing feeding behaviour</div>
              <div className="font-display text-2xl text-teal-300">{activeFeedingFish} fish</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-xs text-teal-500 mb-0.5">Food to release</div>
              <div className="font-display text-2xl text-teal-300">{behaviourAmount}g</div>
              <div className="font-mono text-[10px] text-teal-600">{activeFeedingFish} × {MOLLY.behaviourGrams}g</div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-ocean-800/30 border border-ocean-700/30 px-4 py-3 text-center">
            <div className="font-mono text-sm text-ocean-500">No feeding behaviours detected</div>
            <div className="font-mono text-xs text-ocean-600 mt-1">Feeder will not release food</div>
          </div>
        )}
      </div>

      {/* Group behaviour overview */}
      <div className="card">
        <h2 className="font-semibold text-ocean-200 mb-4 flex items-center gap-2 text-sm">
          <Activity size={15} className="text-ocean-400" /> Group behaviours
        </h2>
        <div className="space-y-3">
          {mollies.map(m => {
            const beh = BEHAVIOURS[m.behaviour]
            return (
              <div key={m.id} className="flex items-center gap-3">
                <span className="text-xl">{MOLLY.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium text-ocean-200">{m.name} <span className="text-ocean-500">×{m.count}</span></span>
                    <div className="flex items-center gap-1.5">
                      {beh?.feeding && (
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-400 border border-teal-500/25">feeding</span>
                      )}
                      <span className="font-mono text-xs" style={{ color: beh?.color }}>{m.behaviour}</span>
                    </div>
                  </div>
                  <HungerBar value={beh?.feeding ? 80 : 30} color={beh?.color || '#94a3b8'} />
                </div>
                <span className={m.fedToday ? 'badge-fed' : 'badge-hungry'}>{m.fedToday ? 'fed' : 'waiting'}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick feed */}
      <div className="card">
        <h2 className="font-semibold text-ocean-200 mb-4 flex items-center gap-2 text-sm">
          <Zap size={15} className="text-ocean-400" /> Trigger feed manually
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="font-mono text-xs text-ocean-500 block mb-1.5">Select group</label>
            <select className="select-field" value={quickGroup} onChange={e => setQuickGroup(e.target.value)}>
              {mollies.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ×{m.count} — {BEHAVIOURS[m.behaviour]?.feeding ? '✓ feeding behaviour' : '✗ no feeding behaviour'}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={doQuickFeed} className="btn-primary w-full">Release food ↗</button>
          </div>
        </div>
        {lastFed && (
          <div className={`mt-3 flex items-center gap-2 text-sm font-mono ${lastFed.skipped ? 'text-amber-400' : 'text-teal-400'}`}>
            <span>{lastFed.skipped ? '⚠' : '✓'}</span>
            {lastFed.skipped
              ? `${lastFed.label} — no feeding behaviour. Food not released.`
              : `${lastFed.amt}g released for ${lastFed.feedingCount} fish showing behaviour — ${lastFed.time}`
            }
          </div>
        )}
      </div>
    </div>
  )
}
