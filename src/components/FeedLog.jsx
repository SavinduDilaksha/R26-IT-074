import React, { useState } from 'react'
import { ScrollText, Plus, Trash2 } from 'lucide-react'
import { FOOD_TYPES, BEHAVIOURS } from '../data.js'

export default function FeedLog({ feedLog, setFeedLog }) {
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ group: '', food: 'flake', behaviourCount: 1, note: '' })

  const totalGiven = feedLog.reduce((s, l) => s + l.amount, 0)
  const foodColors = { flake:'#0ea5e9', pellet:'#7dd3fc', veggie:'#2dd4bf', frozen:'#a78bfa', spirulina:'#34d399' }

  function addEntry() {
    if (!form.group || !form.behaviourCount) return
    const count = Math.max(0, parseInt(form.behaviourCount) || 0)
    const amt   = parseFloat((count * 0.1).toFixed(2))
    const time  = new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
    setFeedLog(prev => [{ id: Date.now(), time, group: form.group, food: form.food, behaviourCount: count, amount: amt, note: form.note }, ...prev])
    setShowAdd(false)
    setForm({ group: '', food: 'flake', behaviourCount: 1, note: '' })
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl text-gradient">Feed Log</h1>
          <p className="font-mono text-xs text-ocean-500 mt-1">Behaviour-triggered feeding history</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-ghost flex items-center gap-1.5 text-sm">
          <Plus size={15} /> Add entry
        </button>
      </div>

      {showAdd && (
        <div className="card border border-ocean-500/20 animate-fade-up">
          <h3 className="font-semibold text-ocean-200 text-sm mb-3">Manual log entry</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="font-mono text-xs text-ocean-500 block mb-1">Group name</label>
              <input className="input-field" value={form.group} onChange={e => setForm(p => ({ ...p, group: e.target.value }))} placeholder="e.g. Main Tank ×6" />
            </div>
            <div>
              <label className="font-mono text-xs text-ocean-500 block mb-1">Food type</label>
              <select className="select-field" value={form.food} onChange={e => setForm(p => ({ ...p, food: e.target.value }))}>
                {Object.entries(FOOD_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="font-mono text-xs text-ocean-500 block mb-1">Fish showing behaviour</label>
              <input type="number" min="0" className="input-field" value={form.behaviourCount}
                onChange={e => setForm(p => ({ ...p, behaviourCount: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="font-mono text-xs text-ocean-500 block mb-1">Note (optional)</label>
              <input className="input-field" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="e.g. evening feed" />
            </div>
          </div>
          <div className="mt-2 font-mono text-xs text-teal-500">
            Food amount: {Math.max(0, parseInt(form.behaviourCount) || 0)} fish × 0.1g = {(Math.max(0, parseInt(form.behaviourCount) || 0) * 0.1).toFixed(2)}g
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addEntry} className="btn-primary flex-1">Save entry</button>
            <button onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        {feedLog.length === 0 && (
          <div className="py-10 text-center font-mono text-sm text-ocean-600">No feeds logged yet</div>
        )}
        <div className="divide-y divide-ocean-800/30">
          {feedLog.map(entry => (
            <div key={entry.id} className="flex items-center gap-3 py-3 group">
              <div className="font-mono text-xs text-ocean-500 w-12 shrink-0">{entry.time}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-ocean-200 truncate">{entry.group}</div>
                <div className="font-mono text-xs text-ocean-600">
                  {entry.behaviourCount} fish showing behaviour · {entry.note || 'behaviour triggered'}
                </div>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full border shrink-0"
                style={{ background: `${foodColors[entry.food]}15`, color: foodColors[entry.food], borderColor: `${foodColors[entry.food]}30` }}>
                {FOOD_TYPES[entry.food]?.label || entry.food}
              </span>
              <div className="font-mono text-sm text-teal-400 font-medium w-14 text-right shrink-0">{entry.amount.toFixed(2)}g</div>
              <button onClick={() => setFeedLog(p => p.filter(l => l.id !== entry.id))}
                className="opacity-0 group-hover:opacity-100 text-ocean-600 hover:text-coral-400 transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        {feedLog.length > 0 && (
          <div className="mt-3 pt-3 border-t border-ocean-800/40 flex justify-between">
            <span className="text-ocean-500 font-mono text-xs">{feedLog.length} entries</span>
            <span className="font-mono text-teal-400 font-medium text-sm">{totalGiven.toFixed(2)}g total</span>
          </div>
        )}
      </div>
    </div>
  )
}
