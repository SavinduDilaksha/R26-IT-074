import React from 'react';
import { Microscope } from 'lucide-react';
import EmptyPlaceholder from '../../components/ui/EmptyPlaceholder';

export default function DiseaseDetectionPage() {
  return (
    <EmptyPlaceholder
      title="Fish Disease Detection"
      description="AI-powered early disease identification and diagnosis for ornamental Molly fish. This module provides treatment recommendations and health tracking using computer vision."
      icon={Microscope}
      color="violet"
      tabs={['Disease Dashboard', 'Diagnosis History', 'Treatment Logs']}
    />
  );
}
