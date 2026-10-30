export type ModalityType = 'image' | 'audio' | 'video' | 'document';

export type AnalyticalDomain =
  | 'Enterprise & Business'
  | 'Education & Research'
  | 'Media & Content'
  | 'Technical & Engineering';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface AssetMetadata {
  title: string;
  category: string;
  summary: string;
  key_topics: string[];
  sentiment: string;
  domain?: AnalyticalDomain;
  mime_type?: string;
  duration_seconds?: number;
  page_count?: number;
  dimensions?: { width: number; height: number };
  tokens_estimate?: number;
  extracted_text_preview?: string;
}

export interface Asset {
  id: string;
  user_id: string;
  file_name: string;
  file_type: ModalityType;
  file_url: string;
  file_size: number;
  extracted_summary: string;
  metadata: AssetMetadata;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  domain?: AnalyticalDomain;
  created_at: string;
  updated_at?: string;
}

export interface Citation {
  asset_id: string;
  asset_name: string;
  timestamp_or_page: string;
  excerpt: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender: 'user' | 'ai';
  content: string;
  attached_asset_ids: string[];
  tokens_used: number;
  created_at: string;
  metadata?: {
    citations?: Citation[];
    domain?: string;
  };
}

export interface AnalyticsData {
  totalAssets: number;
  totalSessions: number;
  totalQueries: number;
  totalStorageBytes: number;
  totalTokensUsed: number;
  modalityCounts: {
    image: number;
    audio: number;
    video: number;
    document: number;
  };
  domainCounts: Record<AnalyticalDomain, number>;
  recentActivity: Array<{
    id: string;
    type: 'asset_ingested' | 'chat_query';
    title: string;
    subtext: string;
    timestamp: string;
    icon: string;
  }>;
}
