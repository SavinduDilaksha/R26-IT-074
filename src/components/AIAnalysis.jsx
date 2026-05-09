import React, { useState } from 'react'
import { BrainCircuit, Sparkles, AlertCircle } from 'lucide-react'
import { BEHAVIOURS, WATER_TEMPS } from '../data.js'

export default function AIAnalysis() {
  const [behaviour,  setBehaviour]  = useState('eager')
  const [fishCount,  setFishCount]  = useState(6)
  const [behCount,   setBehCount]   = useState(4)
  const [hoursSince, setHoursSince] = useState('12')
  const [waterTemp,  setWaterTemp]  = useState('ok')
  const [loading,    setLoading]    = useState(false)
  const [result,     setResult]     = useState(null)
  const [error,      setError]      = useState(null)

  const foodToRelease = parseFloat((behCount * 0.1).toFixed(2))

  async function runAnalysis() {
    setLoading(true); setError(null); setResult(null)
    const behLabel  = BEHAVIOURS[behaviour].label
    const tempLabel = WATER_TEMPS.find(t => t.value === waterTemp).label
    const prompt = `You are an expert aquarium fish behaviorist specializing in Molly fish.

Current situation:
- Total Mollies in tank: ${fishCount}
- Fish showing feeding behaviour: ${behCount} out of ${fishCount}
- Observed behaviour: ${behLabel}
- Time since last feeding: ${hoursSince} hours ago
- Water temperature: ${tempLabel}
- Behaviour-driven feeder will release: ${foodToRelease}g (${behCount} × 0.1g)

Analyse:
1. Is this behaviour normal? What does it indicate?
2. Is ${foodToRelease}g the right amount for ${behCount} behaving fish?
3. Should the feeder trigger now or wait?
4. One specific Molly care tip relevant to this situation.

Be concise, practical, under 130 words.`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      setResult(data.content?.find(b => b.type === 'text')?.text || 'No response.')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="font-display text-3xl text-gradient">AI Analysis</h1>
        <p className="font-mono text-xs text-ocean-500 mt-1">Claude API — behaviour-driven feeding intelligence</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
            <BrainCircuit size={14} className="text-teal-400" />
          </div>
          <span className="font-semibold text-ocean-200 text-sm">Describe current tank situation</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-mono text-xs text-ocean-500 block mb-1.5">Total fish in tank</label>
            <input type="number" min="1" max="200" className="input-field" value={fishCount}
              onChange={e => { const v = Math.max(1, parseInt(e.target.value)||1); setFishCount(v); if (behCount > v) setBehCount(v) }} />
          </div>
          <div>
            <label className="font-mono text-xs text-ocean-500 block mb-1.5">Fish showing feeding behaviour</label>
            <input type="number" min="0" max={fishCount} className="input-field" value={behCount}
              onChange={e => setBehCount(Math.min(fishCount, Math.max(0, parseInt(e.target.value)||0)))} />
          </div>
          <div className="col-span-2">
            <label className="font-mono text-xs text-ocean-500 block mb-1.5">Observed behaviour</label>
            <select className="select-field" value={behaviour} onChange={e => setBehaviour(e.target.value)}>
              {Object.entries(BEHAVIOURS).map(([k, v]) => (
                <option key={k} value={k}>{v.feeding ? '🟢' : '⚪'} {v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-mono text-xs text-ocean-500 block mb-1.5">Last feed</label>
            <select className="select-field" value={hoursSince} onChange={e => setHoursSince(e.target.value)}>
              {['2','4','6','8','12','18','24'].map(h => <option key={h} value={h}>{h} hours ago</option>)}
            </select>
          </div>
          <div>
            <label className="font-mono text-xs text-ocean-500 block mb-1.5">Water temperature</label>
            <select className="select-field" value={waterTemp} onChange={e => setWaterTemp(e.target.value)}>
              {WATER_TEMPS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        {/* Live calculation preview */}
        <div className={`mt-4 rounded-xl px-4 py-3 border flex items-center justify-between ${
          behCount > 0 ? 'bg-teal-500/10 border-teal-500/20' : 'bg-ocean-800/30 border-ocean-700/30'
        }`}>
          <span className="font-mono text-xs text-ocean-500">Feeder will release</span>
          <span className={`font-mono text-sm font-medium ${behCount > 0 ? 'text-teal-400' : 'text-ocean-600'}`}>
            {behCount > 0 ? `${foodToRelease}g (${behCount} × 0.1g)` : 'nothing — no behaviour'}
          </span>
        </div>

        <button onClick={runAnalysis} disabled={loading}
          className="btn-primary w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? (
            <><span className="inline-flex gap-1">{[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-soft" style={{ animationDelay: `${i*0.2}s` }} />)}</span>Analysing...</>
          ) : (
            <><Sparkles size={15} /> Analyse with Claude API</>
          )}
        </button>
      </div>

      {result && (
        <div className="card border border-teal-500/20 animate-fade-up">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
              <Sparkles size={12} className="text-teal-400" />
            </div>
            <span className="font-mono text-xs text-teal-400">Claude Sonnet · {new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'})}</span>
          </div>
          <p className="text-ocean-200 text-sm leading-relaxed whitespace-pre-wrap">{result}</p>
        </div>
      )}

      {error && (
        <div className="card border border-coral-500/30 flex items-start gap-3">
          <AlertCircle size={16} className="text-coral-400 mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold text-coral-300 text-sm">API Error</div>
            <div className="font-mono text-xs text-ocean-400 mt-1">{error}</div>
          </div>
        </div>
      )}
    </div>
  )
}
