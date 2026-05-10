import React from 'react';
import { useNavigate } from 'react-router-dom';
import BubbleBackground from '../components/ui/BubbleBackground';
import {
  Waves,
  Activity,
  Fish,
  Droplets,
  Microscope,
  ArrowRight,
  ChevronDown,
  Cpu,
  Wifi,
} from 'lucide-react';

const features = [
  {
    icon: Activity,
    title: 'AI Stress Detection',
    description: 'YOLOv8n powered real-time behavior analysis with late fusion architecture',
    color: 'from-red-500/20 to-rose-500/20',
    border: 'border-red-500/20',
    iconColor: 'text-red-400',
  },
  {
    icon: Fish,
    title: 'Smart Feeding',
    description: 'Automated scheduling and intelligent portion control for ornamental fish',
    color: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Droplets,
    title: 'Water Quality',
    description: 'Real-time IoT sensor monitoring for pH, temperature, ammonia & turbidity',
    color: 'from-cyan-500/20 to-sky-500/20',
    border: 'border-cyan-500/20',
    iconColor: 'text-cyan-400',
  },
  {
    icon: Microscope,
    title: 'Disease Detection',
    description: 'Early disease identification with AI-powered diagnosis and treatment alerts',
    color: 'from-violet-500/20 to-purple-500/20',
    border: 'border-violet-500/20',
    iconColor: 'text-violet-400',
  },
];

const techStack = [
  { label: 'React', icon: '⚛️' },
  { label: 'YOLOv8', icon: '🧠' },
  { label: 'Firebase', icon: '🔥' },
  { label: 'Raspberry Pi', icon: '🍓' },
  { label: 'IoT Sensors', icon: '📡' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30 relative overflow-x-hidden">
      <BubbleBackground />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 py-4 bg-[#020617]/60 backdrop-blur-md border-b border-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/20">
              <Waves className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              AquaVision
            </span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 text-sm font-medium rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 hover:bg-slate-800/50 transition-all"
          >
            Sign In
          </button>
        </nav>

        {/* Hero content */}
        <div className="text-center max-w-3xl animate-fadeIn">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/15 to-cyan-500/15 border border-blue-500/20 mb-8 shadow-[0_0_40px_rgba(59,130,246,0.08)]">
            <Waves className="w-10 h-10 text-blue-400" />
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300">
              AquaVision
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 mb-3 font-medium">
            ML/DL & IoT Driven Smart Aquarium Monitoring System
          </p>
          <p className="text-sm text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">
            Real-time fish stress detection, water quality monitoring, automated feeding,
            and disease detection — all powered by artificial intelligence and IoT sensors
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="group px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={scrollToFeatures}
              className="px-8 py-3.5 border border-slate-700 text-slate-300 font-medium rounded-xl hover:bg-slate-800/50 hover:border-slate-600 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              Learn More
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 animate-bounce">
          <ChevronDown className="w-5 h-5 text-slate-600" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-blue-400 font-semibold uppercase tracking-wider mb-2">System Modules</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Intelligent Aquarium Management
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              Four integrated AI-powered modules working together to ensure optimal aquarium health
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className={`group bg-slate-900/40 backdrop-blur-md border ${feature.border} rounded-2xl p-6 hover:bg-slate-800/40 transition-all duration-300 hover:-translate-y-1`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} border ${feature.border} mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="relative z-10 py-16 px-6 border-t border-slate-800/40">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm text-slate-500 mb-8 uppercase tracking-wider font-medium">Powered By</p>
          <div className="flex flex-wrap justify-center gap-4">
            {techStack.map((tech, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-800/60 rounded-lg text-sm text-slate-400"
              >
                <span>{tech.icon}</span>
                <span>{tech.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 border-t border-slate-800/40 text-center">
        <p className="text-sm text-slate-600">
          © 2026 AquaVision — R26-IT-074 Research Project
        </p>
      </footer>
    </div>
  );
}
