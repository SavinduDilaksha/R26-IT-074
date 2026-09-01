import type { ViewKey } from '@/App';
import type { AlertItem, FishGroup, FoodEntry } from '@/lib/data';

export interface PageProps {
  tanks: FishGroup[];
  setTanks: React.Dispatch<React.SetStateAction<FishGroup[]>>;
  feedLog: FoodEntry[];
  setFeedLog: React.Dispatch<React.SetStateAction<FoodEntry[]>>;
  alerts: AlertItem[];
  setAlerts: React.Dispatch<React.SetStateAction<AlertItem[]>>;
  totalFish: number;
  fedToday: number;
  activeFeedingFish: number;
  onNavigate: (next: ViewKey) => void;
}
