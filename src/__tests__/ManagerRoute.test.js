import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import ManagerRoute from '../components/ManagerRoute';

const renderAt = ({ users = [], dataStatus = 'succeeded', user = { id: 'u1' } }) => {
  const store = configureStore({
    reducer: {
      auth: (s = null) => s,
      projectmap: (s = null) => s,
    },
    preloadedState: {
      auth: { authenticated: true, user, session: null, status: 'idle', error: null },
      projectmap: { users, dataStatus },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/projectmap/managerview']}>
        <Routes>
          <Route
            path="/projectmap/start"
            element={<div data-testid="start-page">Start</div>}
          />
          <Route
            path="/projectmap/managerview"
            element={
              <ManagerRoute>
                <div data-testid="manager-content">Manager View</div>
              </ManagerRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

describe('ManagerRoute', () => {
  test('renders children when the user manages a project', () => {
    renderAt({ users: [{ projectId: 'p1', id: 'u1', role: 'manager' }] });
    expect(screen.getByTestId('manager-content')).toBeInTheDocument();
  });

  test('redirects to start when the user manages no project', () => {
    renderAt({ users: [{ projectId: 'p1', id: 'u1', role: 'member' }] });
    expect(screen.queryByTestId('manager-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('start-page')).toBeInTheDocument();
  });

  test('does not redirect while membership data is still loading', () => {
    renderAt({ users: [], dataStatus: 'loading' });
    expect(screen.queryByTestId('start-page')).not.toBeInTheDocument();
    expect(screen.queryByTestId('manager-content')).not.toBeInTheDocument();
  });
});
