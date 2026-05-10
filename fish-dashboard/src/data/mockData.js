// ===== Stress Chart Data (24h) =====
export const stressChartData = [
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

// ===== Sensor Current Values =====
export const sensorData = {
  ph: { value: 7.2, status: 'normal', unit: '', min: 6.5, max: 8.5, label: 'pH Level' },
  temperature: { value: 28.4, status: 'normal', unit: '°C', min: 24, max: 28, label: 'Temperature' },
  ammonia: { value: 0.05, status: 'warning', unit: 'mg/L', min: 0, max: 0.02, label: 'Ammonia (NH3)' },
  turbidity: { value: 12, status: 'normal', unit: 'NTU', min: 0, max: 25, label: 'Turbidity' },
};

// ===== 7-Day Sensor History =====
export const sensorHistory = {
  ph: [
    { day: 'Mon', value: 7.1 }, { day: 'Tue', value: 7.3 }, { day: 'Wed', value: 7.0 },
    { day: 'Thu', value: 7.2 }, { day: 'Fri', value: 6.8 }, { day: 'Sat', value: 7.4 }, { day: 'Sun', value: 7.2 },
  ],
  temperature: [
    { day: 'Mon', value: 27.5 }, { day: 'Tue', value: 28.0 }, { day: 'Wed', value: 28.4 },
    { day: 'Thu', value: 27.8 }, { day: 'Fri', value: 29.1 }, { day: 'Sat', value: 28.2 }, { day: 'Sun', value: 28.4 },
  ],
  ammonia: [
    { day: 'Mon', value: 0.01 }, { day: 'Tue', value: 0.02 }, { day: 'Wed', value: 0.03 },
    { day: 'Thu', value: 0.02 }, { day: 'Fri', value: 0.04 }, { day: 'Sat', value: 0.06 }, { day: 'Sun', value: 0.05 },
  ],
  turbidity: [
    { day: 'Mon', value: 8 }, { day: 'Tue', value: 10 }, { day: 'Wed', value: 9 },
    { day: 'Thu', value: 11 }, { day: 'Fri', value: 14 }, { day: 'Sat', value: 13 }, { day: 'Sun', value: 12 },
  ],
};

// ===== Correlation Data =====
export const correlationData = [
  { time: 'Mon', ph: 7.1, temp: 27.5, ammonia: 0.01, turbidity: 8, stress: 15 },
  { time: 'Tue', ph: 7.3, temp: 28.0, ammonia: 0.02, turbidity: 10, stress: 20 },
  { time: 'Wed', ph: 7.0, temp: 28.4, ammonia: 0.03, turbidity: 9, stress: 25 },
  { time: 'Thu', ph: 7.2, temp: 27.8, ammonia: 0.02, turbidity: 11, stress: 30 },
  { time: 'Fri', ph: 6.8, temp: 29.1, ammonia: 0.04, turbidity: 14, stress: 55 },
  { time: 'Sat', ph: 7.4, temp: 28.2, ammonia: 0.06, turbidity: 13, stress: 80 },
  { time: 'Sun', ph: 7.2, temp: 28.4, ammonia: 0.05, turbidity: 12, stress: 70 },
];

// ===== Alert Logs =====
export const alertLogs = [
  { id: 1, time: '10:25 AM', date: '2026-05-09', issue: 'Low Oxygen Level', action: 'Oxygen Pump Activated', severity: 'critical', source: 'IoT' },
  { id: 2, time: '09:10 AM', date: '2026-05-09', issue: 'Ammonia Spike', action: 'User Notified', severity: 'warning', source: 'IoT' },
  { id: 3, time: '08:15 AM', date: '2026-05-09', issue: 'Surface Gasping Detected', action: 'Alert Generated', severity: 'critical', source: 'CV' },
  { id: 4, time: '07:42 AM', date: '2026-05-09', issue: 'Slight Temperature Drop', action: 'Heater Adjusted', severity: 'warning', source: 'IoT' },
  { id: 5, time: '06:30 AM', date: '2026-05-09', issue: 'Erratic Swimming Pattern', action: 'Monitoring Increased', severity: 'warning', source: 'CV' },
  { id: 6, time: '11:20 PM', date: '2026-05-08', issue: 'pH Level Drop', action: 'Buffer Added', severity: 'warning', source: 'IoT' },
  { id: 7, time: '04:15 PM', date: '2026-05-08', issue: 'Chemical Stress Behavior', action: 'Water Change Recommended', severity: 'critical', source: 'CV' },
  { id: 8, time: '02:00 PM', date: '2026-05-08', issue: 'Turbidity Increase', action: 'Filter Check Alert', severity: 'warning', source: 'IoT' },
];

// ===== Detection Events (YOLO) =====
export const detectionEvents = [
  { id: 'F-001', behavior: 'Hypoxia', confidence: 94, position: 'Surface', camera: 'Top', color: '#ef4444' },
  { id: 'F-002', behavior: 'Normal', confidence: 98, position: 'Middle', camera: 'Front', color: '#22c55e' },
  { id: 'F-003', behavior: 'Normal', confidence: 96, position: 'Bottom', camera: 'Top', color: '#22c55e' },
  { id: 'F-004', behavior: 'Chemical Stress', confidence: 87, position: 'Bottom', camera: 'Front', color: '#f59e0b' },
  { id: 'F-005', behavior: 'Hypoxia', confidence: 91, position: 'Surface', camera: 'Top', color: '#ef4444' },
  { id: 'F-006', behavior: 'Normal', confidence: 99, position: 'Middle', camera: 'Front', color: '#22c55e' },
];

// ===== Stress History Events =====
export const stressHistory = [
  { id: 1, timestamp: '2026-05-09 10:25', type: 'Hypoxia', level: 85, duration: '12 min', trigger: 'Both', action: 'Oxygen Pump Activated' },
  { id: 2, timestamp: '2026-05-09 08:15', type: 'Surface Gasping', level: 78, duration: '8 min', trigger: 'CV', action: 'Alert Generated' },
  { id: 3, timestamp: '2026-05-08 16:15', type: 'Chemical Stress', level: 72, duration: '22 min', trigger: 'Both', action: 'Water Change Recommended' },
  { id: 4, timestamp: '2026-05-08 11:20', type: 'Erratic Swimming', level: 60, duration: '5 min', trigger: 'CV', action: 'Monitoring Increased' },
  { id: 5, timestamp: '2026-05-07 14:30', type: 'Hypoxia', level: 90, duration: '18 min', trigger: 'Both', action: 'Oxygen Pump Activated' },
  { id: 6, timestamp: '2026-05-07 09:45', type: 'Normal Recovery', level: 25, duration: '-', trigger: 'IoT', action: 'None' },
  { id: 7, timestamp: '2026-05-06 20:10', type: 'Chemical Stress', level: 65, duration: '10 min', trigger: 'IoT', action: 'User Notified' },
  { id: 8, timestamp: '2026-05-06 13:00', type: 'Hypoxia', level: 82, duration: '15 min', trigger: 'CV', action: 'Alert Generated' },
  { id: 9, timestamp: '2026-05-05 17:20', type: 'Surface Gasping', level: 70, duration: '7 min', trigger: 'Both', action: 'Oxygen Pump Activated' },
  { id: 10, timestamp: '2026-05-05 08:00', type: 'Normal', level: 12, duration: '-', trigger: '-', action: 'None' },
];

// ===== Heatmap Data (hourly stress by day) =====
export const heatmapData = [
  { day: 'Mon', hours: [5,8,10,12,15,20,35,40,30,55,70,80,75,65,85,80,70,55,45,30,20,15,10,8] },
  { day: 'Tue', hours: [3,5,8,10,12,18,25,30,45,50,60,65,70,55,60,50,40,35,25,18,12,8,5,3] },
  { day: 'Wed', hours: [8,10,15,20,22,30,40,50,55,65,75,85,90,80,75,70,60,45,35,25,18,12,10,8] },
  { day: 'Thu', hours: [4,6,8,12,15,20,28,35,42,48,55,60,58,50,45,40,32,25,20,15,10,8,5,4] },
  { day: 'Fri', hours: [6,8,12,18,25,35,45,55,60,72,80,88,92,85,90,82,70,55,40,30,22,15,10,7] },
  { day: 'Sat', hours: [10,12,18,22,28,38,48,58,65,75,82,90,88,78,72,65,55,42,32,22,15,12,10,8] },
  { day: 'Sun', hours: [5,7,10,14,18,22,30,38,50,58,68,78,72,65,55,48,38,28,22,18,12,8,6,5] },
];

// ===== Model Metrics =====
export const modelMetrics = {
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

// ===== Confusion Matrix =====
export const confusionMatrix = {
  labels: ['Normal', 'Hypoxia', 'Chemical Stress'],
  data: [
    [245, 8, 5],    // Normal predicted as...
    [6, 189, 12],   // Hypoxia predicted as...
    [4, 10, 172],   // Chemical Stress predicted as...
  ],
};

// ===== System Info =====
export const systemInfo = {
  raspberryPi: { status: 'online', cpuTemp: '52°C', cpuUsage: '68%', memory: '1.2GB / 4GB', uptime: '14d 6h 32m' },
  camera1: { name: 'Top Camera (Pi Cam)', status: 'online', resolution: '1080p', fps: 30 },
  camera2: { name: 'Front Camera (Pi Cam)', status: 'online', resolution: '1080p', fps: 30 },
  sensors: [
    { name: 'pH Sensor', status: 'online', lastReading: '2 sec ago' },
    { name: 'Temperature Sensor', status: 'online', lastReading: '1 sec ago' },
    { name: 'NPK Sensor (NH3)', status: 'online', lastReading: '3 sec ago' },
    { name: 'Turbidity Sensor', status: 'online', lastReading: '2 sec ago' },
  ],
};

// ===== Detection Distribution =====
export const detectionDistribution = [
  { name: 'Normal', value: 62, color: '#22c55e' },
  { name: 'Hypoxia', value: 25, color: '#ef4444' },
  { name: 'Chemical Stress', value: 13, color: '#f59e0b' },
];

// ===== Summary Stats for Stress History =====
export const stressSummary = {
  totalEventsWeek: 18,
  totalEventsMonth: 67,
  avgDuration: '11.5 min',
  commonTrigger: 'Both (CV + IoT)',
  peakTime: '12:00 PM - 2:00 PM',
};

// ===== Home Page Module Cards =====
export const moduleCards = [
  {
    id: 'fish-stress',
    title: 'Fish Stress Detection',
    status: 'High Stress Detected',
    statusType: 'critical',
    icon: 'Activity',
    description: 'AI-powered behavior analysis using YOLOv8n with late fusion IoT data',
    stats: { alerts: 5, accuracy: '94.2%' },
    color: 'red',
    path: '/fish-stress',
  },
  {
    id: 'fish-feeding',
    title: 'Automated Feeding',
    status: 'Next Feed: 2:00 PM',
    statusType: 'normal',
    icon: 'Fish',
    description: 'Smart feeding schedules and portion control for ornamental fish',
    stats: { alerts: 0, accuracy: '-' },
    color: 'emerald',
    path: '/fish-feeding',
  },
  {
    id: 'water-quality',
    title: 'Water Quality',
    status: 'All Parameters Normal',
    statusType: 'normal',
    icon: 'Droplets',
    description: 'Real-time IoT sensor monitoring for pH, temperature, and more',
    stats: { alerts: 1, accuracy: '-' },
    color: 'cyan',
    path: '/water-quality',
  },
  {
    id: 'disease-detection',
    title: 'Disease Detection',
    status: 'No Disease Detected',
    statusType: 'normal',
    icon: 'Microscope',
    description: 'Early disease identification and treatment recommendations',
    stats: { alerts: 0, accuracy: '-' },
    color: 'violet',
    path: '/disease-detection',
  },
];
