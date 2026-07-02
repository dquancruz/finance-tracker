'use client';

import { useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import type { Socket } from 'socket.io-client';
import { disconnectSocket, getSocket } from '../socket';

/** Provides the shared socket.io connection, connecting/reconnecting as the session's access token changes. */
export function useSocket(): Socket | null {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const socket = useMemo(() => (token ? getSocket(token) : null), [token]);

  useEffect(() => {
    if (!token) disconnectSocket();
  }, [token]);

  return socket;
}
