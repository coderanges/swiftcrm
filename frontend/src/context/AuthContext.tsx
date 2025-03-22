import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { AuthState, User } from '../types';

interface AuthContextProps {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authService.getCurrentUser();
        setAuthState({
          isAuthenticated: true,
          user: response.data.user,
          loading: false,
          error: null
        });
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null
        });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await authService.login(email, password);
      setAuthState({
        isAuthenticated: true,
        user: response.data.user,
        loading: false,
        error: null
      });
      navigate('/');
    } catch (error: any) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error.response?.data?.error || 'Login failed'
      });
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await authService.register(name, email, password);
      setAuthState(prev => ({ ...prev, loading: false }));
      navigate('/login');
    } catch (error: any) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error.response?.data?.error || 'Registration failed'
      });
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      });
      navigate('/login');
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.response?.data?.error || 'Logout failed'
      }));
    }
  };

  const value = {
    authState,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 