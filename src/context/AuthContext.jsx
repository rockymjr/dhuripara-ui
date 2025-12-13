import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from localStorage
    try {
      const isAuth = authService.isAuthenticated();
      const user = authService.getUsername();
      
      console.log('AuthContext init - isAuth:', isAuth, 'user:', user);
      
      setIsAuthenticated(isAuth);
      setUsername(isAuth ? user : null);
    } catch (error) {
      console.error('Error initializing auth:', error);
      setIsAuthenticated(false);
      setUsername(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (phone, pin, password) => {
    try {
      const response = await authService.login(phone, pin, password);
      setIsAuthenticated(true);
      setUsername(response.memberName || response.username);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};