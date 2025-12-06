import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMemberAuth } from '../../context/MemberAuthContext';

const MemberProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useMemberAuth();

  if (!isAuthenticated) {
    return <Navigate to="/member/login" replace />;
  }

  return children;
};

export default MemberProtectedRoute;