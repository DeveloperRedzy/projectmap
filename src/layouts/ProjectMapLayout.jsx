import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { useDispatch, useSelector } from 'react-redux';
import NavBar from '../components/NavBar/NavBar';
import { HEADER_HEIGHT } from '../constants/consts';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ErrorBoundary from '../components/ErrorBoundary';
import GlobalErrorToast from '../components/GlobalErrorToast';
import LoadingSpinner from '../components/LoadingSpinner';
import { loadAllData } from '../slices/projectmapSlice';
import useRealtimeSync from '../util/useRealtimeSync';
import useSessionGuard from '../util/useSessionGuard';

const ProjectMapLayout = () => {
  const dispatch = useDispatch();
  const dataStatus = useSelector((state) => state.projectmap.dataStatus);
  const dataError = useSelector((state) => state.projectmap.dataError);
  const hasProjects = useSelector(
    (state) => state.projectmap.projects.length > 0,
  );
  // Show the full-page spinner only for the very first load. Later reloads
  // (realtime sync re-fetches) refresh quietly behind the current view.
  const initialLoading = dataStatus === 'loading' && !hasProjects;

  useEffect(() => {
    dispatch(loadAllData());
  }, [dispatch]);

  // Subscribe to realtime changes from other users
  useRealtimeSync();

  // Redirect to login on session expiry
  useSessionGuard();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <CssBaseline />
      <NavBar />
      {/* The drawer overlays the page, so the content never shifts. */}
      <Box sx={{ mt: `${HEADER_HEIGHT}px` }}>
        <ErrorBoundary>
          {initialLoading && <LoadingSpinner message="Loading projects..." />}
          {dataStatus === 'failed' && (
            <Box sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>
              Failed to load data: {dataError}
            </Box>
          )}
          {!initialLoading && dataStatus !== 'failed' && <Outlet />}
        </ErrorBoundary>
      </Box>
      <GlobalErrorToast />
    </LocalizationProvider>
  );
};

export default ProjectMapLayout;
