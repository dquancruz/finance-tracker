import { io, type Socket } from 'socket.io-client';

/**
 * Single shared socket.io connection for the whole app. Auth uses the
 * NextAuth access token on the handshake (`socket.auth.token`), matching
 * the API gateway's expected shape (`apps/api/src/realtime/realtime.gateway.ts`).
 */
let socket: Socket | null = null;

export function getSocket(token: string): Socket {
  if (socket?.connected && socket.auth && (socket.auth as { token?: string }).token === token) {
    return socket;
  }
  if (socket) {
    socket.disconnect();
  }

  const baseUrl = process.env.NEXT_PUBLIC_WS_URL ?? '';
  socket = io(baseUrl, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
  });
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
