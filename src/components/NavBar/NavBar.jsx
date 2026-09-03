import React, { useState, useEffect } from 'react';
import { AppBar } from './Style';
import NavBarDrawer from './NavBarDrawer';

import {
  Container,
  IconButton,
  Typography,
  Toolbar,
  Avatar,
  Tooltip,
  Stack,
  TextField,
} from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setPMDrawerOpened, updateProject, loadProjectMembers } from '../../slices/projectmapSlice';
import AddUserModal from '../AddUserModal';
import { DatePicker } from '@mui/x-date-pickers';
import ProjectUsers from '../ProjectUsers';
import { Close, Logout, Menu } from '@mui/icons-material';
import useProjectRole from '../../util/useProjectRole';
import { logoutUser } from '../../redux/slices/authSlice';
import ProfileEditModal from '../ProfileEditModal';
import { useProfile } from '../../queries/useProfile';
import { getInitials } from '../../util/getInitials';

const NavBar = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const projects = useSelector((state) => state.projectmap.projects);
  const drawerOpened = useSelector((state) => state.projectmap.drawerOpened);
  const openProject = projects.find((project) => project.id === projectId);
  const { isManager } = useProjectRole(projectId);
  const { user } = useSelector((state) => state.auth);

  const [modalOpen, setModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [title, setTitle] = useState(openProject?.name ?? '');
  const { data: profile } = useProfile(user?.id);

  // Re-seed the local title when the project (or its server name) changes.
  useEffect(() => {
    setTitle(openProject?.name ?? '');
  }, [openProject?.name]);

  const userName = profile?.first_name || user?.email?.split('@')[0] || 'User';
  const userInitials = profile
    ? getInitials(profile.first_name, profile.last_name)
    : (user?.email?.charAt(0) || '?').toUpperCase();

  // Prompt first-time users (no name yet) to set up their profile.
  useEffect(() => {
    if (profile && !profile.first_name && !profile.last_name) {
      setIsFirstLogin(true);
      setProfileModalOpen(true);
    }
  }, [profile]);

  const handleProfileClose = (saved) => {
    setProfileModalOpen(false);
    setIsFirstLogin(false);
    // No page reload: the profile query cache is already updated by the
    // mutation. Refresh the current project's members so their displayed
    // name updates in place too.
    if (saved && projectId) {
      dispatch(loadProjectMembers(projectId));
    }
  };

  const updateStartDate = (newDate) => {
    dispatch(
      updateProject({ id: projectId, data: { startDate: newDate.toString() } }),
    );
  };

  const updateEndDate = (newDate) => {
    dispatch(
      updateProject({ id: projectId, data: { endDate: newDate.toString() } }),
    );
  };

  // Commit the title once (blur/Enter) instead of one API call per keystroke.
  const commitTitle = () => {
    const trimmed = title.trim();
    if (!trimmed || trimmed === openProject?.name) return;
    dispatch(updateProject({ id: projectId, data: { name: trimmed } }));
  };

  return (
    <>
      <AddUserModal open={modalOpen} setOpen={setModalOpen} />
      <ProfileEditModal
        open={profileModalOpen}
        onClose={handleProfileClose}
        isFirstLogin={isFirstLogin}
      />
      <AppBar position="fixed" sx={{ backgroundColor: 'white' }}>
        <Container sx={{ maxWidth: '1080px' }}>
          <Toolbar variant="dense" sx={{ height: '64px' }}>
            <IconButton
              aria-label="open drawer"
              edge="start"
              onClick={() => dispatch(setPMDrawerOpened(!drawerOpened))}
              sx={{ mr: 2 }}
            >
              <Menu />
            </IconButton>
            {!projectId && (
              <Typography
                variant="h4"
                sx={{ ml: { xs: 1, sm: 5 }, flexGrow: 1, color: '#0000008a' }}
              >
                {/* The start page carries its own ProjectMap header. */}
                {location.pathname.includes('start') ? '' : 'Projects'}
              </Typography>
            )}
            {projectId && openProject && (
              <>
                <Stack
                  direction="row"
                  gap={{ xs: 2, md: 4, lg: 8 }}
                  mr={{ xs: '0.5em', md: '2em' }}
                  flexGrow={1}
                  alignItems="center"
                >
                  <TextField
                    size="small"
                    variant="filled"
                    label="Project Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={commitTitle}
                    onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                    InputProps={{ readOnly: !isManager }}
                    sx={{
                      width: { lg: '25em', md: '18em' },
                      flexGrow: { xs: 1, md: 0 },
                      minWidth: 0,
                    }}
                  />
                  {/* Dates are edited here on desktop; on phones the toolbar
                      has no room — the project views keep dates visible. */}
                  <Stack
                    direction="row"
                    gap={{ md: 4, lg: 8 }}
                    sx={{ display: { xs: 'none', md: 'flex' } }}
                  >
                    <DatePicker
                      maxDate={new Date(openProject.endDate)}
                      onChange={updateStartDate}
                      value={openProject.startDate}
                      label="Start"
                      inputFormat="DD/MM/YYYY"
                      disabled={!isManager}
                      renderInput={(params) => (
                        <TextField size="small" variant="filled" {...params} />
                      )}
                    />
                    <DatePicker
                      minDate={new Date(openProject.startDate)}
                      onChange={updateEndDate}
                      value={openProject.endDate}
                      label="End"
                      inputFormat="DD/MM/YYYY"
                      disabled={!isManager}
                      renderInput={(params) => (
                        <TextField size="small" variant="filled" {...params} />
                      )}
                    />
                  </Stack>
                </Stack>
                <ProjectUsers
                  projectId={projectId}
                  setModalOpen={setModalOpen}
                  isManager={isManager}
                />
              </>
            )}
            {!location.pathname.includes('start') && (
              <>
                <Tooltip title={`${userName} — click to edit profile`}>
                  <IconButton
                    size="large"
                    edge="end"
                    aria-label="Edit profile"
                    aria-haspopup="true"
                    color="inherit"
                    onClick={() => setProfileModalOpen(true)}
                  >
                    <Avatar
                      alt={userName}
                      src={profile?.avatar_url || undefined}
                      sx={{
                        bgcolor: '#1976D2',
                        color: '#fff',
                        fontSize: '0.9rem',
                      }}
                    >
                      {userInitials}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Sign out">
                  <IconButton
                    size="small"
                    onClick={() => dispatch(logoutUser())}
                    aria-label="Sign out"
                    sx={{ ml: 1 }}
                  >
                    <Logout fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {projectId && (
              <>
                <Tooltip placement="bottom" title="Close Project">
                  <IconButton
                    sx={{ ml: 5 }}
                    onClick={() => navigate(`./overview`)}
                  >
                    <Close fontSize="large" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      <NavBarDrawer />
    </>
  );
};

export default NavBar;
