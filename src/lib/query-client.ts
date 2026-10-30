import { QueryClient } from '@tanstack/react-query';
import { socketClient } from './socket';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 15,
      gcTime: 1000 * 60 * 5,
      retry: (failureCount, error: any) => {
        const status = error?.response?.status;
        if (status === 401 || status === 404 || status === 409 || status === 422) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});

// Reconcile active queries on socket reconnect
socketClient.onReconnect(() => {
  console.log('[Socket.IO] Reconectado! Reconciliando dados com REST...');
  queryClient.invalidateQueries({ queryKey: ['nfts'] });
  queryClient.invalidateQueries({ queryKey: ['nft'] });
  queryClient.invalidateQueries({ queryKey: ['cart'] });
  queryClient.invalidateQueries({ queryKey: ['orders'] });
});
