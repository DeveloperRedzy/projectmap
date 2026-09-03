import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import ProjectMapLayout from './layouts/ProjectMapLayout';
import Login from './pages/auth/Login';
import AcceptInvite from './pages/auth/AcceptInvite';
import ProtectedRoute from './components/ProtectedRoute';
import ManagerRoute from './components/ManagerRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load route components for better performance
const Overview = lazy(() => import('./pages/overview/Overview'));
const StartPageView = lazy(() => import('./components/startpageView/StartPageView'));
const ProjectList = lazy(() => import('./pages/projectList/ProjectList'));
const ManagerView = lazy(() => import('./components/managerView/ManagerView'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));

const LazyRoute = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

const routes = [
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/accept-invite',
    element: <AcceptInvite />,
  },
  {
    path: '/privacy',
    element: <LazyRoute><PrivacyPolicy /></LazyRoute>,
  },
  {
    path: '/terms',
    element: <LazyRoute><TermsOfService /></LazyRoute>,
  },
  {
    path: '/projectmap',
    element: (
      <ProtectedRoute>
        <ProjectMapLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/projectmap/start" replace />,
      },
      {
        path: 'start',
        element: <LazyRoute><StartPageView /></LazyRoute>,
      },
      {
        path: 'overview',
        element: <LazyRoute><ProjectList /></LazyRoute>,
      },
      {
        path: 'overview/:projectId',
        element: <LazyRoute><Overview fixed={true} /></LazyRoute>,
      },
      {
        path: 'managerview',
        element: (
          <ManagerRoute>
            <LazyRoute><ManagerView /></LazyRoute>
          </ManagerRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
];

export default routes;
