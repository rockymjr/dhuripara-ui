import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  console.log('ProtectedRoute rendering - isAuthenticated:', isAuthenticated, 'loading:', loading);

  // Wait for auth context to initialize
  if (loading) {
    console.log('Auth still loading, showing loader');
    return <Loader />;
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/admin/login" replace />;
  }

  console.log('ProtectedRoute allowing child to render');
  return children;
};

export default ProtectedRoute;