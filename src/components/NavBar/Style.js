import { styled } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  // Desktop only: the persistent drawer pushes the bar right AND shrinks its
  // width, so the page never overflows horizontally. On mobile the drawer is
  // a modal overlay and the bar stays put.
  ...(open && {
    [theme.breakpoints.up('md')]: {
      marginLeft: `${drawerWidth}px`,
      width: `calc(100% - ${drawerWidth}px)`,
    },
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export { AppBar, DrawerHeader };
