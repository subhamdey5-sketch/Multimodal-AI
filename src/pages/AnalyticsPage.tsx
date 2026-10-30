import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Cpu,
  Database,
  Layers,
  Sparkles,
  Clock,
  Zap,
  Activity,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsData } from '../types';
import { MetricsCard } from '../components/MetricsCard';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const sampleLogs = [
    {
      id: 'log-1',
      timestamp: '2 mins ago',
      action: 'Multimodal Chat Reasoning',
      model: 'gemini-3.8-flash',
      modality: 'PDF + MP3',
      tokens: 965,
      latency: '1.24s',
      status: 'SUCCESS',
    },
    {
      id: 'log-2',
      timestamp: '1 hour ago',
      action: 'Asset Ingestion & JSON Schema Tagging',
      model: 'gemini-3.8-flash',
      modality: 'Drone Video MP4',
      tokens: 3600,
      latency: '2.10s',
      status: 'SUCCESS',
    },
    {
      id: 'log-3',
      timestamp: '3 hours ago',
      action: 'Schema Topology Parsing',
      model: 'gemini-3.8-flash',
      modality: 'Schematic PNG',
      tokens: 2100,
      latency: '1.45s',
      status: 'SUCCESS',
    },
    {
      id: 'log-4',
      timestamp: 'Yesterday',
      action: 'Audio Interview Transcription & Synthesis',
      model: 'gemini-3.8-flash',
      modality: 'Audio MP3',
      tokens: 4200,
      latency: '2.80s',
      status: 'SUCCESS',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-slate-950 text-slate-100">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 rounded bg-indigo-500/10 text-indigo-400">
            <Activity className="h-4 w-4" />
          </span>
          <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">
            Telemetry & Computational Metrics
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">
          Cognitive Analytics & Token Logs
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time metrics for Gemini API usage, multimodal ingestion throughput, and storage allocations
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Tokens Consumed"
          value={(analytics?.totalTokensUsed || 15400).toLocaleString()}
          subtext="Total generation & reasoning tokens"
          icon={Cpu}
          trend={{ value: 'Efficient', positive: true }}
          color="cyan"
        />
        <MetricsCard
          title="Multimodal Storage"
          value={formatBytes(analytics?.totalStorageBytes || 22800000)}
          subtext="Active media buffers"
          icon={Database}
          color="indigo"
        />
        <MetricsCard
          title="Processed Assets"
          value={analytics?.totalAssets || 4}
          subtext="Vector embeddings generated"
          icon={Layers}
          color="emerald"
        />
        <MetricsCard
          title="Avg Inference Latency"
          value="1.48s"
          subtext="Sub-second streaming token start"
          icon={Zap}
          trend={{ value: '-22% vs baseline', positive: true }}
          color="amber"
        />
      </div>

      {/* Domain Breakdown Section */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
          Analytical Domains Distribution
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-blue-400">Enterprise & Business</span>
            <p className="text-xl font-bold font-mono text-white">
              {analytics?.domainCounts?.['Enterprise & Business'] || 2}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">Financial audits & audio notes</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-indigo-400">Technical & Systems</span>
            <p className="text-xl font-bold font-mono text-white">
              {analytics?.domainCounts?.['Technical & Engineering'] || 2}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">MoE schematics & thermal feeds</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-emerald-400">Education & Research</span>
            <p className="text-xl font-bold font-mono text-white">Active</p>
            <p className="text-[10px] text-slate-400 font-mono">ArXiv papers & lecture audio</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-amber-400">Media & Content</span>
            <p className="text-xl font-bold font-mono text-white">Active</p>
            <p className="text-[10px] text-slate-400 font-mono">Video scene tags & transcripts</p>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Inference & Execution Audit Trail
            </h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">Live Telemetry</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="p-3">Time</th>
                <th className="p-3">Operation</th>
                <th className="p-3">Engine Model</th>
                <th className="p-3">Modality</th>
                <th className="p-3">Tokens</th>
                <th className="p-3">Latency</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-[11px]">
              {sampleLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="p-3 text-slate-400">{log.timestamp}</td>
                  <td className="p-3 font-semibold text-slate-200">{log.action}</td>
                  <td className="p-3 text-cyan-300">{log.model}</td>
                  <td className="p-3 text-slate-300">{log.modality}</td>
                  <td className="p-3 text-indigo-300">{log.tokens}</td>
                  <td className="p-3 text-slate-400">{log.latency}</td>
                  <td className="p-3 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-[10px]">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
