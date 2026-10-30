import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { apiClient } from '@/lib/axios';
import { queryClient } from '@/lib/query-client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  register: (name: string, email: string, pass: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('__jungle_auth_token__')
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = async () => {
    const savedToken = localStorage.getItem('__jungle_auth_token__');
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await apiClient.get<{ user: User }>('/auth/me');
      setUser(res.data.user);
    } catch {
      localStorage.removeItem('__jungle_auth_token__');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();

    const handleExpired = () => {
      setUser(null);
      setToken(null);
      queryClient.clear();
    };

    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const res = await apiClient.post<{ user: User; token: string }>('/auth/login', {
      email,
      password: pass,
    });
    localStorage.setItem('__jungle_auth_token__', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    await queryClient.invalidateQueries();
    return res.data.user;
  };

  const register = async (name: string, email: string, pass: string): Promise<User> => {
    const res = await apiClient.post<{ user: User; token: string }>('/auth/register', {
      name,
      email,
      password: pass,
    });
    localStorage.setItem('__jungle_auth_token__', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    await queryClient.invalidateQueries();
    return res.data.user;
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem('__jungle_auth_token__');
      setUser(null);
      setToken(null);
      queryClient.clear();
    }
  };

  const refreshUser = async () => {
    await fetchSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser utilizado dentro de AuthProvider');
  return ctx;
}
