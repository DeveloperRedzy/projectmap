import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/slices/authSlice';
import AcceptInvite from '../pages/auth/AcceptInvite';
import { getInvitationByToken, acceptInvitation } from '../api/invitationsApi';

let mockToken = 'tok123';
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [{ get: () => mockToken }],
}));

jest.mock('../api/supabaseClient', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}));

jest.mock('../api/invitationsApi');

const renderWith = ({ authenticated = false, user = null } = {}) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: { authenticated, user, session: null, status: 'idle', error: null },
    },
  });
  return render(
    <Provider store={store}>
      <AcceptInvite />
    </Provider>,
  );
};

beforeEach(() => {
  mockToken = 'tok123';
  mockNavigate.mockReset();
  getInvitationByToken.mockReset();
  acceptInvitation.mockReset();
});

describe('AcceptInvite', () => {
  test('shows the project name and invited email for a pending invite', async () => {
    getInvitationByToken.mockResolvedValue({
      status: 'pending',
      email: 'invitee@example.com',
      role: 'member',
      project_id: 'p1',
      project_name: 'Alpha Project',
    });
    renderWith();
    expect(await screen.findByText(/Alpha Project/)).toBeInTheDocument();
    expect(screen.getByText(/invitee@example.com/)).toBeInTheDocument();
  });

  test('shows an expired message for an expired invite', async () => {
    getInvitationByToken.mockResolvedValue({ status: 'expired' });
    renderWith();
    expect(await screen.findByText(/expired/i)).toBeInTheDocument();
  });

  test('shows an invalid message when the token is not found', async () => {
    getInvitationByToken.mockResolvedValue({ status: 'not_found' });
    renderWith();
    expect(await screen.findByText(/invalid|no longer/i)).toBeInTheDocument();
  });

  test('shows a revoked message for a revoked invite', async () => {
    getInvitationByToken.mockResolvedValue({ status: 'revoked' });
    renderWith();
    expect(await screen.findByText(/revoked/i)).toBeInTheDocument();
  });

  test('offers sign-out instead of accepting when signed in as a different email', async () => {
    getInvitationByToken.mockResolvedValue({
      status: 'pending',
      email: 'invitee@example.com',
      role: 'member',
      project_id: 'p1',
      project_name: 'Alpha Project',
    });
    renderWith({ authenticated: true, user: { id: 'u9', email: 'other@example.com' } });

    expect(
      await screen.findByRole('button', { name: /sign out and continue/i }),
    ).toBeInTheDocument();
    expect(acceptInvitation).not.toHaveBeenCalled();
  });

  test('auto-accepts and navigates to the project when already authenticated', async () => {
    getInvitationByToken.mockResolvedValue({
      status: 'pending',
      email: 'invitee@example.com',
      role: 'member',
      project_id: 'p1',
      project_name: 'Alpha Project',
    });
    acceptInvitation.mockResolvedValue({ status: 'accepted', project_id: 'p1' });
    renderWith({ authenticated: true, user: { id: 'u1', email: 'invitee@example.com' } });

    await waitFor(() => expect(acceptInvitation).toHaveBeenCalledWith('tok123'));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/projectmap/overview/p1'),
    );
  });
});
