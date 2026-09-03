import React from 'react';
import { Navigate } from 'react-router-dom';
import useManagesAnyProject from '../util/useManagesAnyProject';
import LoadingSpinner from './LoadingSpinner';

/**
 * Guards routes that should only be reachable by users who manage at least
 * one project (e.g. the global Manager View). While membership data is still
 * loading we wait; once loaded, non-managers are redirected to the start page.
 */
const ManagerRoute = ({ children }) => {
  const { managesAny, isLoading } = useManagesAnyProject();

  if (isLoading) {
    return <LoadingSpinner message="Checking access..." />;
  }

  if (!managesAny) {
    return <Navigate to="/projectmap/start" replace />;
  }

  return children;
};

export default ManagerRoute;
