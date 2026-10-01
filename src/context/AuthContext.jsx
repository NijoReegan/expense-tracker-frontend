import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './authContext';
import {
  api,
  clearSession,
  getCurrentUser,
  getToken,
  storeSession,
  updateStoredUser as persistUser,
} from '../api/client';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [token, setToken] = useState(() => getToken());

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    storeSession(res.data);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (fullName, email, password) => {
    const res = await api.post('/auth/register', { fullName, email, password });
    storeSession(res.data);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // session is stateless; clearing locally is enough
    }
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const updateStoredUser = useCallback((data) => {
    const merged = persistUser(data);
    if (merged) setUser(merged);
    return merged;
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('et:unauthorized', onUnauthorized);
    return () => window.removeEventListener('et:unauthorized', onUnauthorized);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      initialized: true,
      login,
      register,
      logout,
      updateStoredUser,
    }),
    [user, token, login, register, logout, updateStoredUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}