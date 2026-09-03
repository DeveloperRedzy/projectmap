import React from 'react';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import useProjectRole from '../util/useProjectRole';

/**
 * Builds a wrapper with an isolated store whose state is baked in via
 * identity reducers, so the hook is tested without touching the real
 * slices, the API layer, or Supabase.
 */
const makeWrapper = ({
  authenticated = true,
  user = { id: 'u1' },
  users = [],
  dataStatus = 'succeeded',
}) => {
  const store = configureStore({
    reducer: {
      auth: (s = null) => s,
      projectmap: (s = null) => s,
    },
    preloadedState: {
      auth: { authenticated, user, session: null, status: 'idle', error: null },
      projectmap: { users, dataStatus },
    },
  });
  return ({ children }) => <Provider store={store}>{children}</Provider>;
};

const renderRole = (projectId, opts) =>
  renderHook(() => useProjectRole(projectId), { wrapper: makeWrapper(opts) }).result
    .current;

describe('useProjectRole', () => {
  test('reports manager when the user has a manager membership for the project', () => {
    const role = renderRole('p1', {
      user: { id: 'u1' },
      users: [{ projectId: 'p1', id: 'u1', role: 'manager' }],
    });
    expect(role.isManager).toBe(true);
    expect(role.isMember).toBe(false);
    expect(role.role).toBe('manager');
  });

  test('reports member when the user has a member membership for the project', () => {
    const role = renderRole('p1', {
      user: { id: 'u1' },
      users: [{ projectId: 'p1', id: 'u1', role: 'member' }],
    });
    expect(role.isMember).toBe(true);
    expect(role.isManager).toBe(false);
    expect(role.role).toBe('member');
  });

  test('fails closed (not manager) when membership is absent and data has loaded', () => {
    const role = renderRole('p1', {
      user: { id: 'u1' },
      users: [{ projectId: 'OTHER', id: 'u1', role: 'manager' }],
      dataStatus: 'succeeded',
    });
    expect(role.isManager).toBe(false);
    expect(role.isMember).toBe(false);
    expect(role.role).toBe(null);
  });

  test('is not a manager when unauthenticated', () => {
    const role = renderRole('p1', { authenticated: false, user: null });
    expect(role.isManager).toBe(false);
    expect(role.isMember).toBe(false);
    expect(role.role).toBe(null);
  });

  test('signals loading (fail closed) while membership data is still loading', () => {
    const role = renderRole('p1', {
      user: { id: 'u1' },
      users: [],
      dataStatus: 'loading',
    });
    expect(role.isLoading).toBe(true);
    expect(role.isManager).toBe(false);
  });

  test('is not loading once data has settled', () => {
    const role = renderRole('p1', {
      user: { id: 'u1' },
      users: [{ projectId: 'p1', id: 'u1', role: 'manager' }],
      dataStatus: 'succeeded',
    });
    expect(role.isLoading).toBe(false);
  });
});
