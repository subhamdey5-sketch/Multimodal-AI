import { Asset, ChatMessage, ChatSession, AnalyticsData, User } from '../types';

const TOKEN_KEY = 'omnimind_jwt_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  async register(data: { email: string; password: string; full_name: string; role?: string }) {
    const res = await fetchWithAuth('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) setStoredToken(res.token);
    return res;
  },

  async login(data: { email: string; password: string }) {
    const res = await fetchWithAuth('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) setStoredToken(res.token);
    return res;
  },

  async getProfile(): Promise<{ user: User }> {
    return fetchWithAuth('/api/user/profile');
  },

  // Assets
  async getAssets(params?: { file_type?: string; search?: string; domain?: string }): Promise<{ assets: Asset[] }> {
    const searchParams = new URLSearchParams();
    if (params?.file_type && params.file_type !== 'all') searchParams.set('file_type', params.file_type);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.domain && params.domain !== 'all') searchParams.set('domain', params.domain);
    const qs = searchParams.toString();
    return fetchWithAuth(`/api/assets${qs ? `?${qs}` : ''}`);
  },

  async uploadAssets(files: File[]): Promise<{ message: string; assets: Asset[] }> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    return fetchWithAuth('/api/assets/upload', {
      method: 'POST',
      body: formData,
    });
  },

  async deleteAsset(id: string): Promise<{ message: string }> {
    return fetchWithAuth(`/api/assets/${id}`, {
      method: 'DELETE',
    });
  },

  // Chat
  async getSessions(): Promise<{ sessions: ChatSession[] }> {
    return fetchWithAuth('/api/chat/sessions');
  },

  async createSession(title: string, domain?: string): Promise<{ session: ChatSession }> {
    return fetchWithAuth('/api/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ title, domain }),
    });
  },

  async deleteSession(id: string): Promise<{ message: string }> {
    return fetchWithAuth(`/api/chat/sessions/${id}`, {
      method: 'DELETE',
    });
  },

  async getMessages(sessionId: string): Promise<{ messages: ChatMessage[] }> {
    return fetchWithAuth(`/api/chat/sessions/${sessionId}/messages`);
  },

  async sendMultimodalChat(data: {
    sessionId: string;
    prompt: string;
    assetIds?: string[];
  }): Promise<{ userMessage: ChatMessage; aiMessage: ChatMessage }> {
    return fetchWithAuth('/api/chat/multimodal', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Search
  async search(query: string): Promise<{ assets: Asset[]; messages: Array<ChatMessage & { session_title: string }> }> {
    return fetchWithAuth(`/api/search?q=${encodeURIComponent(query)}`);
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    return fetchWithAuth('/api/analytics');
  },
};
