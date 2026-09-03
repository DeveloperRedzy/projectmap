import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTasks,
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
  toggleTaskApi,
  assignTaskApi,
  moveTaskApi,
} from '../api/tasksApi';

export const tasksKey = ['tasks'];

// DB row (snake_case) -> frontend shape (camelCase), matching the old slice.
export const mapTask = (t) => ({
  id: t.id,
  text: t.text,
  categoryId: t.category_id,
  completed: t.completed,
  assignedTo: t.assigned_to,
  completedBy: t.completed_by,
  completedAt: t.completed_at,
  createdBy: t.created_by,
  sortOrder: t.sort_order,
});

/** All tasks visible to the current user (RLS-scoped), in frontend shape. */
export const useTasks = () =>
  useQuery({
    queryKey: tasksKey,
    queryFn: async () => (await fetchTasks()).map(mapTask),
  });

// Shared optimistic-mutation wrapper over the ['tasks'] list cache.
const useTaskMutation = (mutationFn, applyOptimistic) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: tasksKey });
      const previous = queryClient.getQueryData(tasksKey);
      if (applyOptimistic) {
        queryClient.setQueryData(tasksKey, (old = []) =>
          applyOptimistic(old, vars),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(tasksKey, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: tasksKey }),
  });
};

export const useCreateTask = () =>
  useTaskMutation(
    (task) => createTaskApi(task),
    (old, task) => [
      ...old,
      {
        id: `temp-${task.category_id}-${old.length}`,
        text: task.text,
        categoryId: task.category_id,
        completed: task.completed ?? 0,
        assignedTo: null,
        completedBy: null,
        completedAt: null,
        createdBy: task.created_by ?? null,
        sortOrder: task.sort_order ?? old.length,
      },
    ],
  );

export const useUpdateTask = () =>
  useTaskMutation(
    ({ id, data }) => updateTaskApi(id, data),
    (old, { id, data }) =>
      old.map((t) => (t.id === id ? { ...t, ...data } : t)),
  );

export const useDeleteTask = () =>
  useTaskMutation(
    (id) => deleteTaskApi(id),
    (old, id) => old.filter((t) => t.id !== id),
  );

export const useToggleTask = () => {
  const queryClient = useQueryClient();
  // Captured in onMutate (before the optimistic flip) so mutationFn sends the
  // correct direction. mutationFn runs after onMutate, so this is set in time.
  const completingRef = useRef({});
  return useMutation({
    mutationFn: ({ id, userId }) =>
      toggleTaskApi(id, completingRef.current[id], userId),
    onMutate: async ({ id, userId }) => {
      const previous = queryClient.getQueryData(tasksKey) || [];
      const current = previous.find((t) => t.id === id);
      const isCompleting = (current?.completed ?? 0) !== 100;
      completingRef.current[id] = isCompleting;
      await queryClient.cancelQueries({ queryKey: tasksKey });
      queryClient.setQueryData(tasksKey, (old = []) =>
        old.map((t) =>
          t.id === id
            ? isCompleting
              ? { ...t, completed: 100, completedBy: userId }
              : { ...t, completed: 0, completedBy: null, completedAt: null }
            : t,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(tasksKey, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: tasksKey }),
  });
};

export const useAssignTask = () =>
  useTaskMutation(
    ({ id, userId }) => assignTaskApi(id, userId),
    (old, { id, userId }) =>
      old.map((t) => (t.id === id ? { ...t, assignedTo: userId } : t)),
  );

export const useMoveTask = () =>
  useTaskMutation(
    ({ id, data }) => moveTaskApi(id, data.categoryId),
    (old, { id, data }) =>
      old.map((t) => (t.id === id ? { ...t, categoryId: data.categoryId } : t)),
  );
