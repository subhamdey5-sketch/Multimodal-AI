import React, { useState, useRef, DragEvent } from 'react';
import {
  UploadCloud,
  File,
  FileAudio,
  FileVideo,
  FileImage,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  Maximize2,
} from 'lucide-react';
import { api } from '../services/api';
import { Asset } from '../types';

interface FileUploaderProps {
  onUploadComplete?: (newAssets: Asset[]) => void;
  onClose?: () => void;
  compact?: boolean;
}

interface FileWithStatus {
  file: File;
  id: string;
  previewUrl?: string;
  type: 'image' | 'audio' | 'video' | 'document';
  progress: number;
  status: 'pending' | 'uploading' | 'analyzing' | 'done' | 'error';
  errorMessage?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadComplete,
  onClose,
  compact = false,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [fileList, setFileList] = useState<FileWithStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getModalityType = (file: File): 'image' | 'audio' | 'video' | 'document' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: FileWithStatus[] = Array.from(files).map((f) => {
      const type = getModalityType(f);
      let previewUrl: string | undefined;
      if (type === 'image') {
        previewUrl = URL.createObjectURL(f);
      }
      return {
        file: f,
        id: `${f.name}-${Date.now()}-${Math.random()}`,
        previewUrl,
        type,
        progress: 0,
        status: 'pending',
      };
    });

    setFileList((prev) => [...prev, ...newItems]);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    setFileList((prev) => prev.filter((item) => item.id !== id));
  };

  const startUpload = async () => {
    if (fileList.length === 0 || isProcessing) return;
    setIsProcessing(true);

    try {
      // Mark all as uploading
      setFileList((prev) =>
        prev.map((item) => ({ ...item, status: 'uploading', progress: 40 }))
      );

      // Transition to analyzing with Gemini
      setTimeout(() => {
        setFileList((prev) =>
          prev.map((item) => ({ ...item, status: 'analyzing', progress: 85 }))
        );
      }, 700);

      const filesToUpload = fileList.map((item) => item.file);
      const res = await api.uploadAssets(filesToUpload);

      // Mark done
      setFileList((prev) =>
        prev.map((item) => ({ ...item, status: 'done', progress: 100 }))
      );

      if (onUploadComplete && res.assets) {
        onUploadComplete(res.assets);
      }

      // Auto close after completion if modal
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setFileList((prev) =>
        prev.map((item) => ({
          ...item,
          status: 'error',
          errorMessage: err.message || 'Processing failed',
        }))
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <FileImage className="h-5 w-5 text-emerald-400" />;
      case 'audio':
        return <FileAudio className="h-5 w-5 text-amber-400" />;
      case 'video':
        return <FileVideo className="h-5 w-5 text-purple-400" />;
      default:
        return <FileText className="h-5 w-5 text-blue-400" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className={`flex flex-col ${compact ? 'p-2' : 'p-6'} bg-slate-900/90 rounded-2xl border border-slate-800 text-slate-100 shadow-2xl`}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide">
                Multimodal Ingestion Pipeline
              </h3>
              <p className="text-xs text-slate-400">
                Upload images, audio, video, scanned docs, or PDFs up to 50MB
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      )}

      {/* Drag & Drop Target Area */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${
          dragOver
            ? 'border-cyan-400 bg-cyan-950/20 scale-[0.99]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-950/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,audio/*,video/*,application/pdf,text/*,.docx"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-3 shadow-inner">
          <UploadCloud className="h-7 w-7 animate-pulse" />
        </div>

        <p className="text-sm font-medium text-slate-200 text-center">
          Drag and drop media files here, or <span className="text-cyan-400 underline underline-offset-2">browse files</span>
        </p>

        <p className="text-xs text-slate-400 mt-1.5 text-center">
          Supports PNG, JPG, MP3, WAV, MP4, MOV, PDF, TXT, DOCX (Max 50MB per file)
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono bg-blue-500/10 border border-blue-500/20 text-blue-300">
            <FileText className="h-3 w-3" /> PDF / Scanned Docs
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-300">
            <FileAudio className="h-3 w-3" /> Audio Recordings
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono bg-purple-500/10 border border-purple-500/20 text-purple-300">
            <FileVideo className="h-3 w-3" /> Video Streams
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <FileImage className="h-3 w-3" /> Diagrams & Images
          </span>
        </div>
      </div>

      {/* Selected File Previews */}
      {fileList.length > 0 && (
        <div className="mt-5 space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {fileList.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {item.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="h-10 w-10 rounded-lg object-cover border border-slate-800 shrink-0"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                    {getFileIcon(item.type)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate max-w-xs">
                    {item.file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-slate-400">
                      {formatSize(item.file.size)}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {item.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-3">
                {item.status === 'uploading' && (
                  <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                )}
                {item.status === 'analyzing' && (
                  <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono">
                    <Sparkles className="h-3.5 w-3.5 animate-spin" />
                    <span>Gemini Indexing...</span>
                  </div>
                )}
                {item.status === 'done' && (
                  <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Indexed</span>
                  </div>
                )}
                {item.status === 'error' && (
                  <div className="flex items-center gap-1 text-xs text-rose-400">
                    <AlertCircle className="h-4 w-4" />
                    <span>{item.errorMessage || 'Failed'}</span>
                  </div>
                )}

                {item.status === 'pending' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(item.id);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Footer */}
      {fileList.length > 0 && (
        <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-800/80">
          <span className="text-xs text-slate-400">
            {fileList.length} file{fileList.length > 1 ? 's' : ''} queued for multimodal analysis
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFileList([])}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Clear
            </button>
            <button
              onClick={startUpload}
              disabled={isProcessing || fileList.every((f) => f.status === 'done')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Extracting Metadata...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Ingest & Extract Knowledge</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
