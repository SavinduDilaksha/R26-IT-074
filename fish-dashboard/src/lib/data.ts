// Types + seed data for the unified aquarium dashboard.

export type Severity = 'Critical' | 'Warning' | 'Info' | 'Resolved';

export interface CameraFeed {
  id: number;
  camera: string;
  disease: string;
  confidence: number;
  status: 'Critical' | 'Warning' | 'Healthy';
  imageUrl: string;
  capturedAt: string;
}

export interface AlertItem {
  id: number;
  title: string;
  description: string;
  severity: Severity;
  source: 'Vision' | 'NLP' | 'Water Quality' | 'Feeder';
  time: string;
}

export interface DetectionRecord {
  date: string;
  disease: string;
  confidence: string;
  source: 'Camera Only' | 'NLP Only' | 'Combined Analysis';
  status: 'Critical' | 'Resolved' | 'Under Observation';
  cycleName?: string;
  reason?: string;
}

export interface BehaviorCycleHistory {
  id: string;
  cycle_name: string;
  timestamp: string;
  tank_stress_score: number;
  tank_stress_level: string;
  primary_reason: string;
  fish_count: number;
  freeze_seconds: number;
  bottom_ratio: number;
  surface_ratio: number;
  continuous_bottom_duration?: number;
  feature_contributions?: Record<string, number>;
}

export interface WaterQualityCycleHistory {
  id: string;
  cycle_name: string;
  timestamp: string;
  status: string;
  bad_probability: number;
  primary_factor: string;
  issue_detected: string;
  actionable_solution: string;
  factors?: Record<string, number>;
  inputs_used?: {
    ionconcentration?: number;
    ph?: number;
    temp?: number;
    turbidity?: number;
  };
}

export interface DiseaseCycleHistory {
  id: string;
  cycle_name: string;
  timestamp: string;
  disease: string;
  confidence: number;
  disease_probability?: number;
  reason: string;
  breakdown?: {
    symptom_class?: string;
    symptom_confidence?: number;
    visual_class?: string;
    visual_confidence?: number;
  };
}

export interface PerFishDetail {
  fish_id: number;
  display_id?: number;
  mean_speed: number;
  region: string;
  tracked_seconds: number;
  confidence: number;
  freeze_seconds: number;
  immobility_events: number;
  surface_visits: number;
  top_seconds: number;
  bottom_seconds: number;
  longest_bottom_seconds: number;
  total_distance: number;
  stress_score?: number;
  stress_level?: string;
  primary_reason?: string;
}

export function parseFirebaseHistory<T>(historyMap: any): T[] {
  if (!historyMap || typeof historyMap !== 'object') return [];
  return Object.entries(historyMap).map(([key, val]: [string, any]) => ({
    id: key,
    ...val,
  })).sort((a: any, b: any) => {
    const timeA = new Date(a.timestamp || 0).getTime();
    const timeB = new Date(b.timestamp || 0).getTime();
    return timeA - timeB;
  });
}

export interface Sensor {
  key: string;
  label: string;
  value: string;
  unit?: string;
  status: 'Optimal' | 'Elevated' | 'High' | 'Critical' | 'Low';
  trend: 'up' | 'down' | 'flat';
  color: string;
}

export interface XAIFactor {
  parameter: string;
  contribution: number;
  color: string;
  detail: string;
}

export interface ForecastPoint {
  time: string;
  risk: number;
}

export interface Recommendation {
  iconKey: 'wind' | 'flask' | 'thermo' | 'feed' | 'shield';
  title: string;
  desc: string;
  tone: 'blue' | 'cyan' | 'purple' | 'teal' | 'rose';
}


export type BehaviourKey =
  | 'eager'
  | 'surface'
  | 'begging'
  | 'calm'
  | 'slow'
  | 'hiding'
  | 'bottom';

export interface Behaviour {
  label: string;
  color: string;
  feeding: boolean;
}

export interface FishGroup {
  id: number;
  name: string;
  species: 'Molly' | 'Guppy' | 'Tetra' | 'Cichlid';
  count: number;
  behaviour: BehaviourKey;
  fedToday: boolean;
}

export interface FoodEntry {
  id: number;
  time: string;
  group: string;
  food: keyof typeof FOOD_TYPES;
  behaviourCount: number;
  amount: number;
  note: string;
}

// ── feeder constants ────────────────────────────────────────────────
export const FEEDER = {
  gramsPerFish: 0.5,
  behaviourGrams: 0.1,
};

export const FOOD_TYPES = {
  flake: { label: 'Flake food', tip: 'Feed only what they consume in 2–3 min. Remove leftovers.' },
  pellet: { label: 'Mini pellets', tip: 'Soak pellets briefly before feeding for easier digestion.' },
  veggie: { label: 'Veggie flakes', tip: 'Mollies love plant-based food. Great as daily staple.' },
  frozen: { label: 'Frozen brine shrimp', tip: 'Thaw before feeding. Use 1–2× per week as a protein treat.' },
  spirulina: { label: 'Spirulina wafer', tip: 'Excellent for color enhancement. Use 3× per week.' },
} as const;

