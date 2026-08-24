import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginDemo: (role: 'admin' | 'faculty') => Promise<void>;
  register: (name: string, email: string, pass: string, role: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('edupulse_user') || localStorage.getItem('smartdrop_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('edupulse_token') || localStorage.getItem('smartdrop_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyUser = async () => {
      const savedToken = localStorage.getItem('edupulse_token') || localStorage.getItem('smartdrop_token');
      if (savedToken) {
        try {
          const currentUser = await authService.getMe();
          setUser(currentUser);
          localStorage.setItem('edupulse_user', JSON.stringify(currentUser));
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await authService.login(email, pass);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('edupulse_token', res.access_token);
    localStorage.setItem('edupulse_user', JSON.stringify(res.user));
  };

  const loginDemo = async (role: 'admin' | 'faculty') => {
    const email = role === 'admin' ? 'admin@edupulse.edu' : 'faculty@edupulse.edu';
    const pass = role === 'admin' ? 'admin123' : 'faculty123';
    try {
      await login(email, pass);
    } catch {
      // Fallback to legacy seed email if needed
      const fallbackEmail = role === 'admin' ? 'admin@smartdrop.edu' : 'faculty@smartdrop.edu';
      await login(fallbackEmail, pass);
    }
  };

  const register = async (name: string, email: string, pass: string, role: string) => {
    await authService.register(name, email, pass, role);
    await login(email, pass);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('edupulse_token');
    localStorage.removeItem('edupulse_user');
    localStorage.removeItem('smartdrop_token');
    localStorage.removeItem('smartdrop_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginDemo,
        register,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
