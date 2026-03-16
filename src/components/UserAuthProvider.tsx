'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface UserInfo {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: UserInfo | null;
  accessToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  login: async () => {},
  logout: () => {},
});

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('userAccessToken');
    const storedUser = localStorage.getItem('userInfo');
    if (token && storedUser) {
      setAccessToken(token);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || '登入失敗');
    }
    const data = await res.json();
    localStorage.setItem('userAccessToken', data.accessToken);
    localStorage.setItem('userRefreshToken', data.refreshToken);
    localStorage.setItem('userInfo', JSON.stringify(data.user));
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('userAccessToken');
    localStorage.removeItem('userRefreshToken');
    localStorage.removeItem('userInfo');
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(AuthContext);
}
