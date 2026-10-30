import React, { useState } from 'react';
import {
  FileText,
  FileAudio,
  FileVideo,
  FileImage,
  Search,
  Filter,
  Grid,
  List,
  Sparkles,
  ExternalLink,
  Trash2,
  Calendar,
  Send,
  MoreVertical,
  Check,
} from 'lucide-react';
import { Asset, ModalityType, AnalyticalDomain } from '../types';

interface AssetGridProps {
  assets: Asset[];
  onSelectAsset: (asset: Asset) => void;
  onDeleteAsset?: (id: string) => void;
  onAttachToSession?: (asset: Asset) => void;
  isLoading?: boolean;
}

export const AssetGrid: React.FC<AssetGridProps> = ({
  assets,
  onSelectAsset,
  onDeleteAsset,
  onAttachToSession,
  isLoading,
}) => {
  const [selectedModality, setSelectedModality] = useState<string>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const modalityTabs: Array<{ id: string; label: string; icon: any }> = [
    { id: 'all', label: 'All Modalities', icon: Filter },
    { id: 'document', label: 'Documents & PDFs', icon: FileText },
    { id: 'audio', label: 'Audio Records', icon: FileAudio },
    { id: 'video', label: 'Video Streams', icon: FileVideo },
    { id: 'image', label: 'Images & Diagrams', icon: FileImage },
  ];

  const domains = [
    'all',
    'Enterprise & Business',
    'Education & Research',
    'Media & Content',
    'Technical & Engineering',
  ];

  const filteredAssets = assets.filter((asset) => {
    if (selectedModality !== 'all' && asset.file_type !== selectedModality) {
      return false;
    }
    if (selectedDomain !== 'all' && asset.metadata?.domain !== selectedDomain) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = asset.file_name.toLowerCase().includes(q);
      const matchTitle = (asset.metadata?.title || '').toLowerCase().includes(q);
      const matchSummary = (asset.extracted_summary || '').toLowerCase().includes(q);
      const matchTopic = (asset.metadata?.key_topics || []).some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchTitle && !matchSummary && !matchTopic) return false;
    }
    return true;
  });

  const renderModalityBadge = (type: ModalityType) => {
    switch (type) {
      case 'image':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            <FileImage className="h-3 w-3" /> IMAGE
          </span>
        );
      case 'audio':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <FileAudio className="h-3 w-3" /> AUDIO
          </span>
        );
      case 'video':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/10 border border-purple-500/30 text-purple-300">
            <FileVideo className="h-3 w-3" /> VIDEO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 border border-blue-500/30 text-blue-300">
            <FileText className="h-3 w-3" /> DOC
          </span>
        );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="flex flex-col space-y-5">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Modality Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {modalityTabs.map((tab) => {
            const Icon = tab.icon;
            const count =
              tab.id === 'all'
                ? assets.length
                : assets.filter((a) => a.file_type === tab.id).length;
            const active = selectedModality === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedModality(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:bg-slate-800'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span className="text-[10px] font-mono opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search, Domain filter, View toggle */}
        <div className="flex items-center gap-2.5">
          {/* Domain Dropdown */}
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">All Domains</option>
            <option value="Enterprise & Business">Enterprise & Business</option>
            <option value="Education & Research">Education & Research</option>
            <option value="Media & Content">Media & Content</option>
            <option value="Technical & Engineering">Technical & Engineering</option>
          </select>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter topics, filenames..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Grid / Table Toggle */}
          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${
                viewMode === 'grid' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg ${
                viewMode === 'table' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Assets Content */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Sparkles className="h-8 w-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Loading ingested multimodal repository...</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-8 space-y-3">
          <Filter className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No matching assets found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or ingest new media files using the upload pipeline.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => onSelectAsset(asset)}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900 hover:border-cyan-500/40 p-4 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-cyan-500/5 hover:-translate-y-0.5"
            >
              <div>
                {/* Top header row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {renderModalityBadge(asset.file_type)}
                    <span className="text-[10px] font-mono text-slate-400">
                      {formatFileSize(asset.file_size)}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-950 text-slate-400 border border-slate-800">
                    {asset.metadata.domain || 'Enterprise'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1">
                  {asset.metadata.title || asset.file_name}
                </h3>

                <p className="text-[11px] font-mono text-slate-400 truncate mb-2.5">
                  {asset.file_name}
                </p>

                {/* Summary snippet */}
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-3">
                  {asset.metadata.summary || asset.extracted_summary}
                </p>

                {/* Key Topics Tags */}
                {asset.metadata.key_topics && asset.metadata.key_topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {asset.metadata.key_topics.slice(0, 3).map((topic, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-950/80 text-cyan-300 border border-slate-800"
                      >
                        #{topic}
                      </span>
                    ))}
                    {asset.metadata.key_topics.length > 3 && (
                      <span className="text-[9px] font-mono text-slate-400 self-center">
                        +{asset.metadata.key_topics.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="h-2.5 w-2.5" />
                  {new Date(asset.created_at).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {onAttachToSession && (
                    <button
                      onClick={() => onAttachToSession(asset)}
                      className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition-colors"
                      title="Attach to Active Studio Session"
                    >
                      <Send className="h-3 w-3" />
                    </button>
                  )}
                  {onDeleteAsset && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${asset.file_name}?`)) onDeleteAsset(asset.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Asset"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                <th className="p-3.5">Asset & Modality</th>
                <th className="p-3.5">Analytical Domain</th>
                <th className="p-3.5">Extracted Synthesis</th>
                <th className="p-3.5">Size</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAssets.map((asset) => (
                <tr
                  key={asset.id}
                  onClick={() => onSelectAsset(asset)}
                  className="hover:bg-slate-850/60 cursor-pointer transition-colors"
                >
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      {renderModalityBadge(asset.file_type)}
                      <div>
                        <p className="font-semibold text-slate-200 hover:text-cyan-300 transition-colors">
                          {asset.metadata.title || asset.file_name}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 truncate max-w-xs">
                          {asset.file_name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-800">
                      {asset.metadata.domain || 'Enterprise'}
                    </span>
                  </td>
                  <td className="p-3.5 max-w-md">
                    <p className="text-slate-300 truncate text-[11px]">
                      {asset.metadata.summary || asset.extracted_summary}
                    </p>
                  </td>
                  <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                    {formatFileSize(asset.file_size)}
                  </td>
                  <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                    {new Date(asset.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {onAttachToSession && (
                        <button
                          onClick={() => onAttachToSession(asset)}
                          className="p-1.5 rounded hover:bg-cyan-500/10 text-cyan-400"
                          title="Attach to Workspace"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {onDeleteAsset && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete ${asset.file_name}?`)) onDeleteAsset(asset.id);
                          }}
                          className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
