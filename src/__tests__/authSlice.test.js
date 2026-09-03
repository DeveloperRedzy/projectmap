import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setSession, clearError } from '../redux/slices/authSlice';

jest.mock('../api/authApi', () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
}));

const createTestStore = () =>
  configureStore({
    reducer: { auth: authReducer },
  });

describe('authSlice', () => {
  test('should return initial state', () => {
    const store = createTestStore();
    const state = store.getState().auth;
    expect(state.authenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.status).toBe('idle');
    expect(state.error).toBeNull();
  });

  test('setSession with valid session should authenticate', () => {
    const store = createTestStore();
    const mockSession = {
      user: { id: 'user-1', email: 'test@example.com' },
      access_token: 'token-123',
    };

    store.dispatch(setSession(mockSession));

    const state = store.getState().auth;
    expect(state.authenticated).toBe(true);
    expect(state.user.id).toBe('user-1');
    expect(state.session).toBe(mockSession);
  });

  test('setSession with null should log out', () => {
    const store = createTestStore();
    // First set a session
    store.dispatch(setSession({
      user: { id: 'user-1' },
      access_token: 'token',
    }));
    expect(store.getState().auth.authenticated).toBe(true);

    // Then clear it
    store.dispatch(setSession(null));

    const state = store.getState().auth;
    expect(state.authenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
  });

  test('clearError should reset error state', () => {
    const store = createTestStore();
    // Simulate a failed login
    store.dispatch({
      type: 'auth/loginUser/rejected',
      payload: 'Invalid credentials',
    });
    expect(store.getState().auth.error).toBe('Invalid credentials');

    store.dispatch(clearError());
    expect(store.getState().auth.error).toBeNull();
  });

  test('loginUser.pending should set loading state', () => {
    const store = createTestStore();
    store.dispatch({ type: 'auth/loginUser/pending' });

    const state = store.getState().auth;
    expect(state.status).toBe('loading');
    expect(state.error).toBeNull();
  });

  test('loginUser.fulfilled should set authenticated state', () => {
    const store = createTestStore();
    store.dispatch({
      type: 'auth/loginUser/fulfilled',
      payload: {
        user: { id: 'user-1', email: 'test@example.com' },
        session: { access_token: 'token' },
      },
    });

    const state = store.getState().auth;
    expect(state.status).toBe('succeeded');
    expect(state.authenticated).toBe(true);
    expect(state.user.email).toBe('test@example.com');
  });

  test('loginUser.rejected should set error state', () => {
    const store = createTestStore();
    store.dispatch({
      type: 'auth/loginUser/rejected',
      payload: 'Invalid login credentials',
    });

    const state = store.getState().auth;
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Invalid login credentials');
    expect(state.authenticated).toBe(false);
  });

  test('logoutUser.fulfilled should clear all state', () => {
    const store = createTestStore();
    // Set up authenticated state
    store.dispatch(setSession({
      user: { id: 'user-1' },
      access_token: 'token',
    }));

    // Logout
    store.dispatch({ type: 'auth/logoutUser/fulfilled' });

    const state = store.getState().auth;
    expect(state.authenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.status).toBe('idle');
  });
});
