import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPhases,
  createPhaseApi,
  updatePhaseApi,
  deletePhaseApi,
} from '../api/phasesApi';
import { categoriesKey } from './useCategories';
import { tasksKey } from './useTasks';

export const phasesKey = ['phases'];

export const mapPhase = (p) => ({
  id: p.id,
  name: p.name,
  projectId: p.project_id,
  dueDate: p.due_date,
  sortOrder: p.sort_order,
});

// Frontend {name?, dueDate?} -> DB column names.
const phaseUpdatesToDb = (data) => {
  const db = {};
  if (data.name !== undefined) db.name = data.name;
  if (data.dueDate !== undefined) db.due_date = data.dueDate;
  return db;
};

export const usePhases = () =>
  useQuery({
    queryKey: phasesKey,
    queryFn: async () => (await fetchPhases()).map(mapPhase),
  });

const usePhaseMutation = (mutationFn, applyOptimistic) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: phasesKey });
      const previous = queryClient.getQueryData(phasesKey);
      if (applyOptimistic) {
        queryClient.setQueryData(phasesKey, (old = []) => applyOptimistic(old, vars));
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(phasesKey, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: phasesKey }),
  });
};

export const useCreatePhase = () =>
  usePhaseMutation(
    (phase) => createPhaseApi(phase),
    (old, phase) => [
      ...old,
      {
        id: `temp-${old.length}`,
        name: phase.name,
        projectId: phase.project_id,
        dueDate: phase.due_date,
        sortOrder: phase.sort_order ?? old.length,
      },
    ],
  );

export const useUpdatePhase = () =>
  usePhaseMutation(
    ({ id, data }) => updatePhaseApi(id, phaseUpdatesToDb(data)),
    (old, { id, data }) => old.map((p) => (p.id === id ? { ...p, ...data } : p)),
  );

/**
 * Delete a phase. The DB cascades to its categories and tasks, so their
 * query caches are invalidated too (they refetch without the orphans).
 */
export const useDeletePhase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deletePhaseApi(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: phasesKey });
      const previous = queryClient.getQueryData(phasesKey);
      queryClient.setQueryData(phasesKey, (old = []) =>
        old.filter((p) => p.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(phasesKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: phasesKey });
      queryClient.invalidateQueries({ queryKey: categoriesKey });
      queryClient.invalidateQueries({ queryKey: tasksKey });
    },
  });
};
