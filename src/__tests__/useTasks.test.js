import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useTasks,
  useToggleTask,
  useCreateTask,
  useDeleteTask,
  tasksKey,
} from '../queries/useTasks';
import {
  fetchTasks,
  toggleTaskApi,
  createTaskApi,
  deleteTaskApi,
} from '../api/tasksApi';

jest.mock('../api/tasksApi');

const makeWrapper = () => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  return { qc, wrapper };
};

beforeEach(() => jest.clearAllMocks());

describe('useTasks query', () => {
  test('fetches and maps tasks to frontend shape', async () => {
    fetchTasks.mockResolvedValue([
      { id: 't1', text: 'A', category_id: 'c1', completed: 0, assigned_to: null },
    ]);
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useTasks(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data[0]).toMatchObject({
      id: 't1',
      text: 'A',
      categoryId: 'c1',
      completed: 0,
    });
  });
});

describe('useToggleTask', () => {
  test('optimistically marks complete, calls api as completing, rolls back on error', async () => {
    fetchTasks.mockResolvedValue([{ id: 't1', text: 'A', category_id: 'c1', completed: 0 }]);
    let rejectToggle;
    toggleTaskApi.mockReturnValue(new Promise((_, reject) => { rejectToggle = reject; }));
    const { wrapper } = makeWrapper();
    const { result } = renderHook(
      () => ({ tasks: useTasks(), toggle: useToggleTask() }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.tasks.isSuccess).toBe(true));

    act(() => result.current.toggle.mutate({ id: 't1', userId: 'u1' }));
    // optimistic -> completed 100
    await waitFor(() =>
      expect(result.current.tasks.data.find((t) => t.id === 't1').completed).toBe(100),
    );
    expect(toggleTaskApi).toHaveBeenCalledWith('t1', true, 'u1');

    act(() => rejectToggle(new Error('boom')));
    await waitFor(() =>
      expect(result.current.tasks.data.find((t) => t.id === 't1').completed).toBe(0),
    );
  });
});

describe('useCreateTask / useDeleteTask', () => {
  test('create appends optimistically and calls the api', async () => {
    fetchTasks.mockResolvedValueOnce([]); // initial
    fetchTasks.mockResolvedValue([{ id: 't9', text: 'New', category_id: 'c1', completed: 0 }]); // refetch
    createTaskApi.mockResolvedValue({ id: 't9', text: 'New', category_id: 'c1', completed: 0 });
    const { wrapper } = makeWrapper();
    const { result } = renderHook(
      () => ({ tasks: useTasks(), create: useCreateTask() }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.tasks.isSuccess).toBe(true));

    act(() => result.current.create.mutate({ text: 'New', category_id: 'c1', completed: 0 }));
    await waitFor(() =>
      expect(result.current.tasks.data.some((t) => t.text === 'New')).toBe(true),
    );
    expect(createTaskApi).toHaveBeenCalledWith({ text: 'New', category_id: 'c1', completed: 0 });
  });

  test('delete removes the task optimistically', async () => {
    fetchTasks.mockResolvedValueOnce([{ id: 't1', text: 'A', category_id: 'c1', completed: 0 }]); // initial
    fetchTasks.mockResolvedValue([]); // refetch after delete
    deleteTaskApi.mockResolvedValue(undefined);
    const { wrapper } = makeWrapper();
    const { result } = renderHook(
      () => ({ tasks: useTasks(), del: useDeleteTask() }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.tasks.isSuccess).toBe(true));

    act(() => result.current.del.mutate('t1'));
    await waitFor(() => expect(result.current.tasks.data.length).toBe(0));
    expect(deleteTaskApi).toHaveBeenCalledWith('t1');
  });
});
