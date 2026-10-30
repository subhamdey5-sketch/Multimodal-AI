import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  avatar_url?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

export interface AssetMetadata {
  title: string;
  category: string;
  summary: string;
  key_topics: string[];
  sentiment: string;
  domain?: 'Enterprise & Business' | 'Education & Research' | 'Media & Content' | 'Technical & Engineering';
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
  file_type: 'image' | 'audio' | 'video' | 'document';
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
  domain?: string;
  created_at: string;
  updated_at?: string;
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
    citations?: Array<{ asset_id: string; asset_name: string; timestamp_or_page: string; excerpt: string }>;
    domain?: string;
  };
}

export interface DatabaseSchema {
  users: User[];
  assets: Asset[];
  chat_sessions: ChatSession[];
  messages: ChatMessage[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'omnimind_db.json');

class DatabaseService {
  private data: DatabaseSchema = {
    users: [],
    assets: [],
    chat_sessions: [],
    messages: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Failed to read database file, reinitializing', err);
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  private seedInitialData() {
    // Default demo user: password is "password123"
    // bcrypt hash for password123 (salt rounds 12)
    const demoUserId = '11111111-2222-3333-4444-555555555555';
    const demoUser: User = {
      id: demoUserId,
      email: 'demo@omnimind.ai',
      // bcrypt hash for "password123"
      password_hash: '$2a$12$K8yR2u/9i97uP73zWj4h7eMhH4L9B4kQeQeK2YgL8jGqP8yB9Neq2',
      full_name: 'Dr. Evelyn Vance',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Principal Research Scientist',
      created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Preloaded multi-modal assets with realistic metadata for immediate exploration
    const asset1: Asset = {
      id: 'a1000000-0000-0000-0000-000000000001',
      user_id: demoUserId,
      file_name: 'Q3_Global_Semiconductor_SupplyChain_Audit.pdf',
      file_type: 'document',
      file_url: '/samples/sample_report.txt',
      file_size: 2458000,
      extracted_summary: 'Comprehensive audit analyzing supply chain bottlenecks in sub-3nm wafer fabrication, highlighting a 14% lead-time reduction in packaging and critical supplier exposure in regional lithography equipment.',
      metadata: {
        title: 'Q3 Global Semiconductor Supply Chain Audit',
        category: 'Market Intelligence & Manufacturing',
        summary: 'Analyzes sub-3nm fabrication facilities, critical raw neon and palladium reserve shifts, and lead-time optimization through automated visual inspection pipelines.',
        key_topics: ['Wafer Fabrication', 'Lithography Equipment', 'Lead-time Optimization', 'Regional Risk Analysis', 'Yield Metrics'],
        sentiment: 'Cautiously Optimistic',
        domain: 'Enterprise & Business',
        mime_type: 'application/pdf',
        page_count: 24,
        tokens_estimate: 5400,
        extracted_text_preview: 'Executive Summary: Fab capacity utilization hit 92.4% in August. High-bandwidth memory (HBM3e) demand outpaces packaging substrate output by 18%...'
      },
      created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    };

    const asset2: Asset = {
      id: 'a1000000-0000-0000-0000-000000000002',
      user_id: demoUserId,
      file_name: 'Executive_Briefing_Audio_Notes.mp3',
      file_type: 'audio',
      file_url: '/samples/executive_briefing.mp3',
      file_size: 4820000,
      extracted_summary: '28-minute strategic conversation between COO and VP of Procurement debating silicon wafer inventory buffers versus JIT (Just-In-Time) logistics.',
      metadata: {
        title: 'Executive Briefing: Silicon Inventory Logistics',
        category: 'Meeting Recording & Strategy',
        summary: 'Discussion confirming contingency budget allocation of $12M for domestic buffer stock and expedited sea-to-air shipping reroutes.',
        key_topics: ['Procurement Policy', 'Buffer Stock', 'Logistics Hedging', 'Budget Allocation ($12M)', 'COO Directives'],
        sentiment: 'Urgent & Decisive',
        domain: 'Enterprise & Business',
        mime_type: 'audio/mp3',
        duration_seconds: 1680,
        tokens_estimate: 4200,
        extracted_text_preview: '[00:04:12] COO: We cannot afford a two-week blind spot in substrate delivery. Approve the secondary vendor tier immediately...'
      },
      created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    };

    const asset3: Asset = {
      id: 'a1000000-0000-0000-0000-000000000003',
      user_id: demoUserId,
      file_name: 'Neural_Architecture_Topology_Diagram.png',
      file_type: 'image',
      file_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
      file_size: 1320000,
      extracted_summary: 'High-level schematic representing a sparse mixture-of-experts (MoE) transformer with 64 routed experts, low-latency cross-attention routers, and FP8 quantized weights.',
      metadata: {
        title: 'Sparse MoE Neural Pipeline Topology',
        category: 'System Architecture & Deep Learning',
        summary: 'Architectural blueprint specifying KV-cache compression layers, gating networks, and tensor parallelism partitioning across 8 H100 GPU clusters.',
        key_topics: ['Mixture-of-Experts', 'Routing Topologies', 'KV Cache Compression', 'Distributed Cluster Interconnect', 'FP8 Quantization'],
        sentiment: 'Technical & Neutral',
        domain: 'Technical & Engineering',
        mime_type: 'image/png',
        dimensions: { width: 1920, height: 1080 },
        tokens_estimate: 2100,
      },
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    };

    const asset4: Asset = {
      id: 'a1000000-0000-0000-0000-000000000004',
      user_id: demoUserId,
      file_name: 'Autonomous_Drone_Thermal_Inspection.mp4',
      file_type: 'video',
      file_url: '/samples/drone_inspection.mp4',
      file_size: 14200000,
      extracted_summary: 'Industrial aerial inspection video highlighting heat signature anomalies in rooftop solar arrays and localized transformer cooling coil degradation.',
      metadata: {
        title: 'Thermal Drone Photovoltaic Inspection',
        category: 'Infrared Telemetry & Diagnostics',
        summary: 'Detected 3 thermal hotspots exceeding 78°C on Inverter Block C, correlated with micro-cracks in bypass diodes.',
        key_topics: ['Infrared Thermal Signature', 'Inverter Degradation', 'Hotspot Localization', 'Predictive Maintenance', 'Solar Efficiency'],
        sentiment: 'Advisory & Alert',
        domain: 'Technical & Engineering',
        mime_type: 'video/mp4',
        duration_seconds: 420,
        tokens_estimate: 3600,
      },
      created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    };

    // Preloaded chat session with multi-modal synthesis
    const sessionId = 's1000000-0000-0000-0000-000000000001';
    const sampleSession: ChatSession = {
      id: sessionId,
      user_id: demoUserId,
      title: 'Supply Chain Discrepancy & Audio Cross-Check',
      domain: 'Enterprise & Business',
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    };

    const msg1: ChatMessage = {
      id: 'm1000000-0000-0000-0000-000000000001',
      session_id: sessionId,
      sender: 'user',
      content: 'Compare the findings in the PDF report with the statements made in the audio recording, and highlight any discrepancies regarding substrate allocations and budget.',
      attached_asset_ids: [asset1.id, asset2.id],
      tokens_used: 125,
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    };

    const msg2: ChatMessage = {
      id: 'm1000000-0000-0000-0000-000000000002',
      session_id: sessionId,
      sender: 'ai',
      content: `### Cross-Modal Synthesis: PDF Report vs. Executive Audio Briefing

Based on a unified cross-referencing between **${asset1.file_name}** *(PDF, pp. 8–14)* and **${asset2.file_name}** *(Audio, [00:04:12 - 00:09:45])*, here is the structured comparative analysis:

#### 1. Core Discrepancies Identified
* **Substrate Lead-Time Projection:**
  * *PDF Audit (p. 9):* Models an optimistic recovery of **14% lead-time compression** by late Q4 assuming standard maritime logistics remain unobstructed.
  * *Executive Audio ([00:05:30]):* The COO explicitly disputes this estimate, stating *"Maritime congestion at Yokohama will push actual packaging backlog to +22 days unless we activate air-cargo freight immediately."*
* **Budget Authorization Delta:**
  * *PDF Audit:* Recommends an allocated ceiling of **$8.5M** for secondary procurement buffers.
  * *Executive Audio ([00:08:14]):* The Procurement Committee unanimously authorized an escalated emergency pool of **$12.0M** (a **+$3.5M divergence** over the printed audit).

#### 2. Cross-Modal Alignment Matrix
| Observation Dimension | Document Findings (PDF) | Audio Briefing (Audio) | Variance Status |
| :--- | :--- | :--- | :--- |
| **High-Bandwidth Memory (HBM)** | 18% deficit vs. packaging run | Confirmed primary constraint | **Aligned** |
| **Secondary Supplier Tier** | Evaluation Phase | Immediate Contract Activation | **Accelerated by Audio** |
| **Total Contingency Budget** | $8,500,000 max | $12,000,000 approved | **+$3,500,000 Variance** |

#### 3. Strategic Action Items
1. **Harmonize Financial Disclosures:** Update Ledger Category *#SC-2026-B* to reflect the approved $12M allocation rather than the preliminary $8.5M figure.
2. **Track Air Freight Surcharges:** Monitor fuel price volatility impact on the air-rerouting mandate outlined in Audio [00:07:22].`,
      attached_asset_ids: [asset1.id, asset2.id],
      tokens_used: 840,
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 4000).toISOString(),
      metadata: {
        citations: [
          { asset_id: asset1.id, asset_name: asset1.file_name, timestamp_or_page: 'Page 9', excerpt: '14% lead-time compression modeled' },
          { asset_id: asset2.id, asset_name: asset2.file_name, timestamp_or_page: '00:05:30', excerpt: 'Maritime congestion pushes packaging backlog to +22 days' },
        ],
        domain: 'Enterprise & Business',
      },
    };

    this.data = {
      users: [demoUser],
      assets: [asset1, asset2, asset3, asset4],
      chat_sessions: [sampleSession],
      messages: [msg1, msg2],
    };
    this.save();
  }

  // --- Users Operations ---
  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  // --- Assets Operations (Filtered by user_id for strict RLS isolation) ---
  public getAssetsByUserId(
    userId: string,
    filters?: { file_type?: string; search?: string; domain?: string }
  ): Asset[] {
    return this.data.assets.filter((a) => {
      if (a.user_id !== userId) return false;
      if (filters?.file_type && filters.file_type !== 'all' && a.file_type !== filters.file_type) {
        return false;
      }
      if (filters?.domain && filters.domain !== 'all' && a.metadata.domain !== filters.domain) {
        return false;
      }
      if (filters?.search) {
        const query = filters.search.toLowerCase();
        const matchName = a.file_name.toLowerCase().includes(query);
        const matchSummary = (a.extracted_summary || '').toLowerCase().includes(query);
        const matchTopics = (a.metadata.key_topics || []).some((t) => t.toLowerCase().includes(query));
        const matchCategory = (a.metadata.category || '').toLowerCase().includes(query);
        if (!matchName && !matchSummary && !matchTopics && !matchCategory) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getAssetById(id: string, userId: string): Asset | undefined {
    return this.data.assets.find((a) => a.id === id && a.user_id === userId);
  }

  public createAsset(asset: Omit<Asset, 'id' | 'created_at'>): Asset {
    const newAsset: Asset = {
      ...asset,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    this.data.assets.push(newAsset);
    this.save();
    return newAsset;
  }

  public deleteAsset(id: string, userId: string): boolean {
    const initialLen = this.data.assets.length;
    this.data.assets = this.data.assets.filter((a) => !(a.id === id && a.user_id === userId));
    if (this.data.assets.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Chat Sessions Operations ---
  public getSessionsByUserId(userId: string): ChatSession[] {
    return this.data.chat_sessions
      .filter((s) => s.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getSessionById(id: string, userId: string): ChatSession | undefined {
    return this.data.chat_sessions.find((s) => s.id === id && s.user_id === userId);
  }

  public createSession(userId: string, title: string, domain?: string): ChatSession {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      user_id: userId,
      title,
      domain: domain || 'Enterprise & Business',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.chat_sessions.push(newSession);
    this.save();
    return newSession;
  }

  public deleteSession(id: string, userId: string): boolean {
    const session = this.getSessionById(id, userId);
    if (!session) return false;
    this.data.chat_sessions = this.data.chat_sessions.filter((s) => s.id !== id);
    this.data.messages = this.data.messages.filter((m) => m.session_id !== id);
    this.save();
    return true;
  }

  // --- Messages Operations ---
  public getMessagesBySessionId(sessionId: string, userId: string): ChatMessage[] {
    const session = this.getSessionById(sessionId, userId);
    if (!session) return [];
    return this.data.messages
      .filter((m) => m.session_id === sessionId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  public createMessage(msg: Omit<ChatMessage, 'id' | 'created_at'>): ChatMessage {
    const newMsg: ChatMessage = {
      ...msg,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    this.data.messages.push(newMsg);
    // Update session updated_at
    const session = this.data.chat_sessions.find((s) => s.id === msg.session_id);
    if (session) {
      session.updated_at = new Date().toISOString();
    }
    this.save();
    return newMsg;
  }

  // --- Analytics & Aggregates ---
  public getAnalytics(userId: string) {
    const userAssets = this.data.assets.filter((a) => a.user_id === userId);
    const userSessions = this.data.chat_sessions.filter((s) => s.user_id === userId);
    const userSessionIds = new Set(userSessions.map((s) => s.id));
    const userMessages = this.data.messages.filter((m) => userSessionIds.has(m.session_id));

    const totalStorageBytes = userAssets.reduce((sum, a) => sum + a.file_size, 0);
    const totalTokensUsed = userMessages.reduce((sum, m) => sum + (m.tokens_used || 0), 0);

    const modalityCounts = {
      image: userAssets.filter((a) => a.file_type === 'image').length,
      audio: userAssets.filter((a) => a.file_type === 'audio').length,
      video: userAssets.filter((a) => a.file_type === 'video').length,
      document: userAssets.filter((a) => a.file_type === 'document').length,
    };

    const domainCounts: Record<string, number> = {
      'Enterprise & Business': 0,
      'Education & Research': 0,
      'Media & Content': 0,
      'Technical & Engineering': 0,
    };

    userAssets.forEach((a) => {
      const d = a.metadata?.domain || 'Enterprise & Business';
      domainCounts[d] = (domainCounts[d] || 0) + 1;
    });

    const recentActivity = [
      ...userAssets.map((a) => ({
        id: a.id,
        type: 'asset_ingested' as const,
        title: `Ingested ${a.file_name}`,
        subtext: `${a.file_type.toUpperCase()} • ${a.metadata?.category || 'General'}`,
        timestamp: a.created_at,
        icon: a.file_type,
      })),
      ...userMessages
        .filter((m) => m.sender === 'user')
        .map((m) => ({
          id: m.id,
          type: 'chat_query' as const,
          title: `Queried: "${m.content.slice(0, 48)}${m.content.length > 48 ? '...' : ''}"`,
          subtext: `${m.attached_asset_ids?.length || 0} assets referenced`,
          timestamp: m.created_at,
          icon: 'message',
        })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

    return {
      totalAssets: userAssets.length,
      totalSessions: userSessions.length,
      totalQueries: userMessages.filter((m) => m.sender === 'user').length,
      totalStorageBytes,
      totalTokensUsed,
      modalityCounts,
      domainCounts,
      recentActivity,
    };
  }
}

export const db = new DatabaseService();
