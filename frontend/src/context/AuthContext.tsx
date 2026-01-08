import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { api } from '../services/api';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  const setSession = useCallback((tokenValue: string | null, userValue: User | null) => {
    if (tokenValue) {
      localStorage.setItem('token', tokenValue);
      setToken(tokenValue);
    } else {
      localStorage.removeItem('token');
      setToken(null);
    }
    setUser(userValue);
  }, []);

  const refresh = useCallback(async () => {
    const stored = localStorage.getItem('token');
    if (!stored) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data.data.user);
      setToken(stored);
    } catch {
      setSession(null, null);
    } finally {
      setLoading(false);
    }
  }, [setSession]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post('/api/auth/login', { email, password });
      setSession(res.data.data.token, res.data.data.user);
    },
    [setSession]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await api.post('/api/auth/signup', { name, email, password });
      setSession(res.data.data.token, res.data.data.user);
    },
    [setSession]
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      setSession(null, null);
    }
  }, [setSession]);

  const value = useMemo(
    () => ({ user, token, loading, login, signup, logout, refresh }),
    [user, token, loading, login, signup, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
