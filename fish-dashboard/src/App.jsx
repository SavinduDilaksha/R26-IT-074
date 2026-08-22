import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import FishStressPage from './pages/FishStress';
import FishFeedingPage from './pages/FishFeeding';
import WaterQualityPage from './pages/WaterQuality';
import DiseaseDetectionPage from './pages/DiseaseDetection';

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes (inside MainLayout) */}
      <Route element={<MainLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/fish-stress" element={<FishStressPage />} />
        <Route path="/fish-feeding" element={<FishFeedingPage />} />
        <Route path="/water-quality" element={<WaterQualityPage />} />
        <Route path="/disease-detection" element={<DiseaseDetectionPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
