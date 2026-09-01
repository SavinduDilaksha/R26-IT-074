import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import BubblesBg from '../components/layout/BubblesBg';
import {
  Waves,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
} from 'lucide-react';

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('aquariummonitoring7@gmail.com');
  const [password, setPassword] = useState('$32aquarium');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  const { login, register, resetPassword, loginWithGoogle, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app/dashboard');
    } catch (err: any) {
      let msg = 'Login failed. Please check your credentials.';
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
        msg = 'Invalid email address or password.';
      } else if (err?.code === 'auth/user-not-found') {
        msg = 'No account found with this email address.';
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(email, password, name);
      setSuccess('Account created successfully! Redirecting to console…');
      setTimeout(() => navigate('/app/dashboard'), 1200);
    } catch (err: any) {
      let msg = 'Registration failed. Please try again.';
      if (err?.code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists. Please Sign In.';
      } else if (err?.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters.';
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate('/app/dashboard');
    } catch (err: any) {
      setError('Google Sign In failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    loginAsDemo();
    navigate('/app/dashboard');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    if (!resetEmail) {
      setResetError('Please enter your registered email address');
      return;
    }
    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      setResetSuccess('Password reset link sent! Check your inbox.');
    } catch (err: any) {
      setResetError(err?.message || 'Failed to send reset email.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 selection:bg-teal-500/30 overflow-x-hidden">
      <BubblesBg />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md glass rounded-3xl p-5 sm:p-8 border border-ocean-700/50 shadow-2xl shadow-ocean-950/90 my-auto"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-ocean-400 via-teal-400 to-plum-500 mb-3 shadow-lg shadow-ocean-900/50">
            <Waves size={30} className="text-white" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ocean-100">
            AquaSphere Console
          </h1>
          <p className="font-mono text-xs text-ocean-400 mt-1">
            Smart Aquarium Operations & Research Pipeline
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-ocean-950/60 p-1 rounded-2xl border border-ocean-700/50 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-semibold transition-all ${
              mode === 'signin'
                ? 'bg-gradient-to-r from-ocean-500 to-teal-500 text-white shadow-md'
                : 'text-ocean-400 hover:text-ocean-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-semibold transition-all ${
              mode === 'register'
                ? 'bg-gradient-to-r from-ocean-500 to-teal-500 text-white shadow-md'
                : 'text-ocean-400 hover:text-ocean-200'
            }`}
          >
            Register / Sign Up
          </button>
        </div>

        {/* Alert Feedback */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-3.5 rounded-2xl bg-coral-500/15 border border-coral-500/40 text-coral-200 text-xs font-mono flex items-start gap-2.5"
          >
            <AlertCircle size={16} className="text-coral-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-3.5 rounded-2xl bg-teal-500/15 border border-teal-500/40 text-teal-200 text-xs font-mono flex items-start gap-2.5"
          >
            <CheckCircle2 size={16} className="text-teal-400 shrink-0 mt-0.5" />
            <span>{success}</span>
          </motion.div>
        )}

        {/* Forms */}
        {mode === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-ocean-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ocean-500" size={17} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-ocean-950/70 border border-ocean-700/60 rounded-xl pl-10 pr-4 py-3 text-sm text-ocean-100 placeholder-ocean-600 focus:outline-none focus:border-teal-400 transition-colors"
                  placeholder="operator@aquasphere.io"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-ocean-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ocean-500" size={17} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-ocean-950/70 border border-ocean-700/60 rounded-xl pl-10 pr-10 py-3 text-sm text-ocean-100 placeholder-ocean-600 focus:outline-none focus:border-teal-400 transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ocean-500 hover:text-ocean-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-ocean-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-ocean-700 bg-ocean-900 text-teal-400 focus:ring-0 cursor-pointer"
                />
                <span>Remember session</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setShowResetModal(true);
                }}
                className="hover:text-teal-300 transition-colors underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-accent py-3.5 text-sm flex items-center justify-center gap-2 font-semibold shadow-lg shadow-teal-500/20 disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Authenticating…</span>
                </>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-ocean-300 mb-1.5 uppercase tracking-wider">
                Full Name / Operator Title
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ocean-500" size={17} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-ocean-950/70 border border-ocean-700/60 rounded-xl pl-10 pr-4 py-3 text-sm text-ocean-100 placeholder-ocean-600 focus:outline-none focus:border-teal-400 transition-colors"
                  placeholder="e.g. Dilshan Perera"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-ocean-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ocean-500" size={17} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-ocean-950/70 border border-ocean-700/60 rounded-xl pl-10 pr-4 py-3 text-sm text-ocean-100 placeholder-ocean-600 focus:outline-none focus:border-teal-400 transition-colors"
                  placeholder="name@organization.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-ocean-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ocean-500" size={17} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-ocean-950/70 border border-ocean-700/60 rounded-xl pl-10 pr-10 py-3 text-sm text-ocean-100 placeholder-ocean-600 focus:outline-none focus:border-teal-400 transition-colors"
                  placeholder="Min 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ocean-500 hover:text-ocean-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-ocean-300 mb-1.5 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ocean-500" size={17} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-ocean-950/70 border border-ocean-700/60 rounded-xl pl-10 pr-4 py-3 text-sm text-ocean-100 placeholder-ocean-600 focus:outline-none focus:border-teal-400 transition-colors"
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-accent py-3.5 text-sm flex items-center justify-center gap-2 font-semibold shadow-lg shadow-teal-500/20 disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Creating Account…</span>
                </>
              ) : (
                <>
                  <span>Create Firebase Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Divider & Social Sign In */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ocean-800/80" />
          </div>
          <div className="relative flex justify-center text-[10px] font-mono uppercase">
            <span className="bg-ocean-900/90 px-3 text-ocean-500">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl glass border border-ocean-700/60 hover:bg-ocean-800/50 text-xs font-mono text-ocean-200 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={handleDemoSignIn}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-xs font-mono text-teal-300 transition-all cursor-pointer"
          >
            <Sparkles size={14} className="text-teal-300" />
            <span>Demo Guest</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-5 border-t border-ocean-800/60 flex items-center justify-center gap-2 text-[11px] font-mono text-ocean-500">
          <ShieldCheck size={14} className="text-teal-400 shrink-0" />
          <span>Firebase Auth & IoT Security Protected</span>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm glass rounded-3xl p-6 border border-ocean-700/60 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-ocean-100">Reset Password</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetError('');
                    setResetSuccess('');
                  }}
                  className="text-ocean-400 hover:text-ocean-100"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-ocean-400 leading-relaxed font-sans">
                Enter your registered email address and we will send you a link to reset your password.
              </p>

              {resetError && (
                <div className="p-3 rounded-xl bg-coral-500/15 border border-coral-500/30 text-coral-300 text-xs font-mono">
                  {resetError}
                </div>
              )}

              {resetSuccess && (
                <div className="p-3 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-mono">
                  {resetSuccess}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-ocean-400 mb-1 uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-ocean-950/80 border border-ocean-700/60 rounded-xl px-3.5 py-2.5 text-sm text-ocean-100 focus:outline-none focus:border-teal-400"
                    placeholder="operator@aquasphere.io"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 btn-accent py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    {resetLoading ? <RefreshCw size={14} className="animate-spin" /> : 'Send Reset Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetModal(false);
                      setResetError('');
                      setResetSuccess('');
                    }}
                    className="btn-ghost py-2.5 text-xs"
                  >
                    Close
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