export const FEED_FREQ = [
  { value: 1, label: '1× per day' },
  { value: 2, label: '2× per day' },
  { value: 3, label: '3× per day' },
];

export const BEHAVIOURS: Record<BehaviourKey, Behaviour> = {
  eager: { label: 'Eagerly rushing to surface', color: '#2dd4bf', feeding: true },
  surface: { label: 'Swimming near surface', color: '#0ea5e9', feeding: true },
  begging: { label: 'Begging at glass', color: '#38bdf8', feeding: true },
  calm: { label: 'Calm, normal activity', color: '#7dd3fc', feeding: false },
  slow: { label: 'Slow / not interested', color: '#fbbf24', feeding: false },
  hiding: { label: 'Hiding, not eating', color: '#f43f5e', feeding: false },
  bottom: { label: 'Resting at bottom', color: '#94a3b8', feeding: false },
};

// ── seed: tanks / fish ──────────────────────────────────────────────
export const INITIAL_TANKS: FishGroup[] = [
  { id: 1, name: 'Main Display (YOLOv8)', species: 'Molly', count: 6, behaviour: 'slow', fedToday: true },
];

export const INITIAL_FEED_LOG: FoodEntry[] = [];

// ── seed: vision ────────────────────────────────────────────────────
export const CAMERA_FEEDS: CameraFeed[] = [
  {
    id: 1,
    camera: 'Top Camera (Pi Cam)',
    disease: 'Bacterial gill disease',
    confidence: 45,
    status: 'Warning',
    imageUrl:
      'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?q=80&w=1200&auto=format&fit=crop',
    capturedAt: 'Live Stream',
  },
  {
    id: 2,
    camera: 'Front Camera (Pi Cam)',
    disease: 'Multi-Fish Kinematics',
    confidence: 94,
    status: 'Healthy',
    imageUrl:
      'https://images.unsplash.com/photo-1520637836862-4d197d17c52a?q=80&w=1200&auto=format&fit=crop',
    capturedAt: 'Live Stream',
  },
];

// ── seed: alerts & history ──────────────────────────────────────────
export const ALERTS: AlertItem[] = [];

export const HISTORY: DetectionRecord[] = [];

// ── seed: water quality ─────────────────────────────────────────────
export const SENSORS: Sensor[] = [
  { key: 'temp', label: 'Temperature', value: '28.0', unit: '°C', status: 'Optimal', trend: 'flat', color: '#f97316' },
  { key: 'ph', label: 'pH Level', value: '5.75', unit: '', status: 'Elevated', trend: 'down', color: '#f43f5e' },
  { key: 'ionconcentration', label: 'Ion Conc. (EC)', value: '501', unit: 'µS/cm', status: 'Elevated', trend: 'up', color: '#eab308' },
  { key: 'turbidity', label: 'Turbidity', value: '1580.2', unit: 'ADC', status: 'Optimal', trend: 'flat', color: '#06b6d4' },
];

export const XAI_FACTORS: XAIFactor[] = [
  {
    parameter: 'Temperature (TEMP)',
    contribution: 37.4,
    color: '#f97316',
    detail: 'Temperature stable at 28.0°C in optimal range.',
  },
  {
    parameter: 'Acidity (PH)',
    contribution: 31.1,
    color: '#f43f5e',
    detail: 'Water pH dropped to 5.75 (acidic risk, low buffer).',
  },
  {
    parameter: 'Cloudiness (TURBIDITY)',
    contribution: 19.8,
    color: '#06b6d4',
    detail: 'Turbidity reading at 1580.2 ADC.',
  },
  {
    parameter: 'Ion Concentration (EC)',
    contribution: 11.7,
    color: '#eab308',
    detail: 'Dissolved mineral ions at 501 µS/cm.',
  },
];

export const FORECAST: ForecastPoint[] = [
  { time: 'Now', risk: 26 },
  { time: '+1h', risk: 28 },
  { time: '+2h', risk: 32 },
  { time: '+3h', risk: 36 },
  { time: '+4h', risk: 40 },
  { time: '+5h', risk: 45 },
];

export const RECOMMENDATIONS: Recommendation[] = [
  {
    iconKey: 'wind',
    title: 'Increase Aeration',
    desc: 'Activate auxiliary air pumps to raise DO above 6.0 mg/L.',
    tone: 'blue',
  },
  {
    iconKey: 'flask',
    title: 'Add Ammonia Neutraliser',
    desc: 'Dose 50 mL ammonia binder per 100 gal immediately.',
    tone: 'cyan',
  },
  {
    iconKey: 'thermo',
    title: 'Gradual Cooling',
    desc: 'Engage chiller to lower temperature by 1.5°C over 4 hours.',
    tone: 'purple',
  },
  {
    iconKey: 'feed',
    title: 'Pause Feeder',
    desc: 'Suspend behaviour-triggered feeds until water risk drops below 40%.',
    tone: 'teal',
  },
  {
    iconKey: 'shield',
    title: 'Quarantine Symptomatic Fish',
    desc: 'Move 2 fish from Top Camera view into the quarantine tank.',
    tone: 'rose',
  },
];

