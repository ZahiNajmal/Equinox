import React, { createContext, useEffect, useState } from 'react';
import { getUserProgress as apiGetProgress } from '../utils/api';
import axios from 'axios';

export const AuthContext = createContext({
  user: null,
  token: null,
  setAuth: () => {},
  logout: () => {}
});

export default function AuthProvider({ children }) {
  // Initialize state from localStorage
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('equinox_user'));
    } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('equinox_token') || null);

  // Set Axios header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Function to set authentication state (login/logout)
  const setAuth = ({ token, user }) => {
    setToken(token || null);
    setUser(user || null);
    
    // Manage localStorage persistence
    if (token) localStorage.setItem('equinox_token', token); else localStorage.removeItem('equinox_token');
    if (user) localStorage.setItem('equinox_user', JSON.stringify(user)); else localStorage.removeItem('equinox_user');
    
    // Update Axios header immediately
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // Function to clear authentication state
  const logout = () => {
    setAuth({ token: null, user: null });
    // Navigate to base path
    window.location.hash = '/';
    window.location.reload(); // Force refresh to clear context easily
  };

  return (
    <AuthContext.Provider value={{ user, token, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}