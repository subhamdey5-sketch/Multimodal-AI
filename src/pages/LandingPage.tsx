import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Sparkles,
  ArrowRight,
  FileText,
  FileAudio,
  FileVideo,
  FileImage,
  Layers,
  ShieldCheck,
  Zap,
  BarChart3,
  Cpu,
  CheckCircle2,
  FileDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const handleLaunchDemo = async () => {
    if (!user) {
      await quickDemoLogin();
    }
    navigate('/workspace');
  };

  const domains = [
    {
      title: 'Enterprise & Business Intelligence',
      desc: 'Cross-reference financial filings, board memos, and executive audio recordings to reveal margin trends and hidden discrepancies.',
      icon: Layers,
      color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400',
      sample: 'Q3 Semiconductor Audit vs Audio Notes',
    },
    {
      title: 'Education & Empirical Research',
      desc: 'Ingest arXiv research papers, lecture recordings, and lab schematics. Generate literature reviews and empirical correlation matrices.',
      icon: BrainCircuit,
      color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-400',
      sample: 'Deep MoE Transformer Topology',
    },
    {
      title: 'Technical & Systems Engineering',
      desc: 'Analyze CAD schematics, system architecture diagrams, and drone thermal video streams for predictive diagnostic alerts.',
      icon: Cpu,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
      sample: 'Thermal Drone Photovoltaic Inspection',
    },
    {
      title: 'Media & Strategic Content Creation',
      desc: 'Transcribe podcasts, tag video scenes, identify sentiment shifts, and draft multi-platform executive summaries in seconds.',
      icon: Zap,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
      sample: 'Podcast Synthesis & Scene Indexing',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-cyan-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-20 max-w-6xl mx-auto text-center">
        {/* Release badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 mb-8 backdrop-blur-md shadow-inner">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono text-cyan-300 font-semibold">Gemini 3.8 Flash</span>
          <span className="text-slate-500">•</span>
          <span>Unified Cross-Modal Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Ingest, Cross-Reference & Reason Across{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
            Every Modality
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          OmniMind AI connects fragmented data silos. Ingest complex PDFs, audio recordings, video feeds, and high-resolution diagrams into a singular cognitive reasoning canvas.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleLaunchDemo}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-cyan-500/25 active:scale-95 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Launch Studio (Live Demo)</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <Link
            to="/register"
            className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-sm transition-all"
          >
            Create Free Account
          </Link>
        </div>

        {/* Supported Media Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300">
            <FileText className="h-3.5 w-3.5 text-blue-400" />
            <span>PDF & Scanned Documents</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300">
            <FileAudio className="h-3.5 w-3.5 text-amber-400" />
            <span>MP3 & WAV Audio Streams</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300">
            <FileVideo className="h-3.5 w-3.5 text-purple-400" />
            <span>MP4 & Aerial Video</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300">
            <FileImage className="h-3.5 w-3.5 text-emerald-400" />
            <span>Schematics & High-Res PNG</span>
          </div>
        </div>
      </section>

      {/* Interactive Showcase Preview */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-24">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-4 sm:p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono text-slate-400">
                Studio Session: Supply Chain Discrepancy & Audio Cross-Check
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/50">
              Cross-Modal Synthesis Active
            </span>
          </div>

          <div className="space-y-4">
            {/* User prompt simulation */}
            <div className="flex justify-end">
              <div className="p-3.5 rounded-2xl rounded-tr-sm bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-500/30 text-xs text-white max-w-xl">
                <p className="font-semibold text-cyan-300 mb-1">Attached: [PDF] Semiconductor Audit + [MP3] Executive Audio</p>
                <p>"Compare the findings in the PDF report with the statements made in the audio recording, and highlight any discrepancies regarding substrate allocations and budget."</p>
              </div>
            </div>

            {/* AI synthesis simulation */}
            <div className="flex justify-start">
              <div className="p-4 rounded-2xl rounded-tl-sm bg-slate-950 border border-slate-800 text-xs text-slate-300 max-w-2xl space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                  <Sparkles className="h-4 w-4" />
                  <span>Synthesized Findings across Modalities</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Identified a critical <strong>+$3,500,000 variance</strong> between the audited PDF allocation ($8.5M ceiling) and the executive audio briefing resolution where the committee approved an emergency $12.0M buffer.
                </p>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="text-slate-400">PDF Lead Time: <span className="text-white">+14% (Optimistic)</span></div>
                  <div className="text-slate-400">Audio COO Note: <span className="text-amber-400">+22 Days (Congestion)</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Domains */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Engineered for Deep Analytical Domains
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Automated domain tagging and tailored extraction schemas for complex verticals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {domains.map((d, i) => {
            const Icon = d.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-700 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className={`inline-flex p-3 rounded-xl border bg-gradient-to-br ${d.color} mb-4`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-white tracking-tight mb-2">
                    {d.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {d.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Preloaded Sample:</span>
                  <span className="text-cyan-400">{d.sample}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-400 font-mono">
        <p>OmniMind AI — Production Multimodal Intelligence Architecture • Powered by Google Gemini</p>
      </footer>
    </div>
  );
};
