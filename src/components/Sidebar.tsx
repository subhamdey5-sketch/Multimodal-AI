import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Layers,
  BarChart3,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Database,
  FileAudio,
  FileVideo,
  FileImage,
  FileText,
} from 'lucide-react';

interface SidebarProps {
  assetCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ assetCount = 4 }) => {
  const [collapsed, setCollapsed] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Multimodal Studio', href: '/workspace', icon: Sparkles, badge: 'AI' },
    { name: 'Media Library', href: '/library', icon: Layers, count: assetCount },
    { name: 'Analytics & Logs', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings2 },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-800/80 bg-slate-950/70 backdrop-blur-xl transition-all duration-300 z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-5 z-40 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-300 hover:text-white shadow-md transition-all hover:scale-105"
        title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Nav List */}
      <div className="flex flex-1 flex-col justify-between p-3">
        <nav className="space-y-1.5 pt-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1 tracking-wide">{item.name}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="rounded-md bg-gradient-to-r from-cyan-500 to-indigo-500 px-1.5 py-0.5 text-[9px] font-bold text-slate-950 tracking-wider">
                      {item.badge}
                    </span>
                  )}
                  {!collapsed && item.count !== undefined && (
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                      {item.count}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Modality Ingestion Status */}
        {!collapsed && (
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3 space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Database className="h-3 w-3 text-cyan-400" /> Modalities
              </span>
              <span className="text-[10px] font-mono text-cyan-400">4 Active</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300" title="PDFs & Documents">
                <FileText className="h-3.5 w-3.5 text-blue-400 mb-1" />
                <span className="text-[9px] font-mono text-slate-400">PDF</span>
              </div>
              <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300" title="Audio Recordings">
                <FileAudio className="h-3.5 w-3.5 text-amber-400 mb-1" />
                <span className="text-[9px] font-mono text-slate-400">Audio</span>
              </div>
              <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300" title="Video Streams">
                <FileVideo className="h-3.5 w-3.5 text-purple-400 mb-1" />
                <span className="text-[9px] font-mono text-slate-400">Video</span>
              </div>
              <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300" title="Imagery & Schematics">
                <FileImage className="h-3.5 w-3.5 text-emerald-400 mb-1" />
                <span className="text-[9px] font-mono text-slate-400">Image</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
