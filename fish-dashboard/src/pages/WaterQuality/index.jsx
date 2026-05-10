import React from 'react';
import { Droplets } from 'lucide-react';
import EmptyPlaceholder from '../../components/ui/EmptyPlaceholder';

export default function WaterQualityPage() {
  return (
    <EmptyPlaceholder
      title="Water Quality Monitoring"
      description="Real-time IoT sensor monitoring for pH, temperature, ammonia, turbidity and other water parameters. This module ensures optimal water conditions for ornamental fish health."
      icon={Droplets}
      color="cyan"
      tabs={['Water Dashboard', 'Parameter Trends', 'Filtration Control']}
    />
  );
}
