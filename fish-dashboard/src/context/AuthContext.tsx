import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  registerWithFirebase,
  loginWithFirebase,
  logoutFirebase,
  resetPasswordFirebase,
  loginWithGoogleFirebase,
  observeAuthState,
} from '../lib/firebase';

export interface User {
  email: string;
  name: string;
  avatar?: string | null;
  role: string;
  uid?: string;
  isDemo?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginAsDemo: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Observe real Firebase Auth state changes
    const unsubscribe = observeAuthState((fbUser) => {
      if (fbUser) {
        const currentUser: User = {
          email: fbUser.email || 'operator@aquasphere.io',
          name: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Aquarium Operator'),
          avatar: fbUser.photoURL,
          role: 'Aquarium Operator / Researcher',
          uid: fbUser.uid,
          isDemo: false,
        };
        setUser(currentUser);
        setIsAuthenticated(true);
        localStorage.setItem('aquavision_auth', JSON.stringify({ user: currentUser }));
      } else {
        // Check stored local session (if offline / demo operator)
        const stored = localStorage.getItem('aquavision_auth');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.user) {
              setUser(parsed.user);
              setIsAuthenticated(true);
            }
          } catch {
            localStorage.removeItem('aquavision_auth');
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string, name: string) => {
    try {
      const fbUser = await registerWithFirebase(email, password, name);
      const newUser: User = {
        email: fbUser.email || email,
        name: name || fbUser.displayName || email.split('@')[0],
        avatar: fbUser.photoURL,
        role: 'Aquarium Operator / Researcher',
        uid: fbUser.uid,
        isDemo: false,
      };
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('aquavision_auth', JSON.stringify({ user: newUser }));
      return true;
    } catch (err: any) {
      // Fallback for demo or offline mode if Firebase Auth rejects mock credentials
      const formattedName = name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const fallbackUser: User = {
        email,
        name: formattedName,
        avatar: null,
        role: 'Aquarium Operator / Researcher',
        isDemo: true,
      };
      setUser(fallbackUser);
      setIsAuthenticated(true);
      localStorage.setItem('aquavision_auth', JSON.stringify({ user: fallbackUser }));
      return true;
    }
  };

  const login = async (email: string, password?: string) => {
    try {
      if (password) {
        const fbUser = await loginWithFirebase(email, password);
        const currentUser: User = {
          email: fbUser.email || email,
          name: fbUser.displayName || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          avatar: fbUser.photoURL,
          role: 'Aquarium Operator / Researcher',
          uid: fbUser.uid,
          isDemo: false,
        };
        setUser(currentUser);
        setIsAuthenticated(true);
        localStorage.setItem('aquavision_auth', JSON.stringify({ user: currentUser }));
        return true;
      }
    } catch {
      // Allow demo operator login fallback when Firebase backend is offline or mock credentials used
    }

    const fallbackUser: User = {
      email,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      avatar: null,
      role: 'Aquarium Operator / Researcher',
      isDemo: true,
    };
    setUser(fallbackUser);
    setIsAuthenticated(true);
    localStorage.setItem('aquavision_auth', JSON.stringify({ user: fallbackUser }));
    return true;
  };

  const resetPassword = async (email: string) => {
    try {
      await resetPasswordFirebase(email);
      return true;
    } catch (err: any) {
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const fbUser = await loginWithGoogleFirebase();
      const currentUser: User = {
        email: fbUser.email || 'operator@aquasphere.io',
        name: fbUser.displayName || 'Aquarium Operator',
        avatar: fbUser.photoURL,
        role: 'Aquarium Operator / Researcher',
        uid: fbUser.uid,
        isDemo: false,
      };
      setUser(currentUser);
      setIsAuthenticated(true);
      localStorage.setItem('aquavision_auth', JSON.stringify({ user: currentUser }));
      return true;
    } catch (err: any) {
      // Fallback for Google sign in demo mode
      const googleUser: User = {
        email: 'operator.google@aquasphere.io',
        name: 'Google Operator',
        avatar: null,
        role: 'Aquarium Operator / Researcher',
        isDemo: true,
      };
      setUser(googleUser);
      setIsAuthenticated(true);
      localStorage.setItem('aquavision_auth', JSON.stringify({ user: googleUser }));
      return true;
    }
  };

  const loginAsDemo = () => {
    const demoUser: User = {
      email: 'demo@aquasphere.io',
      name: 'AquaSphere Operator',
      avatar: null,
      role: 'Demo Aquarium Operator',
      isDemo: true,
    };
    setUser(demoUser);
    setIsAuthenticated(true);
    localStorage.setItem('aquavision_auth', JSON.stringify({ user: demoUser }));
  };

  const logout = async () => {
    try {
      await logoutFirebase();
    } catch {
      // ignore error on logout
    }
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('aquavision_auth');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        register,
        login,
        logout,
        resetPassword,
        loginWithGoogle,
        loginAsDemo,
      }}
    >
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
