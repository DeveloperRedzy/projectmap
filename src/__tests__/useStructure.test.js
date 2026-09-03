import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from '../queries/useCategories';
import { usePhases, useUpdatePhase, useDeletePhase } from '../queries/usePhases';
import {
  fetchCategories,
  createCategoryApi,
  deleteCategoryApi,
} from '../api/categoriesApi';
import { fetchPhases, updatePhaseApi, deletePhaseApi } from '../api/phasesApi';

jest.mock('../api/categoriesApi');
jest.mock('../api/phasesApi');
jest.mock('../api/tasksApi');

const makeWrapper = () => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
};

beforeEach(() => jest.clearAllMocks());

describe('useCategories', () => {
  test('fetches and maps categories', async () => {
    fetchCategories.mockResolvedValue([{ id: 'c1', name: 'Cat', phase_id: 'p1', sort_order: 0 }]);
    const { result } = renderHook(() => useCategories(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data[0]).toMatchObject({ id: 'c1', name: 'Cat', phaseId: 'p1' });
  });

  test('create appends optimistically and calls api', async () => {
    fetchCategories.mockResolvedValueOnce([]);
    fetchCategories.mockResolvedValue([{ id: 'c9', name: 'Outcome', phase_id: 'p1', sort_order: 0 }]);
    createCategoryApi.mockResolvedValue({ id: 'c9', name: 'Outcome', phase_id: 'p1', sort_order: 0 });
    const { result } = renderHook(
      () => ({ list: useCategories(), create: useCreateCategory() }),
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    act(() => result.current.create.mutate({ name: 'Outcome', phase_id: 'p1' }));
    await waitFor(() => expect(result.current.list.data.some((c) => c.name === 'Outcome')).toBe(true));
    expect(createCategoryApi).toHaveBeenCalledWith({ name: 'Outcome', phase_id: 'p1' });
  });
});

describe('usePhases', () => {
  test('fetches and maps phases', async () => {
    fetchPhases.mockResolvedValue([
      { id: 'p1', name: 'M1', project_id: 'pr1', due_date: '2026-06-01', sort_order: 0 },
    ]);
    const { result } = renderHook(() => usePhases(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data[0]).toMatchObject({ id: 'p1', name: 'M1', projectId: 'pr1', dueDate: '2026-06-01' });
  });

  test('update maps dueDate -> due_date and applies optimistically', async () => {
    fetchPhases.mockResolvedValueOnce([
      { id: 'p1', name: 'M1', project_id: 'pr1', due_date: '2026-06-01', sort_order: 0 },
    ]); // initial
    fetchPhases.mockResolvedValue([
      { id: 'p1', name: 'M1', project_id: 'pr1', due_date: '2026-07-01', sort_order: 0 },
    ]); // refetch after update
    updatePhaseApi.mockResolvedValue({ id: 'p1', name: 'M1', project_id: 'pr1', due_date: '2026-07-01', sort_order: 0 });
    const { result } = renderHook(
      () => ({ list: usePhases(), update: useUpdatePhase() }),
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    act(() => result.current.update.mutate({ id: 'p1', data: { dueDate: '2026-07-01' } }));
    await waitFor(() =>
      expect(result.current.list.data.find((p) => p.id === 'p1').dueDate).toBe('2026-07-01'),
    );
    expect(updatePhaseApi).toHaveBeenCalledWith('p1', { due_date: '2026-07-01' });
  });

  test('delete removes the phase optimistically and calls the api', async () => {
    fetchPhases.mockResolvedValueOnce([
      { id: 'p1', name: 'M1', project_id: 'pr1', due_date: '2026-06-01', sort_order: 0 },
    ]); // initial
    fetchPhases.mockResolvedValue([]); // refetch after delete
    deletePhaseApi.mockResolvedValue(undefined);
    const { result } = renderHook(
      () => ({ list: usePhases(), del: useDeletePhase() }),
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    act(() => result.current.del.mutate('p1'));
    await waitFor(() => expect(result.current.list.data.length).toBe(0));
    expect(deletePhaseApi).toHaveBeenCalledWith('p1');
  });
});

describe('useDeleteCategory', () => {
  test('delete removes the category optimistically and calls the api', async () => {
    fetchCategories.mockResolvedValueOnce([
      { id: 'c1', name: 'Cat', phase_id: 'p1', sort_order: 0 },
    ]); // initial
    fetchCategories.mockResolvedValue([]); // refetch after delete
    deleteCategoryApi.mockResolvedValue(undefined);
    const { result } = renderHook(
      () => ({ list: useCategories(), del: useDeleteCategory() }),
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    act(() => result.current.del.mutate('c1'));
    await waitFor(() => expect(result.current.list.data.length).toBe(0));
    expect(deleteCategoryApi).toHaveBeenCalledWith('c1');
  });
});
