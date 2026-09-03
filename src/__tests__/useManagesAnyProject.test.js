import React from 'react';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import useManagesAnyProject from '../util/useManagesAnyProject';

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

const render = (opts) =>
  renderHook(() => useManagesAnyProject(), { wrapper: makeWrapper(opts) }).result
    .current;

describe('useManagesAnyProject', () => {
  test('is true when the user is a manager of at least one project', () => {
    const r = render({
      user: { id: 'u1' },
      users: [
        { projectId: 'p1', id: 'u1', role: 'member' },
        { projectId: 'p2', id: 'u1', role: 'manager' },
      ],
    });
    expect(r.managesAny).toBe(true);
  });

  test('is false when the user is only ever a member', () => {
    const r = render({
      user: { id: 'u1' },
      users: [
        { projectId: 'p1', id: 'u1', role: 'member' },
        { projectId: 'p2', id: 'u2', role: 'manager' },
      ],
    });
    expect(r.managesAny).toBe(false);
  });

  test('is false when unauthenticated', () => {
    const r = render({ authenticated: false, user: null });
    expect(r.managesAny).toBe(false);
  });

  test('signals loading while membership data is still loading', () => {
    const r = render({ users: [], dataStatus: 'loading' });
    expect(r.isLoading).toBe(true);
    expect(r.managesAny).toBe(false);
  });

  test('is not loading once data has settled', () => {
    const r = render({
      user: { id: 'u1' },
      users: [{ projectId: 'p1', id: 'u1', role: 'manager' }],
      dataStatus: 'succeeded',
    });
    expect(r.isLoading).toBe(false);
  });
});
