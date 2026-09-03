import { useSelector } from 'react-redux';
import { useMemo } from 'react';

/**
 * Returns whether the current user is a manager of at least one project.
 *
 * Drives access to the global Manager View (nav item + route): only users
 * who manage a project should see it. Fails closed. `isLoading` lets callers
 * show a spinner instead of redirecting before membership data has loaded.
 *
 * @returns {{ managesAny: boolean, isLoading: boolean }}
 */
const useManagesAnyProject = () => {
  const { authenticated, user } = useSelector((state) => state.auth);
  const users = useSelector((state) => state.projectmap.users);
  const dataStatus = useSelector((state) => state.projectmap.dataStatus);

  return useMemo(() => {
    const isLoading = dataStatus === 'loading' || dataStatus === 'idle';

    if (!authenticated || !user) {
      return { managesAny: false, isLoading };
    }

    const managesAny = users.some(
      (u) => u.id === user.id && u.role === 'manager',
    );
    return { managesAny, isLoading };
  }, [authenticated, user, users, dataStatus]);
};

export default useManagesAnyProject;
