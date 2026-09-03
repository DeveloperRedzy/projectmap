import React, { useState } from 'react';
import {
  Grid,
  styled,
  Container,
  Avatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import StartPageContent from './StartPageContent';
import ProjectPlanner from './ProjectPlanner';
import StartPageBanner from '../../assets/StartPageBanner.svg';
import { Add, Logout, Person } from '@mui/icons-material';
import { logoutUser } from '../../redux/slices/authSlice';
import { useProfile } from '../../queries/useProfile';
import ProfileEditModal from '../ProfileEditModal';
import { getInitials } from '../../util/getInitials';

const WrapGrid = styled(Grid)`
  padding-top: 100px;
  padding-bottom: 92px;
`;

const ImageGrid = styled(Grid)`
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 274px;
  max-width: 533px;
`;

const StartPageView = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Shared profile cache: updates from ProfileEditModal (including the
  // first-login prompt in the NavBar) show up here immediately.
  const { data: profile } = useProfile(user?.id);

  const userName = profile?.first_name || user?.email?.split('@')[0] || 'User';
  const userInitials = profile
    ? getInitials(profile.first_name, profile.last_name)
    : '?';

  const handleProfileClose = () => {
    setProfileModalOpen(false);
  };

  return (
    <>
      <ProfileEditModal
        open={profileModalOpen}
        onClose={handleProfileClose}
      />
      <Container
        disableGutters
        sx={{
          maxWidth: '1080px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Grid
          container
          sx={{
            minHeight: { xs: '96px', md: '155px' },
            display: 'flex',
            alignContent: 'center',
            alignItems: 'center',
            px: { xs: '20px', md: '52px' },
          }}
        >
          <Grid item sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                letterSpacing: '-0.5px',
              }}
            >
              ProjectMap
            </Typography>
          </Grid>
          <Grid item sx={{ display: { xs: 'none', sm: 'block' } }}>
            <ListItemButton
              component={Link}
              to="/projectmap/overview"
              sx={{
                '&:hover': { backgroundColor: theme.palette.neutral.lightBlue },
                borderRadius: 1,
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Add sx={{ color: theme.palette.primary.light }} />
              </ListItemIcon>
              <ListItemText
                primary="Create a new Project"
                sx={{ color: theme.palette.primary.light }}
              />
            </ListItemButton>
          </Grid>
          <Grid item>
            <Tooltip title={userName}>
              <IconButton
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{ ml: 2 }}
                aria-label="User menu"
              >
                <Avatar
                  src={profile?.avatar_url || undefined}
                  sx={{
                    backgroundColor: theme.palette.primary.light,
                    color: '#fff',
                    fontSize: '0.9rem',
                  }}
                >
                  {userInitials}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              PaperProps={{ sx: { minWidth: 180 } }}
            >
              <MenuItem disabled sx={{ opacity: '1 !important' }}>
                <Typography variant="subtitle2">
                  {profile?.first_name} {profile?.last_name}
                </Typography>
              </MenuItem>
              <MenuItem disabled sx={{ opacity: '0.7 !important', mt: -1 }}>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  setMenuAnchor(null);
                  setProfileModalOpen(true);
                }}
              >
                <Person sx={{ mr: 2, fontSize: '1.2rem' }} />
                Edit Profile
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setMenuAnchor(null);
                  dispatch(logoutUser());
                }}
              >
                <Logout sx={{ mr: 2, fontSize: '1.2rem', color: '#f16460' }} />
                <Typography color="#f16460">Sign Out</Typography>
              </MenuItem>
            </Menu>
          </Grid>
        </Grid>
        <Grid
          container
          sx={{ px: { xs: '20px', md: '52px' }, backgroundColor: '#ffffff' }}
        >
          <WrapGrid container>
            <Grid item md={6} xs={12}>
              <StartPageContent />
            </Grid>
            <ImageGrid item md={6} xs={12}>
              <img
                height="100%"
                width="100%"
                alt="project planner"
                src={StartPageBanner}
              />
            </ImageGrid>
          </WrapGrid>
        </Grid>
        <ProjectPlanner />
      </Container>
    </>
  );
};

export default StartPageView;
