'use client';

import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

function ClearCacheOnSignOut({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const previousStatus = useRef(status);

  useEffect(() => {
    if (
      previousStatus.current === 'authenticated' &&
      status === 'unauthenticated'
    ) {
      queryClient.clear();
    }
    previousStatus.current = status;
  }, [status, queryClient]);

  return children;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ClearCacheOnSignOut>{children}</ClearCacheOnSignOut>
      </QueryClientProvider>
    </SessionProvider>
  );
}
