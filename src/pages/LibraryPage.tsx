import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  UploadCloud,
  Sparkles,
  Database,
  Search,
  Filter,
} from 'lucide-react';
import { api } from '../services/api';
import { Asset } from '../types';
import { AssetGrid } from '../components/AssetGrid';
import { FileUploader } from '../components/FileUploader';
import { AssetViewerModal } from '../components/AssetViewerModal';

export const LibraryPage: React.FC = () => {
  const navigate = useNavigate();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [inspectedAsset, setInspectedAsset] = useState<Asset | null>(null);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await api.getAssets();
      setAssets(res.assets);
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAsset(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to delete asset:', err);
    }
  };

  const handleAttachToSession = (asset: Asset) => {
    navigate('/workspace', { state: { attachAssetId: asset.id } });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-cyan-500/10 text-cyan-400">
              <Layers className="h-4 w-4" />
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
              Multimodal Knowledge Ingestion
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Media & Asset Library
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Indexed vector repository of scanned documents, audio recordings, video feeds, and images
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <UploadCloud className="h-4 w-4" />
          <span>Ingest New Media</span>
        </button>
      </div>

      {/* Asset Grid Component */}
      <AssetGrid
        assets={assets}
        onSelectAsset={(a) => setInspectedAsset(a)}
        onDeleteAsset={handleDelete}
        onAttachToSession={handleAttachToSession}
        isLoading={loading}
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl">
            <FileUploader
              onClose={() => setShowUploadModal(false)}
              onUploadComplete={(newAssets) => {
                setAssets((prev) => [...newAssets, ...prev]);
                setShowUploadModal(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Detail Viewer Modal */}
      {inspectedAsset && (
        <AssetViewerModal
          asset={inspectedAsset}
          onClose={() => setInspectedAsset(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};
