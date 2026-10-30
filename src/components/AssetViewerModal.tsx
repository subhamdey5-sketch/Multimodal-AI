import React from 'react';
import {
  X,
  FileText,
  FileAudio,
  FileVideo,
  FileImage,
  ExternalLink,
  Sparkles,
  Download,
  Calendar,
  Layers,
  Tag,
  Smile,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { Asset } from '../types';
import { useNavigate } from 'react-router-dom';

interface AssetViewerModalProps {
  asset: Asset | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const AssetViewerModal: React.FC<AssetViewerModalProps> = ({ asset, onClose, onDelete }) => {
  const navigate = useNavigate();

  if (!asset) return null;

  const renderPreview = () => {
    switch (asset.file_type) {
      case 'image':
        return (
          <div className="flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden max-h-96 border border-slate-800">
            <img
              src={asset.file_url}
              alt={asset.file_name}
              className="max-h-96 object-contain w-full"
              onError={(e) => {
                // fallback if external image fails
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80';
              }}
            />
          </div>
        );
      case 'audio':
        return (
          <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileAudio className="h-8 w-8 animate-pulse" />
            </div>
            <audio controls className="w-full max-w-md accent-amber-500">
              <source src={asset.file_url} type={asset.metadata.mime_type || 'audio/mp3'} />
              Your browser does not support the audio tag.
            </audio>
            <p className="text-xs text-slate-400 font-mono">
              Duration: ~{Math.floor((asset.metadata.duration_seconds || 180) / 60)}m {((asset.metadata.duration_seconds || 180) % 60)}s
            </p>
          </div>
        );
      case 'video':
        return (
          <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center">
            <video controls className="w-full max-h-80 bg-black">
              <source src={asset.file_url} type={asset.metadata.mime_type || 'video/mp4'} />
              Your browser does not support HTML video.
            </video>
          </div>
        );
      default:
        return (
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono text-slate-400">
                Document Stream Preview ({asset.metadata.page_count || 12} Pages)
              </span>
              <a
                href={asset.file_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-medium"
              >
                Open Full File <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg font-mono text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
              {asset.metadata.extracted_text_preview ||
                asset.extracted_summary ||
                'Full text indexed and vectorized for multimodal analysis.'}
            </div>
          </div>
        );
    }
  };

  const handleLaunchInWorkspace = () => {
    onClose();
    navigate('/workspace', { state: { attachAssetId: asset.id } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              {asset.file_type === 'image' && <FileImage className="h-5 w-5 text-emerald-400" />}
              {asset.file_type === 'audio' && <FileAudio className="h-5 w-5 text-amber-400" />}
              {asset.file_type === 'video' && <FileVideo className="h-5 w-5 text-purple-400" />}
              {asset.file_type === 'document' && <FileText className="h-5 w-5 text-blue-400" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white truncate max-w-md">
                {asset.metadata.title || asset.file_name}
              </h2>
              <p className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{asset.file_name}</span>
                <span>•</span>
                <span>{(asset.file_size / 1024 / 1024).toFixed(2)} MB</span>
                <span>•</span>
                <span className="text-cyan-400 uppercase">{asset.file_type}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Media Preview Box */}
          {renderPreview()}

          {/* AI Knowledge & Metadata Inspector */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                Gemini Structured Metadata & Classification
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                {asset.metadata.domain || 'Enterprise & Business'}
              </span>
            </div>

            {/* Summary */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Executive Synthesis
              </span>
              <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                {asset.metadata.summary || asset.extracted_summary}
              </p>
            </div>

            {/* Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block">Category</span>
                <span className="text-xs font-medium text-slate-200 truncate block mt-0.5">
                  {asset.metadata.category}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block">Sentiment / Tone</span>
                <span className="text-xs font-medium text-slate-200 truncate block mt-0.5 flex items-center gap-1">
                  <Smile className="h-3 w-3 text-emerald-400" />
                  {asset.metadata.sentiment}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block">Token Estimate</span>
                <span className="text-xs font-mono font-medium text-cyan-400 block mt-0.5">
                  ~{asset.metadata.tokens_estimate || 2400} tokens
                </span>
              </div>
            </div>

            {/* Key Topics */}
            {asset.metadata.key_topics && asset.metadata.key_topics.length > 0 && (
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Extracted Key Topics & Entities
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {asset.metadata.key_topics.map((topic, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-cyan-950/40 border border-cyan-800/50 text-cyan-300"
                    >
                      #{topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div>
            {onDelete && (
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${asset.file_name}?`)) {
                    onDelete(asset.id);
                    onClose();
                  }
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
              >
                Delete Asset
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleLaunchInWorkspace}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-semibold hover:opacity-95 shadow-md shadow-cyan-500/20 transition-all active:scale-95"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Query in Studio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
