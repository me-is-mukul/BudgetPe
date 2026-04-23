import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, register as apiRegister } from '@/lib/api';

interface AuthContextType {
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync('token').then((t) => {
      setToken(t);
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    await SecureStore.setItemAsync('token', data.token);
    setToken(data.token);
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    const data = await apiRegister(name, email, phone, password);
    await SecureStore.setItemAsync('token', data.token);
    setToken(data.token);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
