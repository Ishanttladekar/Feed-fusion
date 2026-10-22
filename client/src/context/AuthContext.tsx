import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserPreferences } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  toggleMockMode: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('feed_fusion_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('feed_fusion_token');
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
          localStorage.setItem('feed_fusion_user', JSON.stringify(userData));
        } catch (error) {
          console.error('Failed to load user profile:', error);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('feed_fusion_token', data.token);
    localStorage.setItem('feed_fusion_user', JSON.stringify(data.user));
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await authService.register(name, email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('feed_fusion_token', data.token);
    localStorage.setItem('feed_fusion_user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('feed_fusion_token');
    localStorage.removeItem('feed_fusion_user');
  };

  const updatePreferences = async (prefs: Partial<UserPreferences>) => {
    const updated = await authService.updatePreferences(prefs);
    if (user) {
      const newUser = { ...user, preferences: updated };
      setUser(newUser);
      localStorage.setItem('feed_fusion_user', JSON.stringify(newUser));
    }
  };

  const toggleMockMode = async () => {
    if (!user) return;
    const currentMock = user.preferences.mockMode;
    await updatePreferences({ mockMode: !currentMock });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updatePreferences,
        toggleMockMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
