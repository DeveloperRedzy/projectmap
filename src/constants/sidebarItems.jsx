import { ManageAccounts, Home, Folder } from '@mui/icons-material';

export const sidebarItems = [
  {
    href: '/projectmap/start',
    icon: <Home />,
    title: 'Start',
  },
  {
    href: '/projectmap/overview',
    icon: <Folder />,
    title: 'Projects',
  },
  {
    href: '/projectmap/managerview',
    icon: <ManageAccounts />,
    title: 'Manager View',
    managerOnly: true,
  },
];

const sidebarNavigationProjectMap = [
  {
    title: 'MENU',
    pages: sidebarItems,
  },
];

export default sidebarNavigationProjectMap;
