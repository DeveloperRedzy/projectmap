import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/slices/authSlice';
import ProtectedRoute from '../components/ProtectedRoute';

jest.mock('../api/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}));

const renderWithProviders = (authenticated, { sessionChecked = true } = {}) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        authenticated,
        user: authenticated ? { id: '1' } : null,
        session: null,
        sessionChecked,
        status: 'idle',
        error: null,
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Login</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div data-testid="protected-content">Secret Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

describe('ProtectedRoute', () => {
  test('should render children when authenticated', () => {
    renderWithProviders(true);
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Secret Content')).toBeInTheDocument();
  });

  test('should redirect to login when not authenticated', () => {
    renderWithProviders(false);
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  test('should wait (not redirect) while the initial session is still loading', () => {
    renderWithProviders(false, { sessionChecked: false });
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    expect(screen.getByText(/checking session/i)).toBeInTheDocument();
  });
});
