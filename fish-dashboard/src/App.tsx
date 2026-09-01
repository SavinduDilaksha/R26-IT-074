import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import BubblesBg from './components/layout/BubblesBg';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import DashboardPage from './pages/DashboardPage';
import VisionPage from './pages/VisionPage';
import DiagnosticsPage from './pages/DiagnosticsPage';
import WaterQualityPage from './pages/WaterQualityPage';
import FeederPage from './pages/FeederPage';
import TanksPage from './pages/TanksPage';
import AlertsPage from './pages/AlertsPage';
import { LogOut, RefreshCw } from 'lucide-react';
import {
  subscribeToFeeding,
  subscribeToDisease,
  subscribeToWaterQuality,
  subscribeToBehavior,
} from './lib/firebase';
import {
  ALERTS,
  BEHAVIOURS,
  INITIAL_FEED_LOG,
  INITIAL_TANKS,
  type AlertItem,
  type FishGroup,
  type FoodEntry,
} from './lib/data';

export type ViewKey =
  | 'dashboard'
  | 'vision'
  | 'diagnostics'
  | 'water'
  | 'feeder'
  | 'tanks'
  | 'alerts';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center bg-ocean-950 text-ocean-100">
        <BubblesBg />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-ocean-400 via-teal-400 to-plum-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <RefreshCw size={24} className="text-white animate-spin" />
          </div>
          <p className="font-mono text-xs text-ocean-400">Verifying AquaSphere Session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function MainAppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Derive current view from path
  const currentPath = location.pathname.replace('/app/', '') || 'dashboard';
  const view: ViewKey = (['dashboard', 'vision', 'diagnostics', 'water', 'feeder', 'tanks', 'alerts'].includes(currentPath)
    ? currentPath
    : 'dashboard') as ViewKey;

  const [tanks, setTanks] = useState<FishGroup[]>(INITIAL_TANKS);
  const [feedLog, setFeedLog] = useState<FoodEntry[]>(INITIAL_FEED_LOG);
  const [alerts, setAlerts] = useState<AlertItem[]>(ALERTS);

  // Subscribe to Realtime Database nodes across the 5-stage monitoring cycle
  useEffect(() => {
    const unsubFeeding = subscribeToFeeding((data) => {
      if (!data) return;
      // 1. Tanks
      if (data.tanks && typeof data.tanks === 'object') {
        const tankList: FishGroup[] = Object.values(data.tanks);
        if (tankList.length > 0) setTanks(tankList);
      } else if (data.hunger) {
        // Construct live tank state from top camera hunger observation
        const hungryCount = data.hunger.hungry_count ?? 2;
        setTanks((prev) =>
          prev.map((t) =>
            t.id === 1
              ? {
                  ...t,
                  count: Math.max(t.count, hungryCount),
                  behaviour: hungryCount > 0 ? 'eager' : 'calm',
                  fedToday: !!data.feed?.dispensed,
                }
              : t
          )
        );
      }

      // 2. Feed History Log
      if (data.history && typeof data.history === 'object') {
        const entries: FoodEntry[] = Object.entries(data.history).map(([key, val]: [string, any], idx) => ({
          id: idx + 1,
          time: val.timestamp ? new Date(val.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }) : 'Just now',
          group: val.group || 'Main Display',
          food: val.food || 'flake',
          behaviourCount: val.hungry_count || val.rounds || 2,
          amount: val.dispensed_amount || val.amount || 0.10,
          note: val.is_automatic ? 'automatic feed (top camera)' : 'manual override',
        }));
        if (entries.length > 0) setFeedLog(entries.reverse());
      }
    });

    const unsubDisease = subscribeToDisease((data) => {
      if (!data) return;
      const d = data.latest || data;
      if (d.disease && d.disease !== 'Healthy Fish' && d.disease !== 'No anomaly') {
        setAlerts((prev) => {
          const filtered = prev.filter((a) => a.source !== 'Vision' || a.title.includes('Stress'));
          return [
            {
              id: 997,
              title: `Disease Alert: ${d.disease}`,
              description: d.reason || `Detected with ${Math.round((d.confidence || 0.45) * 100)}% confidence`,
              severity: (d.confidence || 0.45) > 0.7 ? 'Critical' : 'Warning',
              source: 'Vision',
              time: 'Just now',
            },
            ...filtered,
          ];
        });
      }
    });

    const unsubWater = subscribeToWaterQuality((data) => {
      if (!data) return;
      const wq = data.water_quality || data;
      const shap = data.shap || {};
      const status = wq.water_quality_status || wq.water_quality;
      if (status === 'Critical' || status === 'Poor' || status === 'Moderate' || (wq.bad_probability && wq.bad_probability >= 0.25)) {
        setAlerts((prev) => {
          const filtered = prev.filter((a) => a.source !== 'Water Quality');
          return [
            {
              id: 998,
              title: `Water Quality Notice (${shap.primary_factor || 'pH'} Deviation)`,
              description: shap.issue_detected || 'Low Acidic pH (5.75) detected. Recommended: partial water change to replenish buffer.',
              severity: 'Warning',
              source: 'Water Quality',
              time: 'Just now',
            },
            ...filtered,
          ];
        });
      }
    });

    const unsubBehavior = subscribeToBehavior((data) => {
      if (!data) return;
      const count = Math.min(data.behavior?.fish_count ?? 6, 6);
      const isHighStress = data.stress?.tank_stress_level === 'High Stress';
      setTanks([
        {
          id: 1,
          name: 'Main Display (YOLOv8)',
          species: 'Molly',
          count: count,
          behaviour: isHighStress ? 'slow' : 'calm',
          fedToday: true,
        },
      ]);

      if (isHighStress) {
        setAlerts((prev) => {
          const filtered = prev.filter((a) => !a.title.includes('High Tank Stress'));
          return [
            {
              id: 999,
              title: `High Tank Stress: ${data.stress?.fused_primary_reason || 'pH Anomaly'}`,
              description: `Late-fusion stress score recorded at ${Math.round((data.stress?.tank_stress_score || 0.62) * 100)}% (${data.stress?.tank_stress_level}).`,
              severity: 'Warning',
              source: 'Vision',
              time: 'Just now',
            },
            ...filtered,
          ];
        });
      }
    });

    return () => {
      unsubFeeding();
      unsubDisease();
      unsubWater();
      unsubBehavior();
    };
  }, []);

  const totalFish = useMemo(() => tanks.reduce((s, t) => s + t.count, 0), [tanks]);
  const fedToday = useMemo(
    () => tanks.filter((t) => t.fedToday).reduce((s, t) => s + t.count, 0),
    [tanks],
  );
  const activeFeedingFish = useMemo(
    () =>
      tanks
        .filter((t) => BEHAVIOURS[t.behaviour]?.feeding)
        .reduce((s, t) => s + t.count, 0),
    [tanks],
  );
  const activeAlerts = useMemo(
    () => alerts.filter((a) => a.severity === 'Critical' || a.severity === 'Warning').length,
    [alerts],
  );

  function handleNavigate(next: ViewKey) {
    navigate(`/app/${next}`);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const pageProps = {
    tanks,
    setTanks,
    feedLog,
    setFeedLog,
    alerts,
    setAlerts,
    totalFish,
    fedToday,
    activeFeedingFish,
    onNavigate: handleNavigate,
  } as const;

  return (
    <div className="min-h-screen relative font-sans selection:bg-teal-500/30">
      <BubblesBg />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar
          active={view}
          onSelect={handleNavigate}
          totalFish={totalFish}
          fedToday={fedToday}
          activeAlerts={activeAlerts}
        />

        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          {/* Mobile top bar */}
          <header className="lg:hidden flex items-center justify-between px-4 py-3 glass border-b border-ocean-800/60 sticky top-0 z-20 backdrop-blur-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ocean-400 via-teal-400 to-plum-500 flex items-center justify-center shadow-md">
                <span className="text-sm">🐠</span>
              </div>
              <div>
                <div className="font-display text-sm font-bold text-ocean-100 leading-tight">
                  AquaSphere
                </div>
                <div className="font-mono text-[9px] text-ocean-400 tracking-wider">
                  {user ? user.name : 'Operator Console'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="font-mono text-[10px] text-ocean-400 hidden sm:block">
                {totalFish} fish · {fedToday} fed
              </div>
              <button
                onClick={() => logout()}
                title="Sign Out"
                className="p-1.5 rounded-lg bg-ocean-800/60 hover:bg-rose-500/20 text-ocean-300 hover:text-rose-300 transition-colors border border-ocean-700/50"
              >
                <LogOut size={15} />
              </button>
            </div>
          </header>

          <main className="flex-1 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-28 lg:pb-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {view === 'dashboard' && <DashboardPage {...pageProps} />}
                  {view === 'vision' && <VisionPage {...pageProps} />}
                  {view === 'diagnostics' && <DiagnosticsPage {...pageProps} />}
                  {view === 'water' && <WaterQualityPage {...pageProps} />}
                  {view === 'feeder' && <FeederPage {...pageProps} />}
                  {view === 'tanks' && <TanksPage {...pageProps} />}
                  {view === 'alerts' && <AlertsPage {...pageProps} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>

      <MobileNav active={view} onSelect={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <MainAppShell />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
