import { styled } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';

// The drawer overlays the page on every screen size, so the bar never
// shifts or resizes — it only needs to sit above the page content.
const AppBar = styled(MuiAppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
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
