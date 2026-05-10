import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('aquavision_auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('aquavision_auth');
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Mock auth — always succeeds
    const mockUser = {
      email,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      avatar: null,
      role: 'Researcher',
    };
    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('aquavision_auth', JSON.stringify({ user: mockUser }));
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('aquavision_auth');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
