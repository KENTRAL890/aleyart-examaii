// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore session
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      authAPI.me()
        .then(res => setUser(res.data))
        .catch(() => { localStorage.clear(); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { user: u, accessToken, refreshToken } = res.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) await authAPI.logout({ refreshToken });
    } catch {/* ignore */}
    localStorage.clear();
    setUser(null);
  }, []);

  const hasRole = useCallback((...roles) => roles.includes(user?.role), [user]);

  const canDo = useCallback((action) => {
    const perms = {
      admin:       ['*'],
      headteacher: ['exam:view','exam:approve','exam:print','exam:export','report:view'],
      examofficer: ['exam:create','exam:edit','exam:print','exam:export','repo:manage','question:manage'],
      teacher:     ['exam:create','exam:save','exam:edit','exam:print','exam:export','repo:view','question:view'],
    };
    const rolePerms = perms[user?.role] || [];
    return rolePerms.includes('*') || rolePerms.includes(action);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole, canDo }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
