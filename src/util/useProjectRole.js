import { useSelector } from 'react-redux';
import { useMemo } from 'react';

/**
 * Returns the current user's role for a given project.
 * Checks the project_members data loaded into Redux.
 *
 * Fails closed: when no membership is found the user is treated as having
 * no role (not a manager). `isLoading` lets callers tell "still loading
 * membership data" apart from "loaded, and the user is not a member", so
 * they can show a spinner instead of wrongly denying access.
 *
 * @param {string} projectId - The project ID to check role for
 * @returns {{ role: 'manager' | 'member' | null, isManager: boolean, isMember: boolean, isLoading: boolean }}
 */
const useProjectRole = (projectId) => {
  const { authenticated, user } = useSelector((state) => state.auth);
  const users = useSelector((state) => state.projectmap.users);
  const dataStatus = useSelector((state) => state.projectmap.dataStatus);

  return useMemo(() => {
    const isLoading = dataStatus === 'loading' || dataStatus === 'idle';

    if (!authenticated || !projectId || !user) {
      return { role: null, isManager: false, isMember: false, isLoading };
    }

    // Look up from project members in Redux
    const membership = users.find(
      (u) => u.projectId === projectId && u.id === user.id,
    );

    if (membership) {
      const role = membership.role;
      return {
        role,
        isManager: role === 'manager',
        isMember: role === 'member',
        isLoading,
      };
    }

    // No membership found: fail closed. The user has no role on this project.
    return { role: null, isManager: false, isMember: false, isLoading };
  }, [authenticated, projectId, user, users, dataStatus]);
};

export default useProjectRole;
