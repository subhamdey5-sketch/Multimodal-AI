import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  FileText,
  FileAudio,
  FileVideo,
  FileImage,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { api } from '../services/api';
import { Asset, ChatMessage } from '../types';
import { useNavigate } from 'react-router-dom';

interface SearchModalProps {
  onClose: () => void;
  onSelectAsset?: (asset: Asset) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ onClose, onSelectAsset }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    assets: Asset[];
    messages: Array<ChatMessage & { session_title: string }>;
  }>({ assets: [], messages: [] });

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ assets: [], messages: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search(query);
        setResults(res);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const renderIcon = (type: string) => {
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl flex flex-col overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-800 bg-slate-950/70">
          <Search className="h-5 w-5 text-cyan-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search across cross-modal assets, summaries, topics, and chat transcripts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Type keywords to perform semantic cross-modal queries (e.g. "wafer", "thermal", "budget", "logistics")
            </div>
          ) : results.assets.length === 0 && results.messages.length === 0 && !loading ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching assets or conversations found for "{query}".
            </div>
          ) : (
            <>
              {/* Assets Results */}
              {results.assets.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-cyan-400" /> Matched Ingested Assets ({results.assets.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.assets.map((asset) => (
                      <div
                        key={asset.id}
                        onClick={() => {
                          if (onSelectAsset) onSelectAsset(asset);
                          onClose();
                        }}
                        className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                            {renderIcon(asset.file_type)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                              {asset.metadata.title || asset.file_name}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {asset.extracted_summary}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Transcripts Results */}
              {results.messages.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <MessageSquare className="h-3 w-3 text-indigo-400" /> Matched Conversation Threads ({results.messages.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.messages.map((msg) => (
                      <div
                        key={msg.id}
                        onClick={() => {
                          onClose();
                          navigate('/workspace');
                        }}
                        className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-indigo-500/40 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                              {msg.session_title}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {msg.sender === 'ai' ? 'AI Response' : 'User Query'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 line-clamp-2 italic">
                            "{msg.content}"
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70 text-[10px] text-slate-400 flex items-center justify-between font-mono">
          <span>Search across text, OCR, audio transcripts & video metadata</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
