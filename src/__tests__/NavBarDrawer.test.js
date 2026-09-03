import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import NavBarDrawer from '../components/NavBar/NavBarDrawer';

const renderDrawer = ({ users = [], user = { id: 'u1' } }) => {
  const store = configureStore({
    reducer: {
      auth: (s = null) => s,
      projectmap: (s = null) => s,
    },
    preloadedState: {
      auth: { authenticated: true, user, session: null, status: 'idle', error: null },
      projectmap: { users, drawerOpened: true, dataStatus: 'succeeded' },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <NavBarDrawer />
      </MemoryRouter>
    </Provider>,
  );
};

describe('NavBarDrawer manager-view gating', () => {
  test('shows the Manager View item to a user who manages a project', () => {
    renderDrawer({ users: [{ projectId: 'p1', id: 'u1', role: 'manager' }] });
    expect(screen.getByText('Manager View')).toBeInTheDocument();
  });

  test('hides the Manager View item from a non-manager', () => {
    renderDrawer({ users: [{ projectId: 'p1', id: 'u1', role: 'member' }] });
    expect(screen.queryByText('Manager View')).not.toBeInTheDocument();
    // other items remain visible
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });
});
