import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { useDispatch, useSelector } from 'react-redux';
import NavBar from '../components/NavBar/NavBar';
import { DRAWER_WIDTH_OPENED, HEADER_HEIGHT } from '../constants/consts';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ErrorBoundary from '../components/ErrorBoundary';
import GlobalErrorToast from '../components/GlobalErrorToast';
import LoadingSpinner from '../components/LoadingSpinner';
import { loadAllData } from '../slices/projectmapSlice';
import useRealtimeSync from '../util/useRealtimeSync';
import useSessionGuard from '../util/useSessionGuard';

const ProjectMapLayout = () => {
  const dispatch = useDispatch();
  const { dataStatus, dataError, projects, drawerOpened } = useSelector(
    (state) => state.projectmap,
  );
  // Show the full-page spinner only for the very first load. Later reloads
  // (realtime sync re-fetches) refresh quietly behind the current view.
  const initialLoading = dataStatus === 'loading' && projects.length === 0;

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
      <Box
        sx={{
          mt: `${HEADER_HEIGHT}px`,
          // Desktop persistent drawer pushes the content; the mobile drawer
          // is a modal overlay and must not shift anything.
          ml: { xs: 0, md: drawerOpened ? `${DRAWER_WIDTH_OPENED}px` : 0 },
          // Transition ONLY the margin (not `all`), with the same easing and
          // duration as the AppBar — mismatched timings and a 400ms `all`
          // transition made opening the drawer feel laggy on heavy pages.
          transition: (theme) =>
            theme.transitions.create('margin', {
              easing: drawerOpened
                ? theme.transitions.easing.easeOut
                : theme.transitions.easing.sharp,
              duration: drawerOpened
                ? theme.transitions.duration.enteringScreen
                : theme.transitions.duration.leavingScreen,
            }),
        }}
      >
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
