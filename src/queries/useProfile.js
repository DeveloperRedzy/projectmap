import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProfile, updateProfileApi } from '../api/profilesApi';

export const profileKey = (userId) => ['profile', userId];

/** Server state: a user's profile. */
export const useProfile = (userId) =>
  useQuery({
    queryKey: profileKey(userId),
    queryFn: () => fetchProfile(userId),
    enabled: !!userId,
  });

/**
 * Update the current user's profile with an optimistic cache update and
 * rollback on failure. No page reload — the profile query updates in place.
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, updates }) => updateProfileApi(userId, updates),
    onMutate: async ({ userId, updates }) => {
      await queryClient.cancelQueries({ queryKey: profileKey(userId) });
      const previous = queryClient.getQueryData(profileKey(userId));
      queryClient.setQueryData(profileKey(userId), (old) => ({
        ...(old || {}),
        ...updates,
      }));
      return { previous, userId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(profileKey(context.userId), context.previous);
      }
    },
    onSettled: (_data, _err, { userId }) => {
      queryClient.invalidateQueries({ queryKey: profileKey(userId) });
    },
  });
};
