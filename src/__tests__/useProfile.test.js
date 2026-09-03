import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProfile, useUpdateProfile } from '../queries/useProfile';
import { fetchProfile, updateProfileApi } from '../api/profilesApi';

jest.mock('../api/profilesApi');

const makeWrapper = () => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useProfile / useUpdateProfile', () => {
  test('useProfile fetches and returns the profile', async () => {
    fetchProfile.mockResolvedValue({ id: 'u1', first_name: 'Jane', last_name: 'Doe' });
    const { result } = renderHook(() => useProfile('u1'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchProfile).toHaveBeenCalledWith('u1');
    expect(result.current.data.first_name).toBe('Jane');
  });

  test('useProfile is disabled when there is no userId', () => {
    const { result } = renderHook(() => useProfile(undefined), { wrapper: makeWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(fetchProfile).not.toHaveBeenCalled();
  });

  test('useUpdateProfile calls the API and updates the cached profile', async () => {
    // initial load returns Jane; the post-update invalidation refetch returns Janet
    fetchProfile.mockResolvedValueOnce({ id: 'u1', first_name: 'Jane', last_name: 'Doe' });
    fetchProfile.mockResolvedValue({ id: 'u1', first_name: 'Janet', last_name: 'Doe' });
    updateProfileApi.mockResolvedValue({ id: 'u1', first_name: 'Janet', last_name: 'Doe' });
    const { result } = renderHook(
      () => ({ profile: useProfile('u1'), update: useUpdateProfile() }),
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(result.current.profile.isSuccess).toBe(true));

    act(() => {
      result.current.update.mutate({ userId: 'u1', updates: { first_name: 'Janet' } });
    });

    await waitFor(() =>
      expect(updateProfileApi).toHaveBeenCalledWith('u1', { first_name: 'Janet' }),
    );
    await waitFor(() => expect(result.current.profile.data.first_name).toBe('Janet'));
  });

  test('optimistically updates the cache before the server responds, and rolls back on error', async () => {
    fetchProfile.mockResolvedValue({ id: 'u1', first_name: 'Jane', last_name: 'Doe' });
    let rejectUpdate;
    updateProfileApi.mockReturnValue(new Promise((_, reject) => { rejectUpdate = reject; }));
    const { result } = renderHook(
      () => ({ profile: useProfile('u1'), update: useUpdateProfile() }),
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(result.current.profile.isSuccess).toBe(true));

    act(() => {
      result.current.update.mutate({ userId: 'u1', updates: { first_name: 'Optimistic' } });
    });
    // optimistic value applied immediately
    await waitFor(() => expect(result.current.profile.data.first_name).toBe('Optimistic'));

    // server fails -> rollback to previous
    act(() => rejectUpdate(new Error('boom')));
    await waitFor(() => expect(result.current.profile.data.first_name).toBe('Jane'));
  });
});
