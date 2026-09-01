import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BubblesBg from '../components/layout/BubblesBg';
import {
  Waves,
  Activity,
  Fish,
  Droplets,
  Microscope,
  ArrowRight,
  ChevronDown,
  Cpu,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Activity,
    title: 'AI Stress Detection',
    description: 'YOLOv8n powered real-time behavior analysis with late fusion architecture',
    color: 'from-rose-500/20 to-coral-500/20',
    border: 'border-rose-500/30',
    iconColor: 'text-rose-400',
    tag: 'YOLOv8 + IoT',
  },
  {
    icon: Fish,
    title: 'Smart Feeding',
    description: 'Automated scheduling and intelligent portion control for ornamental fish',
    color: 'from-teal-500/20 to-emerald-500/20',
    border: 'border-teal-500/30',
    iconColor: 'text-teal-300',
    tag: 'Behavior Triggered',
  },
  {
    icon: Droplets,
    title: 'Water Quality XAI',
    description: 'Real-time IoT sensor monitoring for pH, temp, ammonia with XAI toxicity forecasting',
    color: 'from-ocean-500/20 to-cyan-500/20',
    border: 'border-cyan-500/30',
    iconColor: 'text-cyan-300',
    tag: 'Explainable AI',
  },
  {
    icon: Microscope,
    title: 'Disease Detection',
    description: 'Early disease identification with AI multimodal diagnosis & treatment recommendations',
    color: 'from-plum-500/20 to-purple-500/20',
    border: 'border-plum-500/30',
    iconColor: 'text-purple-300',
    tag: 'CNN Classifier',
  },
];

const TECH_STACK = [
  { label: 'React + TypeScript', icon: '⚛️' },
  { label: 'YOLOv8 (Nano)', icon: '🧠' },
  { label: 'Tailwind CSS', icon: '🎨' },
  { label: 'Raspberry Pi 4', icon: '🍓' },
  { label: 'IoT Sensors', icon: '📡' },
  { label: 'Recharts', icon: '📊' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen relative text-ocean-100 font-sans selection:bg-teal-500/30 overflow-x-hidden">
      <BubblesBg />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-12 py-4 glass border-b border-ocean-800/40 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-ocean-400 via-teal-400 to-plum-500 flex items-center justify-center shadow-lg shadow-ocean-900/50">
            <Waves size={20} className="text-white" />
          </div>
          <div>
            <span className="font-display text-xl text-gradient font-bold">AquaSphere</span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
              PRO
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/app/dashboard')}
            className="hidden sm:block text-xs font-mono text-ocean-300 hover:text-white transition-colors"
          >
            Live Demo
          </button>
          <button onClick={() => navigate('/login')} className="btn-accent text-sm">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full glass border border-teal-500/30 text-[10px] sm:text-xs font-mono text-teal-300 mb-6 sm:mb-8 shadow-lg shadow-teal-900/20 max-w-full text-center">
            <Sparkles size={14} className="text-teal-300 animate-pulse shrink-0" />
            <span className="truncate sm:whitespace-normal">AI-Driven Smart Aquarium Operations & Research</span>
          </div>

          <h1 className="font-display text-3xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6 leading-tight">
            Next-Gen Aquarium <br />
            <span className="text-gradient">Intelligence System</span>
          </h1>

          <p className="text-sm sm:text-xl text-ocean-300 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-sans px-2">
            Real-time fish stress detection, water toxicity forecasting with XAI, automated feeding
            dispatch, and AI disease diagnosis — powered by deep learning and IoT sensors.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full max-w-xs sm:max-w-none mx-auto">
            <button
              onClick={() => navigate('/app/dashboard')}
              className="btn-accent w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-teal-500/20 group"
            >
              <span>Launch Console</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={scrollToFeatures}
              className="btn-ghost w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base flex items-center justify-center gap-2 text-ocean-200"
            >
              <span>Explore Features</span>
              <ChevronDown size={18} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-teal-300 uppercase tracking-widest mb-2">
            System Modules & Capabilities
          </p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-ocean-100">
            Intelligent Aquarium Management
          </h2>
          <p className="text-ocean-400 max-w-lg mx-auto mt-3 text-sm">
            Four integrated AI modules working seamlessly together for ornamental fish health &
            welfare
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-3xl p-6 border border-ocean-800/60 hover:border-ocean-500/50 transition-all duration-300 group hover:-translate-y-1 relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-2xl bg-gradient-to-br ${feature.color} border ${feature.border}`}
                  >
                    <Icon size={24} className={feature.iconColor} />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ocean-800/60 text-ocean-300 border border-ocean-700">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="font-display text-xl text-ocean-100 mb-2">{feature.title}</h3>
                <p className="text-xs text-ocean-400 leading-relaxed font-sans">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Tech Stack Banner */}
      <section className="relative z-10 py-16 px-6 border-t border-ocean-800/60 glass">
        <div className="max-w-5xl mx-auto">
          <p className="text-center font-mono text-xs text-ocean-500 uppercase tracking-widest mb-8">
            Engineered with Modern Hardware & Software Stack
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {TECH_STACK.map((tech, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-ocean-700/50 text-xs font-mono text-ocean-300"
              >
                <span>{tech.icon}</span>
                <span>{tech.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 border-t border-ocean-800/40 text-center text-xs font-mono text-ocean-500">
        © 2026 AquaSphere / AquaVision — Research & Smart Aquarium Management System
      </footer>
    </div>
  );
}
