import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginAdmin as loginApi, changePassword as changePasswordApi } from '../api/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('sentron-token');
      const savedUser = localStorage.getItem('sentron-user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {
      localStorage.removeItem('sentron-token');
      localStorage.removeItem('sentron-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    try {
      const data = await loginApi({ email: cleanEmail, password: cleanPassword });
      const { token: newToken, user: newUser } = data;

      localStorage.setItem('sentron-token', newToken);
      localStorage.setItem('sentron-user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);

      return newUser;
    } catch (err) {
      // If backend is offline or unreachable, allow the verified master admin to log in seamlessly
      const isOffline = !err.response || err.code === 'ERR_NETWORK' || err.response?.status >= 500;
      if (
        isOffline &&
        cleanEmail === 'sentronasia@yahoo.com' &&
        cleanPassword === '36672209SentronAsia@'
      ) {
        const adminUser = {
          id: 'admin-master',
          email: 'sentronasia@yahoo.com',
          role: 'admin',
          mustChangePassword: false,
        };
        const token = 'master-admin-token-' + Date.now();
        localStorage.setItem('sentron-token', token);
        localStorage.setItem('sentron-user', JSON.stringify(adminUser));
        setToken(token);
        setUser(adminUser);
        return adminUser;
      }
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sentron-token');
    localStorage.removeItem('sentron-user');
    setToken(null);
    setUser(null);
  }, []);

  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    const data = await changePasswordApi({ currentPassword, newPassword });
    // Update user in state to clear mustChangePassword flag
    const updatedUser = { ...user, mustChangePassword: false };
    localStorage.setItem('sentron-user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return data;
  }, [user]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    mustChangePassword: user?.mustChangePassword === true,
    login,
    logout,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
