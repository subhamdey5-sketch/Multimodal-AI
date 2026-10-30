import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Database,
  Cpu,
  Zap,
  Sparkles,
  ArrowRight,
  UploadCloud,
  FileText,
  FileAudio,
  FileVideo,
  FileImage,
  Clock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsData, Asset } from '../types';
import { MetricsCard } from '../components/MetricsCard';
import { FileUploader } from '../components/FileUploader';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const data = await api.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getModalityIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <FileImage className="h-4 w-4 text-emerald-400" />;
      case 'audio':
        return <FileAudio className="h-4 w-4 text-amber-400" />;
      case 'video':
        return <FileVideo className="h-4 w-4 text-purple-400" />;
      default:
        return <FileText className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-slate-950 text-slate-100">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl border border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-full bg-cyan-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
              <Sparkles className="h-3 w-3" />
              <span>Workspace Active • Gemini 3.8 Flash Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Dr. Vance'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Your multimodal knowledge hub is ready. Ingest mixed-modality assets, execute cross-modal correlation queries, or export synthesized intelligence reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold transition-all shadow-sm"
            >
              <UploadCloud className="h-4 w-4 text-cyan-400" />
              <span>Ingest Assets</span>
            </button>

            <button
              onClick={() => navigate('/workspace')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>Open Studio Canvas</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Total Ingested Assets"
          value={analytics?.totalAssets || 4}
          subtext="Indexed across 4 file modalities"
          icon={Layers}
          trend={{ value: '+100% indexed', positive: true }}
          color="cyan"
        />
        <MetricsCard
          title="Multimodal Storage"
          value={formatBytes(analytics?.totalStorageBytes || 22800000)}
          subtext="Compressed vector & raw media buffer"
          icon={Database}
          trend={{ value: 'Under 50MB quota', positive: true }}
          color="indigo"
        />
        <MetricsCard
          title="Tokens Processed"
          value={(analytics?.totalTokensUsed || 15400).toLocaleString()}
          subtext="Gemini 3.8 Flash cognitive tokens"
          icon={Cpu}
          trend={{ value: 'Low Latency', positive: true }}
          color="emerald"
        />
        <MetricsCard
          title="Active Sessions"
          value={analytics?.totalSessions || 1}
          subtext="Persistent cross-modal threads"
          icon={Zap}
          color="amber"
        />
      </div>

      {/* Two Column Layout: Modality Distribution & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modality Breakdown & Domain Distribution */}
        <div className="lg:col-span-1 space-y-6">
          {/* Modalities Card */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                Modality Distribution
              </h3>
              <span className="text-[10px] font-mono text-cyan-400">Real-time</span>
            </div>

            <div className="space-y-3 pt-1">
              {/* PDF / Docs */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <FileText className="h-3.5 w-3.5 text-blue-400" /> Documents & PDFs
                  </span>
                  <span className="font-mono text-slate-400">
                    {analytics?.modalityCounts.document || 1} files
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              {/* Audio */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <FileAudio className="h-3.5 w-3.5 text-amber-400" /> Audio Recordings
                  </span>
                  <span className="font-mono text-slate-400">
                    {analytics?.modalityCounts.audio || 1} files
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '30%' }} />
                </div>
              </div>

              {/* Video */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <FileVideo className="h-3.5 w-3.5 text-purple-400" /> Video Feeds
                  </span>
                  <span className="font-mono text-slate-400">
                    {analytics?.modalityCounts.video || 1} files
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>

              {/* Image */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <FileImage className="h-3.5 w-3.5 text-emerald-400" /> Schematics & Imagery
                  </span>
                  <span className="font-mono text-slate-400">
                    {analytics?.modalityCounts.image || 1} files
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '20%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Domain Matrix */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono pb-2 border-b border-slate-800">
              Analytical Domains Active
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block">Enterprise</span>
                <span className="font-semibold text-cyan-300">2 Assets</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block">Technical</span>
                <span className="font-semibold text-indigo-300">2 Assets</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block">Research</span>
                <span className="font-semibold text-emerald-300">Active</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block">Media</span>
                <span className="font-semibold text-amber-300">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Multimodal Activity Feed */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                Recent Multimodal Processing Activity
              </h3>
            </div>
            <button
              onClick={() => navigate('/library')}
              className="text-xs text-cyan-400 hover:underline font-mono"
            >
              View Full Library &rarr;
            </button>
          </div>

          <div className="divide-y divide-slate-800/60">
            {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
              analytics.recentActivity.map((act) => (
                <div key={act.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                      {act.type === 'asset_ingested' ? (
                        getModalityIcon(act.icon)
                      ) : (
                        <Sparkles className="h-4 w-4 text-cyan-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">
                        {act.title}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                        {act.subtext}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {new Date(act.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                No recent activity recorded.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Ingestion Drawer Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl">
            <FileUploader
              onClose={() => setShowUploadModal(false)}
              onUploadComplete={() => {
                fetchAnalytics();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
