import React, { useState } from 'react';
import TabNavigation from '../../components/ui/TabNavigation';
import DashboardTab from './DashboardTab';
import LiveMonitoringTab from './LiveMonitoringTab';
import SensorAnalyticsTab from './SensorAnalyticsTab';
import StressHistoryTab from './StressHistoryTab';
import CareGuideTab from './CareGuideTab';
import {
  LayoutDashboard,
  Camera,
  BarChart2,
  History,
  HeartPulse,
} from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'live', label: 'Live Monitoring', icon: Camera },
  { id: 'sensors', label: 'Sensor Data', icon: BarChart2 },
  { id: 'history', label: 'Stress History', icon: History },
  { id: 'care', label: 'Care Guide', icon: HeartPulse },
];

const tabComponents = {
  dashboard: DashboardTab,
  live: LiveMonitoringTab,
  sensors: SensorAnalyticsTab,
  history: StressHistoryTab,
  care: CareGuideTab,
};

export default function FishStressPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const ActiveComponent = tabComponents[activeTab];

  return (
    <div>
      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="animate-fadeIn" key={activeTab}>
        <ActiveComponent />
      </div>
    </div>
  );
}
