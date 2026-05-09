// Single Molly variety — no type differentiation
export const MOLLY = {
  label: 'Molly',
  icon: '🐠',
  color: '#0ea5e9',
  gramsPerFish: 0.5,        // standard feed: 0.5g × fish count
  behaviourGrams: 0.1,      // behaviour-driven: 0.1g × fish showing behaviour
}

export const FOOD_TYPES = {
  flake:     { label: 'Flake food',         tip: 'Feed only what they consume in 2–3 min. Remove leftovers.' },
  pellet:    { label: 'Mini pellets',        tip: 'Soak pellets briefly before feeding for easier digestion.' },
  veggie:    { label: 'Veggie flakes',       tip: 'Mollies love plant-based food. Great as daily staple.' },
  frozen:    { label: 'Frozen brine shrimp', tip: 'Thaw before feeding. Use 1–2× per week as a protein treat.' },
  spirulina: { label: 'Spirulina wafer',     tip: 'Excellent for color enhancement. Use 3× per week.' },
}

export const FEED_FREQ = [
  { value: 1, label: '1× per day' },
  { value: 2, label: '2× per day' },
  { value: 3, label: '3× per day' },
]

// Feeding behaviours — feeding:true ones TRIGGER the auto feeder
export const BEHAVIOURS = {
  eager:   { label: 'Eagerly rushing to surface', color: '#2dd4bf', feeding: true  },
  surface: { label: 'Swimming near surface',      color: '#0ea5e9', feeding: true  },
  begging: { label: 'Begging at glass',           color: '#38bdf8', feeding: true  },
  calm:    { label: 'Calm, normal activity',      color: '#7dd3fc', feeding: false },
  slow:    { label: 'Slow / not interested',      color: '#fbbf24', feeding: false },
  hiding:  { label: 'Hiding, not eating',         color: '#f43f5e', feeding: false },
  bottom:  { label: 'Resting at bottom',          color: '#94a3b8', feeding: false },
}

export const WATER_TEMPS = [
  { value: 'low',  label: 'Below 24°C (too cold)' },
  { value: 'ok',   label: '24–28°C (ideal)'       },
  { value: 'high', label: 'Above 28°C (warm)'     },
]

export const INITIAL_MOLLIES = [
  { id: 1, name: 'Main Tank', count: 6, behaviour: 'eager', fedToday: false },
  { id: 2, name: 'Breeding Tank', count: 4, behaviour: 'calm', fedToday: true  },
]

export const INITIAL_LOG = [
  { id: 1, time: '07:30', group: 'Breeding Tank ×4', food: 'flake', behaviourCount: 4, amount: 0.4, note: 'behaviour triggered' },
]
