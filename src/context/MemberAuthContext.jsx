import React, { createContext, useState, useContext, useEffect } from 'react';
import { memberService } from '../services/memberService';

const MemberAuthContext = createContext(null);

export const MemberAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [memberName, setMemberName] = useState(null);
  const [isOperator, setIsOperator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize member auth state from localStorage
    try {
      const isAuth = memberService.isAuthenticated();
      const name = memberService.getMemberName();
      const operator = memberService.isOperator();
      
      console.log('MemberAuthContext init - isAuth:', isAuth, 'name:', name, 'isOperator:', operator);
      
      setIsAuthenticated(isAuth);
      setMemberName(isAuth ? name : null);
      setIsOperator(isAuth && operator);
    } catch (error) {
      console.error('Error initializing member auth:', error);
      setIsAuthenticated(false);
      setMemberName(null);
      setIsOperator(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (phone, pin) => {
    try {
      const response = await memberService.login(phone, pin);
      setIsAuthenticated(true);
      setMemberName(response.memberName);
      setIsOperator(response.isOperator || false);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    memberService.logout();
    setIsAuthenticated(false);
    setMemberName(null);
    setIsOperator(false);
  };

  return (
    <MemberAuthContext.Provider value={{ isAuthenticated, memberName, isOperator, login, logout, loading }}>
      {children}
    </MemberAuthContext.Provider>
  );
};

export const useMemberAuth = () => {
  const context = useContext(MemberAuthContext);
  if (!context) {
    throw new Error('useMemberAuth must be used within MemberAuthProvider');
  }
  return context;
};