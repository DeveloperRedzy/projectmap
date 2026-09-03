import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { supabase } from '../api/supabaseClient';
import { loadAllData } from '../slices/projectmapSlice';
import { queryClient } from '../queries/queryClient';
import { tasksKey } from '../queries/useTasks';
import { phasesKey } from '../queries/usePhases';
import { categoriesKey } from '../queries/useCategories';

// Tables whose data lives in React Query -> targeted cache invalidation
// (quiet background refetch, no full-page reload/spinner).
const QUERY_TABLES = {
  tasks: tasksKey,
  phases: phasesKey,
  categories: categoriesKey,
};
// Tables still on Redux -> debounced loadAllData (projects + members).
const REDUX_TABLES = ['projects', 'project_members'];

/**
 * Subscribes to realtime changes on project-related tables and routes each to
 * the smallest possible refresh: query-backed tables invalidate just their
 * query key; the remaining Redux-backed tables trigger a debounced loadAllData.
 * Both paths are debounced to coalesce bursts of changes.
 */
const useRealtimeSync = () => {
  const dispatch = useDispatch();
  const reloadTimeout = useRef(null);
  const queryTimeouts = useRef({});

  const debouncedReloadAll = useCallback(() => {
    if (reloadTimeout.current) clearTimeout(reloadTimeout.current);
    reloadTimeout.current = setTimeout(() => dispatch(loadAllData()), 500);
  }, [dispatch]);

  const debouncedInvalidate = useCallback((table, key) => {
    if (queryTimeouts.current[table]) clearTimeout(queryTimeouts.current[table]);
    queryTimeouts.current[table] = setTimeout(
      () => queryClient.invalidateQueries({ queryKey: key }),
      500,
    );
  }, []);

  useEffect(() => {
    const timeouts = queryTimeouts.current;
    let channel = supabase.channel('project-realtime');

    Object.entries(QUERY_TABLES).forEach(([table, key]) => {
      channel = channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => debouncedInvalidate(table, key),
      );
    });

    REDUX_TABLES.forEach((table) => {
      channel = channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        debouncedReloadAll,
      );
    });

    channel.subscribe();

    return () => {
      if (reloadTimeout.current) clearTimeout(reloadTimeout.current);
      Object.values(timeouts).forEach((t) => t && clearTimeout(t));
      supabase.removeChannel(channel);
    };
  }, [debouncedReloadAll, debouncedInvalidate]);
};

export default useRealtimeSync;
