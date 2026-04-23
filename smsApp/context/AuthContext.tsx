import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, register as apiRegister } from '@/lib/api';

interface AuthContextType {
  token: string | null;
  userName: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      SecureStore.getItemAsync('token'),
      SecureStore.getItemAsync('userName'),
    ]).then(([t, n]) => {
      setToken(t);
      setUserName(n);
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    await SecureStore.setItemAsync('token', data.token);
    await SecureStore.setItemAsync('userName', data.user.name);
    setToken(data.token);
    setUserName(data.user.name);
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    const data = await apiRegister(name, email, phone, password);
    await SecureStore.setItemAsync('token', data.token);
    await SecureStore.setItemAsync('userName', data.user.name);
    setToken(data.token);
    setUserName(data.user.name);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('userName');
    setToken(null);
    setUserName(null);
  };

  return (
    <AuthContext.Provider value={{ token, userName, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
