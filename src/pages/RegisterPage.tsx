import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, Lock, Mail, User, ArrowRight, Loader2, AlertCircle, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Principal AI Researcher');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await register({
        full_name: fullName,
        email,
        password,
        role,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-20 bg-indigo-500/20 blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 mb-3">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950">
              <BrainCircuit className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Create OmniMind AI Account
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise multimodal intelligence workspace
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Katherine Chen"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="k.chen@enterprise.org"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Primary Role / Specialization
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Systems Architect / Scientist"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Password (min. 8 characters)
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
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Create Workspace Account</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
