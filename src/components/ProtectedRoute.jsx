import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { authenticated, status, sessionChecked } = useSelector(
    (state) => state.auth,
  );

  // Wait for the initial session restore (page load/refresh) before deciding.
  // Redirecting too early would bounce a logged-in user through /login and
  // lose the page they were on.
  if (!sessionChecked || status === 'loading') {
    return <LoadingSpinner message="Checking session..." />;
  }

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
