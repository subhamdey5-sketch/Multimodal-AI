import React, { useState } from 'react';
import {
  Sliders,
  User,
  ShieldCheck,
  Cpu,
  Sparkles,
  Save,
  Check,
  AlertCircle,
  Database,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  const [domainPreference, setDomainPreference] = useState('Enterprise & Business');
  const [temperature, setTemperature] = useState(0.3);
  const [autoTagging, setAutoTagging] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-slate-950 text-slate-100 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 rounded bg-cyan-500/10 text-cyan-400">
            <Sliders className="h-4 w-4" />
          </span>
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
            Workspace Preferences & Intelligence Parameters
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">
          Settings & Configuration
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage multimodal reasoning parameters, user identity, and Gemini execution profiles
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Identity Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <User className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              User Profile & Role
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                disabled
                value={user?.full_name || 'Dr. Evelyn Vance'}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-300 opacity-90 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Authorized Email
              </label>
              <input
                type="email"
                disabled
                value={user?.email || 'demo@omnimind.ai'}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-300 opacity-90 cursor-not-allowed font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Institutional Role
              </label>
              <input
                type="text"
                disabled
                value={user?.role || 'Principal Research Scientist'}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-300 opacity-90 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Multimodal Reasoning Parameters */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Cpu className="h-4 w-4 text-indigo-400" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Gemini Multimodal Parameters
            </h3>
          </div>

          {/* Model Status info */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
              </span>
              <div>
                <p className="text-xs font-bold text-white">Active Core Model: gemini-3.8-flash</p>
                <p className="text-[11px] font-mono text-slate-400">
                  Native multimodal streaming, zero-shot structured JSON schemas & long-context window
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
              OPERATIONAL
            </span>
          </div>

          {/* Domain Default */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Default Analytical Domain
            </label>
            <select
              value={domainPreference}
              onChange={(e) => setDomainPreference(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-cyan-500/60"
            >
              <option value="Enterprise & Business">Enterprise & Business Intelligence</option>
              <option value="Education & Research">Education & Empirical Research</option>
              <option value="Technical & Engineering">Technical & Systems Engineering</option>
              <option value="Media & Content">Media & Strategic Content Creation</option>
            </select>
          </div>

          {/* Temperature Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                Inference Temperature
              </label>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                {temperature} (Strict Precision)
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Lower temperatures (0.1–0.3) ensure factual precision and strict cross-modal citation fidelity.
            </p>
          </div>

          {/* Auto Tagging Switch */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoTagging}
                onChange={(e) => setAutoTagging(e.target.checked)}
                className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0"
              />
              <div>
                <span className="text-xs font-medium text-slate-200 block">
                  Automatic Knowledge Extraction & JSON Schemas upon Upload
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Immediately generate categories, summaries, sentiment, and topic tags on media ingestion.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Server Security Notice */}
        <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 text-xs text-slate-400 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-200">
              Enterprise Security & RLS Isolation
            </p>
            <p className="text-[11px] leading-relaxed">
              All credentials and JWT session tokens are verified server-side. Media uploads are stored in an isolated tenant volume with row-level security filters enforcing user boundary separation.
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <Check className="h-4 w-4" /> Preferences Saved
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Save Workspace Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
