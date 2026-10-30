import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Trash2,
  MessageSquare,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sliders,
  FileText,
  FileAudio,
  FileVideo,
  FileImage,
  ExternalLink,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import { Asset, ChatMessage, ChatSession } from '../types';
import { ChatInterface } from '../components/ChatInterface';
import { AssetViewerModal } from '../components/AssetViewerModal';

export const WorkspacePage: React.FC = () => {
  const location = useLocation();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSessionsSidebar, setShowSessionsSidebar] = useState(true);
  const [inspectedAsset, setInspectedAsset] = useState<Asset | null>(null);

  // Load initial sessions and assets
  useEffect(() => {
    async function loadInitial() {
      try {
        const [sessRes, assetRes] = await Promise.all([
          api.getSessions(),
          api.getAssets(),
        ]);

        setSessions(sessRes.sessions);
        setAvailableAssets(assetRes.assets);

        if (sessRes.sessions.length > 0) {
          const first = sessRes.sessions[0];
          setActiveSessionId(first.id);
          const msgRes = await api.getMessages(first.id);
          setMessages(msgRes.messages);
        }

        // If navigated with state to attach a specific asset
        if (location.state?.attachAssetId) {
          const target = assetRes.assets.find((a: Asset) => a.id === location.state.attachAssetId);
          if (target) {
            setInspectedAsset(target);
          }
        }
      } catch (err) {
        console.error('Failed to load workspace data:', err);
      }
    }
    loadInitial();
  }, [location.state]);

  // Load messages when active session changes
  const handleSelectSession = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    try {
      const res = await api.getMessages(sessionId);
      setMessages(res.messages);
    } catch (err) {
      console.error('Failed to load session messages:', err);
    }
  };

  const handleCreateSession = async () => {
    try {
      const count = sessions.length + 1;
      const res = await api.createSession(`Multimodal Studio Analysis #${count}`);
      setSessions((prev) => [res.session, ...prev]);
      setActiveSessionId(res.session.id);
      setMessages([]);
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this chat session?')) return;

    try {
      await api.deleteSession(id);
      const remaining = sessions.filter((s) => s.id !== id);
      setSessions(remaining);
      if (activeSessionId === id) {
        if (remaining.length > 0) {
          handleSelectSession(remaining[0].id);
        } else {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const handleSendMessage = async (prompt: string, assetIds: string[]) => {
    if (!activeSessionId) {
      // create session first
      const newSess = await api.createSession(prompt.slice(0, 36) + '...');
      setSessions((prev) => [newSess.session, ...prev]);
      setActiveSessionId(newSess.session.id);
    }

    const currentSessionId = activeSessionId || (sessions[0]?.id as string);
    setIsLoading(true);

    try {
      const res = await api.sendMultimodalChat({
        sessionId: currentSessionId,
        prompt,
        assetIds,
      });

      setMessages((prev) => [...prev, res.userMessage, res.aiMessage]);
    } catch (err) {
      console.error('Failed to execute multimodal chat:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-950 text-slate-100">
      {/* Sessions Left Drawer */}
      <div
        className={`flex flex-col border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all duration-300 z-20 ${
          showSessionsSidebar ? 'w-72' : 'w-0 border-r-0'
        } overflow-hidden`}
      >
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Studio Sessions
            </span>
          </div>
          <button
            onClick={handleCreateSession}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-medium transition-all"
            title="Create New Session"
          >
            <Plus className="h-3 w-3" />
            <span>New</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map((sess) => {
            const active = sess.id === activeSessionId;
            return (
              <div
                key={sess.id}
                onClick={() => handleSelectSession(sess.id)}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                  active
                    ? 'bg-slate-900 text-white border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MessageSquare
                    className={`h-4 w-4 shrink-0 ${active ? 'text-cyan-400' : 'text-slate-400'}`}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{sess.title}</p>
                    <p className="text-[10px] font-mono text-slate-400 truncate">
                      {new Date(sess.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDeleteSession(sess.id, e)}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-opacity"
                  title="Delete Session"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Available Asset Pill Tracker */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
            <span>Library Assets Ready</span>
            <span className="text-cyan-400 font-bold">{availableAssets.length}</span>
          </div>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
            {availableAssets.map((a) => (
              <button
                key={a.id}
                onClick={() => setInspectedAsset(a)}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:border-cyan-400 truncate max-w-full"
              >
                {a.file_name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Workspace Toolbar Header */}
        <div className="h-12 border-b border-slate-800/80 bg-slate-950/80 px-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setShowSessionsSidebar(!showSessionsSidebar)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title={showSessionsSidebar ? 'Hide Sessions' : 'Show Sessions'}
            >
              {showSessionsSidebar ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-xs font-bold text-white truncate">
                {activeSession?.title || 'Multimodal Studio'}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/50 shrink-0">
                gemini-3.8-flash
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              Temperature: 0.3 (Strict Analytical)
            </span>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 min-h-0">
          <ChatInterface
            messages={messages}
            availableAssets={availableAssets}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onInspectAsset={(asset) => setInspectedAsset(asset)}
            sessionTitle={activeSession?.title}
          />
        </div>
      </div>

      {/* Asset Inspector Modal */}
      {inspectedAsset && (
        <AssetViewerModal
          asset={inspectedAsset}
          onClose={() => setInspectedAsset(null)}
        />
      )}
    </div>
  );
};
