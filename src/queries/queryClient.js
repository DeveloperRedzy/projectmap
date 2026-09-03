import { QueryClient } from '@tanstack/react-query';

// Shared React Query client. Modest defaults: keep data briefly fresh, retry
// once, and don't refetch on window focus (avoids surprise refetches in a
// multi-tab PM tool — realtime invalidation drives freshness instead).
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
