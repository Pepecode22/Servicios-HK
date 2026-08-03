import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hk_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success) {
        localStorage.setItem('hk_token', data.token);
        localStorage.setItem('hk_user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error al iniciar sesión' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('hk_token');
    localStorage.removeItem('hk_user');
    setUser(null);
  };

  const isAuthenticated = !!user && !!localStorage.getItem('hk_token');

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
