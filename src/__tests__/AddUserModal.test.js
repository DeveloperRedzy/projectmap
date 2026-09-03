import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { configureStore } from '@reduxjs/toolkit';
import projectmapReducer from '../slices/projectmapSlice';
import authReducer from '../redux/slices/authSlice';
import AddUserModal from '../components/AddUserModal';
import {
  sendInvite,
  fetchProjectInvitations,
  revokeInvitation,
} from '../api/invitationsApi';
import { fetchProjectMembers } from '../api/membersApi';

jest.mock('../api/supabaseClient', () => ({ supabase: {} }));
jest.mock('../api/invitationsApi');
jest.mock('../api/membersApi');

const renderModal = () => {
  const store = configureStore({
    reducer: { projectmap: projectmapReducer, auth: authReducer },
    preloadedState: {
      auth: { authenticated: true, user: { id: 'me' }, session: null, status: 'idle', error: null },
    },
  });
  return render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme()}>
        <MemoryRouter>
          <AddUserModal open setOpen={jest.fn()} pid="p1" />
        </MemoryRouter>
      </ThemeProvider>
    </Provider>,
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  fetchProjectMembers.mockResolvedValue([]);
  fetchProjectInvitations.mockResolvedValue([]);
});

describe('AddUserModal', () => {
  test('lists invitations with their status', async () => {
    fetchProjectInvitations.mockResolvedValue([
      { id: 'i1', email: 'pend@e.com', role: 'member', status: 'pending' },
      { id: 'i2', email: 'acc@e.com', role: 'manager', status: 'accepted' },
    ]);
    renderModal();
    expect(await screen.findByText(/pend@e.com/)).toBeInTheDocument();
    expect(screen.getByText(/acc@e.com/)).toBeInTheDocument();
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
    expect(screen.getByText(/accepted/i)).toBeInTheDocument();
  });

  test('sending an invite calls sendInvite and shows a success message', async () => {
    sendInvite.mockResolvedValue({ status: 'invited', email: 'new@e.com' });
    renderModal();

    const emailInput = await screen.findByLabelText(/Email address/i);
    fireEvent.change(emailInput, { target: { value: 'new@e.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Invite/i }));

    await waitFor(() =>
      expect(sendInvite).toHaveBeenCalledWith('p1', 'new@e.com', 'member'),
    );
    expect(await screen.findByText(/invitation sent/i)).toBeInTheDocument();
  });

  test('revoking a pending invite calls revokeInvitation', async () => {
    fetchProjectInvitations.mockResolvedValue([
      { id: 'i1', email: 'pend@e.com', role: 'member', status: 'pending' },
    ]);
    revokeInvitation.mockResolvedValue({ status: 'revoked' });
    renderModal();

    const revokeBtn = await screen.findByRole('button', {
      name: /Revoke invitation for pend@e.com/i,
    });
    fireEvent.click(revokeBtn);
    await waitFor(() => expect(revokeInvitation).toHaveBeenCalledWith('i1'));
  });
});
