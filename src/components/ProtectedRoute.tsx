import React from 'react';
import { Navigate } from 'react-router-dom';

type Props = {
  element: JSX.Element;
};

const ProtectedRoute: React.FC<Props> = ({ element }) => {
  const authed = typeof window !== 'undefined' && sessionStorage.getItem('isAuthenticated') === 'true';
  return authed ? element : <Navigate to="/" replace />;
};

export default ProtectedRoute;

