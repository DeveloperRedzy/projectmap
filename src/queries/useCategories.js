import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCategories,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from '../api/categoriesApi';
import { tasksKey } from './useTasks';

export const categoriesKey = ['categories'];

export const mapCategory = (c) => ({
  id: c.id,
  name: c.name,
  phaseId: c.phase_id,
  sortOrder: c.sort_order,
});

export const useCategories = () =>
  useQuery({
    queryKey: categoriesKey,
    queryFn: async () => (await fetchCategories()).map(mapCategory),
  });

const useCategoryMutation = (mutationFn, applyOptimistic) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: categoriesKey });
      const previous = queryClient.getQueryData(categoriesKey);
      if (applyOptimistic) {
        queryClient.setQueryData(categoriesKey, (old = []) =>
          applyOptimistic(old, vars),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(categoriesKey, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: categoriesKey }),
  });
};

export const useCreateCategory = () =>
  useCategoryMutation(
    (category) => createCategoryApi(category),
    (old, category) => [
      ...old,
      {
        id: `temp-${old.length}`,
        name: category.name,
        phaseId: category.phase_id,
        sortOrder: category.sort_order ?? old.length,
      },
    ],
  );

export const useUpdateCategory = () =>
  useCategoryMutation(
    ({ id, data }) => updateCategoryApi(id, { name: data.name }),
    (old, { id, data }) => old.map((c) => (c.id === id ? { ...c, ...data } : c)),
  );

/**
 * Delete a category. The DB cascades to its tasks, so the tasks cache is
 * invalidated too (it refetches without the orphans).
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteCategoryApi(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: categoriesKey });
      const previous = queryClient.getQueryData(categoriesKey);
      queryClient.setQueryData(categoriesKey, (old = []) =>
        old.filter((c) => c.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(categoriesKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKey });
      queryClient.invalidateQueries({ queryKey: tasksKey });
    },
  });
};
