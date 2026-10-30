import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, getStoredToken, removeStoredToken, setStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; full_name: string; role?: string }) => Promise<void>;
  logout: () => void;
  quickDemoLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const stored = getStoredToken();
        if (stored) {
          const res = await api.getProfile();
          setUser(res.user);
        } else {
          // Provide fallback demo session
          setUser({
            id: '11111111-2222-3333-4444-555555555555',
            email: 'demo@omnimind.ai',
            full_name: 'Dr. Evelyn Vance',
            role: 'Principal Research Scientist',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          });
        }
      } catch (err) {
        console.warn('Could not restore auth profile:', err);
        removeStoredToken();
        setToken(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setUser(res.user);
    setToken(res.token);
  };

  const register = async (data: { email: string; password: string; full_name: string; role?: string }) => {
    const res = await api.register(data);
    setUser(res.user);
    setToken(res.token);
  };

  const logout = () => {
    removeStoredToken();
    setToken(null);
    setUser(null);
  };

  const quickDemoLogin = async () => {
    try {
      await login('demo@omnimind.ai', 'password123');
    } catch {
      // If server seed fallback is active, generate fallback demo user
      setUser({
        id: '11111111-2222-3333-4444-555555555555',
        email: 'demo@omnimind.ai',
        full_name: 'Dr. Evelyn Vance',
        role: 'Principal Research Scientist',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, quickDemoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
