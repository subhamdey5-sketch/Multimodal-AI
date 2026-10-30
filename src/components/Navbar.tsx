import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BrainCircuit,
  Search,
  UploadCloud,
  FileText,
  LogOut,
  Sparkles,
  Command,
  ExternalLink,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ExportModal } from './ExportModal';

interface NavbarProps {
  onOpenUpload?: () => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenUpload, onOpenSearch }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const isWorkspace = location.pathname.startsWith('/workspace');

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Left Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-500 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                  <BrainCircuit className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  OmniMind<span className="text-cyan-400 font-black ml-1">AI</span>
                </span>
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase -mt-0.5">
                  Multimodal Workspace
                </span>
              </div>
            </Link>

            {/* Quick search input button */}
            <button
              onClick={onOpenSearch}
              className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 transition-colors w-64 justify-between group"
            >
              <div className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                <span>Search cross-modal assets...</span>
              </div>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-slate-700/80 bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
                <Command className="h-2.5 w-2.5" /> K
              </kbd>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Model status indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800/80">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-xs font-mono font-medium text-slate-300">
                Gemini 3.8 Flash
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/40">
                Active
              </span>
            </div>

            {/* Quick Ingest Button */}
            {onOpenUpload && (
              <button
                onClick={onOpenUpload}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-all shadow-sm hover:shadow-cyan-500/10 active:scale-95"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Ingest Files</span>
              </button>
            )}

            {/* Export Report Trigger (especially useful in workspace or library) */}
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-colors"
              title="Generate & Export Structured Report"
            >
              <FileText className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Export Report</span>
            </button>

            {/* User Profile / Auth State */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-800/60 transition-colors"
                >
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={user.full_name}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-cyan-500/30"
                  />
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-medium text-slate-200 truncate max-w-[120px]">
                      {user.full_name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                      {user.role || 'Principal Scientist'}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden lg:block" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                      <p className="text-xs font-semibold text-white">{user.full_name}</p>
                      <p className="text-[11px] font-mono text-slate-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/workspace"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Sparkles className="h-4 w-4 text-cyan-400" />
                      Multimodal Studio
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Sliders className="h-4 w-4 text-slate-400" />
                      Workspace Settings
                    </Link>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors mt-1 border-t border-slate-800/80 pt-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs text-slate-300 hover:text-white font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-medium hover:opacity-95 shadow-md shadow-cyan-500/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal onClose={() => setShowExportModal(false)} />
      )}
    </>
  );
};
