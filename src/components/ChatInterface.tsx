import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Sparkles,
  Bot,
  User,
  FileText,
  FileAudio,
  FileVideo,
  FileImage,
  X,
  Copy,
  Check,
  RotateCcw,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink,
  Table as TableIcon,
  HelpCircle,
} from 'lucide-react';
import { Asset, ChatMessage, Citation } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  availableAssets: Asset[];
  isLoading: boolean;
  onSendMessage: (prompt: string, assetIds: string[]) => Promise<void>;
  onInspectAsset?: (asset: Asset) => void;
  sessionTitle?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  availableAssets,
  isLoading,
  onSendMessage,
  onInspectAsset,
  sessionTitle,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    onSendMessage(prompt.trim(), selectedAssetIds);
    setPrompt('');
    // Keep asset attachments or reset based on context
  };

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
    );
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getAssetById = (id: string) => availableAssets.find((a) => a.id === id);

  const renderModalityIcon = (type: string, className = 'h-3.5 w-3.5') => {
    switch (type) {
      case 'image':
        return <FileImage className={`${className} text-emerald-400`} />;
      case 'audio':
        return <FileAudio className={`${className} text-amber-400`} />;
      case 'video':
        return <FileVideo className={`${className} text-purple-400`} />;
      default:
        return <FileText className={`${className} text-blue-400`} />;
    }
  };

  const samplePrompts = [
    {
      title: 'Cross-Modal Comparison',
      text: 'Compare the findings in the PDF report with the statements made in the audio recording, and highlight any discrepancies regarding substrate allocations and budget.',
    },
    {
      title: 'Extract Critical Metrics',
      text: 'Extract all numerical forecasts, currency amounts, and operational risk factors from the attached assets into a clean summary table.',
    },
    {
      title: 'Synthesize Executive Action Items',
      text: 'Generate a prioritized list of immediate action items, decision owners, and resolution deadlines based on the attached files.',
    },
  ];

  // Helper to render markdown-like content cleanly
  const renderFormattedContent = (content: string) => {
    // Check if it has markdown tables
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const flushTable = (key: number) => {
      if (tableRows.length > 0) {
        const header = tableRows[0];
        const bodyRows = tableRows.slice(1).filter((r) => !r.every((c) => c.match(/^[ -:]+$/)));
        elements.push(
          <div key={`table-${key}`} className="my-3 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  {header.map((col, idx) => (
                    <th key={idx} className="p-2.5 font-semibold text-slate-200">
                      {col.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-900/40 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2.5 text-slate-300 font-mono text-[11px]">
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
      inTable = false;
    };

    lines.forEach((line, index) => {
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        inTable = true;
        const cols = line
          .trim()
          .slice(1, -1)
          .split('|');
        tableRows.push(cols);
        return;
      } else if (inTable) {
        flushTable(index);
      }

      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-sm font-bold text-white mt-4 mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('#### ')) {
        elements.push(
          <h4 key={index} className="text-xs font-semibold uppercase tracking-wider text-cyan-300 mt-3 mb-1.5">
            {line.replace('#### ', '')}
          </h4>
        );
      } else if (line.startsWith('* ') || line.startsWith('- ')) {
        elements.push(
          <li key={index} className="text-xs text-slate-300 leading-relaxed ml-4 list-disc marker:text-cyan-400">
            {formatBold(line.slice(2))}
          </li>
        );
      } else if (line.match(/^\d+\.\s/)) {
        elements.push(
          <li key={index} className="text-xs text-slate-300 leading-relaxed ml-4 list-decimal marker:text-indigo-400">
            {formatBold(line.replace(/^\d+\.\s/, ''))}
          </li>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={index} className="h-1.5" />);
      } else {
        elements.push(
          <p key={index} className="text-xs text-slate-300 leading-relaxed mb-1.5">
            {formatBold(line)}
          </p>
        );
      }
    });

    if (inTable) flushTable(lines.length);

    return elements;
  };

  const formatBold = (text: string): React.ReactNode => {
    // Process markdown **bold** and *italic*
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={idx} className="italic text-slate-200">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 relative">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-xl mx-auto space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-0.5 shadow-xl shadow-cyan-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950">
                <Sparkles className="h-8 w-8 text-cyan-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Multimodal Synthesis Workspace
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Attach mixed media (PDFs, Audio, Video, Images) and execute cross-modal reasoning. Gemini analyzes relationships, reconciles discrepancies, and extracts actionable intelligence.
              </p>
            </div>

            {/* Quick Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-left pt-2">
              {samplePrompts.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(s.text);
                    // auto select first 2 available assets
                    if (availableAssets.length >= 2) {
                      setSelectedAssetIds([availableAssets[0].id, availableAssets[1].id]);
                    }
                  }}
                  className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-800/80 hover:border-cyan-500/40 transition-all text-left group"
                >
                  <p className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                    {s.title}
                    <ChevronRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {s.text}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const attachedAssets = (msg.attached_asset_ids || [])
              .map(getAssetById)
              .filter(Boolean) as Asset[];

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* AI Avatar */}
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-0.5 shadow-md shadow-cyan-500/20">
                    <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                      <Bot className="h-4 w-4 text-cyan-400" />
                    </div>
                  </div>
                )}

                {/* Message Bubble Container */}
                <div
                  className={`flex flex-col max-w-[85%] sm:max-w-3xl rounded-2xl p-4 transition-all ${
                    isUser
                      ? 'bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-500/30 text-white rounded-tr-sm shadow-lg shadow-indigo-950/20'
                      : 'bg-slate-900/90 border border-slate-800/90 rounded-tl-sm shadow-xl'
                  }`}
                >
                  {/* Attached Media Cards Header for this message */}
                  {attachedAssets.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5 pb-2 border-b border-slate-800/80">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
                        <Layers className="h-3 w-3" /> Attached:
                      </span>
                      {attachedAssets.map((asset) => (
                        <button
                          key={asset.id}
                          onClick={() => onInspectAsset && onInspectAsset(asset)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-700/80 hover:border-cyan-400 text-[11px] text-slate-300 hover:text-white transition-colors"
                        >
                          {renderModalityIcon(asset.file_type)}
                          <span className="font-medium truncate max-w-[140px]">
                            {asset.file_name}
                          </span>
                          <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-1 py-0.2 rounded border border-cyan-800/50">
                            {asset.file_type.toUpperCase()}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message Body */}
                  <div className="text-xs leading-relaxed space-y-1">
                    {isUser ? (
                      <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                    ) : (
                      renderFormattedContent(msg.content)
                    )}
                  </div>

                  {/* Citations Box for AI Response */}
                  {!isUser && msg.metadata?.citations && msg.metadata.citations.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-slate-800/80">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-cyan-400" /> Multimodal Cross-References & Citations:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {msg.metadata.citations.map((cite, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col gap-0.5"
                          >
                            <div className="flex items-center justify-between text-[11px] font-semibold text-cyan-300">
                              <span className="truncate">{cite.asset_name}</span>
                              <span className="px-1.5 py-0.2 rounded bg-indigo-950 border border-indigo-800 text-[9px] font-mono text-indigo-300 shrink-0">
                                {cite.timestamp_or_page}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate italic">
                              "{cite.excerpt}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Footer Info */}
                  <div className="mt-2.5 flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <div className="flex items-center gap-2">
                      {msg.tokens_used > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                          {msg.tokens_used} tokens
                        </span>
                      )}
                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex gap-3.5 items-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-0.5 shadow-md shadow-cyan-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                <Bot className="h-4 w-4 text-cyan-400 animate-spin" />
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
              <span>Gemini 3.8 Flash is cross-referencing modalities & synthesizing intelligence...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Zone & Multi-Asset Attachment Bar */}
      <div className="border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-xl p-4 sm:px-8">
        {/* Active Attached Asset Chips */}
        {selectedAssetIds.length > 0 && (
          <div className="mb-2.5 flex flex-wrap items-center gap-1.5 animate-in fade-in duration-150">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mr-1">
              Active Context:
            </span>
            {selectedAssetIds.map((id) => {
              const asset = getAssetById(id);
              if (!asset) return null;
              return (
                <div
                  key={id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-300"
                >
                  {renderModalityIcon(asset.file_type)}
                  <span className="truncate max-w-[150px] font-medium">{asset.file_name}</span>
                  <button
                    onClick={() => toggleAssetSelection(id)}
                    className="p-0.5 hover:bg-cyan-900/50 rounded text-cyan-400 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 px-3 py-2 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all shadow-inner">
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => setShowAssetSelector(!showAssetSelector)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                selectedAssetIds.length > 0 || showAssetSelector
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title="Attach media assets from library"
            >
              <Paperclip className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {selectedAssetIds.length > 0 ? `${selectedAssetIds.length} Attached` : 'Attach Media'}
              </span>
            </button>

            {/* Input Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask a cross-modal question (e.g. 'Compare the PDF report against the audio notes...')"
              className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none resize-none py-1.5"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:opacity-95 disabled:opacity-40 transition-all shadow-md shadow-cyan-500/20 active:scale-95 shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          {/* Asset Selection Drawer */}
          {showAssetSelector && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-3 shadow-2xl animate-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-white flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-cyan-400" />
                  Select Assets to Include in Prompt Thread
                </span>
                <button
                  type="button"
                  onClick={() => setShowAssetSelector(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {availableAssets.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No assets available in library yet. Ingest media to attach files.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                  {availableAssets.map((asset) => {
                    const isSelected = selectedAssetIds.includes(asset.id);
                    return (
                      <div
                        key={asset.id}
                        onClick={() => toggleAssetSelection(asset.id)}
                        className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-400 text-white'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="mt-0.5">{renderModalityIcon(asset.file_type)}</div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-medium truncate">{asset.file_name}</p>
                          <p className="text-[9px] text-slate-400 truncate">{asset.metadata.category}</p>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
