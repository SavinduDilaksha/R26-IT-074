import React, { useState } from 'react'
import { Fish, Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { MOLLY, BEHAVIOURS } from '../data.js'

function MollyCard({ molly, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...molly })
  const beh = BEHAVIOURS[molly.behaviour]

  function save() {
    onUpdate({ ...molly, ...form, count: Math.max(1, parseInt(form.count) || 1) })
    setEditing(false)
  }

  return (
    <div className="card group relative">
      {!editing ? (
        <div className="flex items-start gap-3">
          <div className="text-3xl mt-0.5 animate-float" style={{ animationDelay: `${molly.id * 0.3}s` }}>{MOLLY.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-ocean-100">{molly.name}</h3>
              <span className="badge-type">×{molly.count}</span>
              {beh?.feeding && (
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400 border border-teal-500/25">feeding behaviour</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div>
                <div className="font-mono text-xs text-ocean-500">Behaviour</div>
                <span className="font-mono text-xs font-medium" style={{ color: beh?.color }}>{beh?.label}</span>
              </div>
              <div className="w-px h-8 bg-ocean-800/60" />
              <div>
                <div className="font-mono text-xs text-ocean-500">Status</div>
                <span className={molly.fedToday ? 'badge-fed' : 'badge-hungry'}>{molly.fedToday ? 'fed today' : 'not fed'}</span>
              </div>
              <div className="w-px h-8 bg-ocean-800/60" />
              <div>
                <div className="font-mono text-xs text-ocean-500">Feeder</div>
                <span className="font-mono text-xs" style={{ color: beh?.feeding ? '#2dd4bf' : '#94a3b8' }}>
                  {beh?.feeding ? 'ACTIVE' : 'standby'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-ocean-700/50 text-ocean-400 hover:text-ocean-200 transition-colors">
              <Pencil size={13} />
            </button>
            <button onClick={() => onDelete(molly.id)} className="p-1.5 rounded-lg hover:bg-coral-500/10 text-ocean-500 hover:text-coral-400 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-xs text-ocean-500 block mb-1">Group name</label>
              <input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="font-mono text-xs text-ocean-500 block mb-1">Fish count</label>
              <input type="number" min="1" max="200" className="input-field" value={form.count} onChange={e => setForm(p => ({ ...p, count: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="font-mono text-xs text-ocean-500 block mb-1">Current behaviour</label>
              <select className="select-field" value={form.behaviour} onChange={e => setForm(p => ({ ...p, behaviour: e.target.value }))}>
                {Object.entries(BEHAVIOURS).map(([k, v]) => (
                  <option key={k} value={k}>{v.feeding ? '🟢' : '⚪'} {v.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="btn-primary flex items-center gap-1.5 text-sm px-4 py-2"><Check size={14} /> Save</button>
            <button onClick={() => setEditing(false)} className="btn-ghost flex items-center gap-1.5 text-sm px-4 py-2"><X size={14} /> Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MyMollies({ mollies, setMollies }) {
  const [showAdd, setShowAdd] = useState(false)
  const [newForm, setNewForm] = useState({ name: '', count: 1, behaviour: 'calm' })

  function addGroup() {
    if (!newForm.name.trim()) return
    setMollies(prev => [...prev, { ...newForm, id: Date.now(), count: parseInt(newForm.count) || 1, fedToday: false }])
    setNewForm({ name: '', count: 1, behaviour: 'calm' })
    setShowAdd(false)
  }

  const totalFish = mollies.reduce((s, m) => s + m.count, 0)
  const activeFish = mollies.filter(m => BEHAVIOURS[m.behaviour]?.feeding).reduce((s, m) => s + m.count, 0)

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl text-gradient">My Mollies</h1>
          <p className="font-mono text-xs text-ocean-500 mt-1">
            {mollies.length} group{mollies.length !== 1 ? 's' : ''} · {totalFish} fish · {activeFish} showing feeding behaviour
          </p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-ghost flex items-center gap-1.5 text-sm">
          <Plus size={15} /> Add group
        </button>
      </div>

      {showAdd && (
        <div className="card border border-ocean-500/20 animate-fade-up">
          <h3 className="font-semibold text-ocean-200 text-sm mb-3">Add new group</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-xs text-ocean-500 block mb-1">Group name</label>
              <input className="input-field" value={newForm.name} onChange={e => setNewForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Main Tank" />
            </div>
            <div>
              <label className="font-mono text-xs text-ocean-500 block mb-1">Fish count</label>
              <input type="number" min="1" max="200" className="input-field" value={newForm.count} onChange={e => setNewForm(p => ({ ...p, count: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="font-mono text-xs text-ocean-500 block mb-1">Initial behaviour</label>
              <select className="select-field" value={newForm.behaviour} onChange={e => setNewForm(p => ({ ...p, behaviour: e.target.value }))}>
                {Object.entries(BEHAVIOURS).map(([k, v]) => (
                  <option key={k} value={k}>{v.feeding ? '🟢' : '⚪'} {v.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addGroup} className="btn-primary flex-1">Add group</button>
            <button onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {mollies.map(m => (
          <MollyCard key={m.id} molly={m} onUpdate={u => setMollies(p => p.map(x => x.id === u.id ? u : x))} onDelete={id => setMollies(p => p.filter(x => x.id !== id))} />
        ))}
        {mollies.length === 0 && (
          <div className="card text-center py-10">
            <Fish size={32} className="text-ocean-600 mx-auto mb-3" />
            <p className="font-mono text-sm text-ocean-600">No groups added yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
