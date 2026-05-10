import React from 'react';
import { Fish } from 'lucide-react';
import EmptyPlaceholder from '../../components/ui/EmptyPlaceholder';

export default function FishFeedingPage() {
  return (
    <EmptyPlaceholder
      title="Automated Fish Feeding"
      description="Smart feeding schedules and intelligent portion control for ornamental Molly fish. This module handles automated feeding dispensing, nutrition tracking, and schedule management."
      icon={Fish}
      color="emerald"
      tabs={['Feeding Schedule', 'Feed Analytics', 'Dispenser Control']}
    />
  );
}
