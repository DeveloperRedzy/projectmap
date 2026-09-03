import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DrawerHeader } from './Style';
import sidebarNavigationProjectMap from '../../constants/sidebarItems';
import {
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  ListItemButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ChevronLeft } from '@mui/icons-material';
import { DRAWER_WIDTH_OPENED } from '../../constants/consts';
import { useDispatch, useSelector } from 'react-redux';
import { setPMDrawerOpened } from '../../slices/projectmapSlice';
import useManagesAnyProject from '../../util/useManagesAnyProject';

export default function NavBarDrawer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const location = useLocation();
  const { drawerOpened } = useSelector((state) => state.projectmap);
  const { managesAny } = useManagesAnyProject();

  const closeDrawer = () => dispatch(setPMDrawerOpened(false));

  return (
    <Drawer
      sx={{
        width: `${DRAWER_WIDTH_OPENED}px`,
        flexShrink: 0,
        // On mobile the drawer is modal and must cover the AppBar (which
        // sits at theme.zIndex.drawer + 1), so its own header stays visible.
        zIndex: isMobile ? theme.zIndex.drawer + 2 : undefined,
        '& .MuiDrawer-paper': {
          width: `${DRAWER_WIDTH_OPENED}px`,
          boxSizing: 'border-box',
          zIndex: isMobile ? 'auto' : 19,
        },
      }}
      // Mobile: overlay with a backdrop (tap outside to close). Desktop: the
      // classic persistent side panel.
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="left"
      open={drawerOpened}
      onClose={closeDrawer}
      ModalProps={{ keepMounted: true }}
    >
      <DrawerHeader sx={{ zIndex: 20 }}>
        <Typography
          variant="h5"
          sx={{ flexGrow: 1, pl: 3, color: 'primary.main', fontWeight: 700 }}
        >
          ProjectMap
        </Typography>
        <IconButton onClick={closeDrawer} aria-label="Close menu">
          <ChevronLeft />
        </IconButton>
      </DrawerHeader>
      <List disablePadding={true}>
        {sidebarNavigationProjectMap.map((item, index) => (
          <div key={index}>
            <Typography
              sx={{
                p: '16px',
                pb: '24px',
                fontSize: '12px',
                letterSpacing: 1,
                fontWeight: 400,
                color: 'text.secondary',
              }}
            >
              {item.title}
            </Typography>
            {item.pages
              .filter((page) => !page.managerOnly || managesAny)
              .map((page, pageIndex) => (
                <ListItemButton
                  key={pageIndex}
                  component={Link}
                  to={page.href}
                  onClick={closeDrawer}
                  selected={location.pathname === page.href}
                  sx={{
                    color: 'inherit',
                    '&.Mui-selected': {
                      color: 'primary.light',
                      backgroundColor: 'neutral.lightBlue',
                      '& .MuiListItemIcon-root': { color: 'primary.light' },
                    },
                  }}
                >
                  <ListItemIcon>{page.icon}</ListItemIcon>
                  <ListItemText primary={page.title} />
                </ListItemButton>
              ))}
          </div>
        ))}
      </List>
    </Drawer>
  );
}