// ── seed: NLP suggestions ───────────────────────────────────────────
export const NLP_SUGGESTIONS = [
  'White Spots',
  'Slow Swimming',
  'Loss of Appetite',
  'Frayed fins',
  'Surface gasping',
];

// ── seed: stress & sensor analytics ──────────────────────────────────
export const STRESS_CHART_DATA = [
  { time: '00:00', stressLevel: 18, cv: 15, iot: 21 },
  { time: '02:00', stressLevel: 22, cv: 20, iot: 24 },
  { time: '04:00', stressLevel: 25, cv: 28, iot: 22 },
  { time: '06:00', stressLevel: 20, cv: 18, iot: 22 },
  { time: '08:00', stressLevel: 30, cv: 35, iot: 25 },
  { time: '10:00', stressLevel: 55, cv: 60, iot: 50 },
  { time: '12:00', stressLevel: 80, cv: 85, iot: 75 },
  { time: '14:00', stressLevel: 75, cv: 72, iot: 78 },
  { time: '16:00', stressLevel: 85, cv: 90, iot: 80 },
  { time: '18:00', stressLevel: 90, cv: 92, iot: 88 },
  { time: '20:00', stressLevel: 70, cv: 68, iot: 72 },
  { time: '22:00', stressLevel: 45, cv: 40, iot: 50 },
];

export const CORRELATION_DATA = [
  { time: 'Mon', ph: 7.1, temp: 27.5, ammonia: 0.01, turbidity: 8, stress: 15 },
  { time: 'Tue', ph: 7.3, temp: 28.0, ammonia: 0.02, turbidity: 10, stress: 20 },
  { time: 'Wed', ph: 7.0, temp: 28.4, ammonia: 0.03, turbidity: 9, stress: 25 },
  { time: 'Thu', ph: 7.2, temp: 27.8, ammonia: 0.02, turbidity: 11, stress: 30 },
  { time: 'Fri', ph: 6.8, temp: 29.1, ammonia: 0.04, turbidity: 14, stress: 55 },
  { time: 'Sat', ph: 7.4, temp: 28.2, ammonia: 0.06, turbidity: 13, stress: 80 },
  { time: 'Sun', ph: 7.2, temp: 28.4, ammonia: 0.05, turbidity: 12, stress: 70 },
];

export const HEATMAP_DATA = [
  { day: 'Mon', hours: [5,8,10,12,15,20,35,40,30,55,70,80,75,65,85,80,70,55,45,30,20,15,10,8] },
  { day: 'Tue', hours: [3,5,8,10,12,18,25,30,45,50,60,65,70,55,60,50,40,35,25,18,12,8,5,3] },
  { day: 'Wed', hours: [8,10,15,20,22,30,40,50,55,65,75,85,90,80,75,70,60,45,35,25,18,12,10,8] },
  { day: 'Thu', hours: [4,6,8,12,15,20,28,35,42,48,55,60,58,50,45,40,32,25,20,15,10,8,5,4] },
  { day: 'Fri', hours: [6,8,12,18,25,35,45,55,60,72,80,88,92,85,90,82,70,55,40,30,22,15,10,7] },
  { day: 'Sat', hours: [10,12,18,22,28,38,48,58,65,75,82,90,88,78,72,65,55,42,32,22,15,12,10,8] },
  { day: 'Sun', hours: [5,7,10,14,18,22,30,38,50,58,68,78,72,65,55,48,38,28,22,18,12,8,6,5] },
];

export const MODEL_METRICS = {
  accuracy: 94.2,
  precision: 92.8,
  recall: 95.1,
  f1Score: 93.9,
  modelName: 'YOLOv8n (Nano)',
  inputResolution: '640 × 640',
  fps: 32,
  lastTrained: '2026-04-28',
  totalInferences: 124850,
  avgLatency: '31ms',
};

export const CONFUSION_MATRIX = {
  labels: ['Normal', 'Hypoxia', 'Chemical Stress'],
  data: [
    [245, 8, 5],
    [6, 189, 12],
    [4, 10, 172],
  ],
};

export const SYSTEM_INFO = {
  raspberryPi: { status: 'online', cpuTemp: '52°C', cpuUsage: '68%', memory: '1.2GB / 4GB', uptime: '14d 6h 32m' },
  camera1: { name: 'Top Camera (Pi Cam)', status: 'online', resolution: '1080p', fps: 30 },
  camera2: { name: 'Front Camera (Pi Cam)', status: 'online', resolution: '1080p', fps: 30 },
};

