import React from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

interface RoleRouteProps {
  allow: Array<'member' | 'lead' | 'admin'>;
  children: JSX.Element;
}

const RoleRoute = ({ allow, children }: RoleRouteProps) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="page">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!allow.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default RoleRoute;
