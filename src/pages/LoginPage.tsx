import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, Sparkles, Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('demo@omnimind.ai');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError(null);
    setLoading(true);
    try {
      await quickDemoLogin();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl relative">
        {/* Glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-20 bg-cyan-500/20 blur-2xl pointer-events-none" />

        {/* Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 mb-3">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950">
              <BrainCircuit className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Welcome to OmniMind AI
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your secure multimodal research workspace
          </p>
        </div>

        {/* 1-Click Demo Quick Access Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleDemo}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-md shadow-cyan-500/10 active:scale-95 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Instant Demo Sign-In (Dr. Evelyn Vance)</span>
          </button>
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono">
              <span className="bg-slate-900 px-3 text-slate-400">or sign in with email</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="scientist@organization.com"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline font-semibold">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
