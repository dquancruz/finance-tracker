import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { IncomingMessage } from 'node:http';
import type { Server, Socket } from 'socket.io';
import { JWT_ALGORITHM, JWT_AUDIENCE, JWT_ISSUER } from '../auth/jwt.constants';
import { UsersService } from '../users/users.service';

interface JwtPayload {
  sub: string;
  email: string;
}

interface AuthenticatedSocketData {
  userId?: string;
}

const ANALYTICS_REFRESH_DEBOUNCE_MS = 500;

export function isSocketOriginAllowed(
  origin: string | undefined,
  configuredOrigins: string | undefined,
  isProduction: boolean,
): boolean {
  // Native/non-browser clients do not send Origin and still authenticate with
  // a signed bearer token.
  if (!origin) return true;

  const allowedOrigins = (configuredOrigins ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return allowedOrigins.length > 0
    ? allowedOrigins.includes(origin)
    : !isProduction;
}

/**
 * Decorator options run before Nest DI, so this reads the same process.env
 * values `ConfigService` exposes after `env.validation` has already run.
 */
export function isConfiguredSocketOriginAllowed(
  origin: string | undefined,
): boolean {
  return isSocketOriginAllowed(
    origin,
    process.env['CORS_ORIGIN'],
    process.env['NODE_ENV'] === 'production',
  );
}

/**
 * Socket.IO `cors.origin` only sets HTTP polling headers. Browsers skip CORS
 * on WebSocket upgrades, so origin policy must also run in `allowRequest`.
 */
export function allowSocketHandshake(
  req: Pick<IncomingMessage, 'headers'>,
  callback: (err: string | null, allowed: boolean) => void,
): void {
  callback(
    null,
    isConfiguredSocketOriginAllowed(readOriginHeader(req.headers)),
  );
}

function readOriginHeader(
  headers: IncomingMessage['headers'],
): string | undefined {
  const value: unknown = headers.origin;
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
}

/**
 * Real-time gateway — every authenticated socket joins a per-user room
 * (`user:{userId}`), so all emits are scoped to that user only.
 *
 * Auth on handshake: `socket.auth.token` (JWT Bearer), falling back to the
 * `Authorization` header for non-browser clients.
 *
 * Events: `expense:created`, `expense:updated`, `expense:deleted`,
 * `installment:paid`, `analytics:refresh` (debounced 500ms per user),
 * `budget:alert`, `recurring:due_soon`.
 */
@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      callback(null, isConfiguredSocketOriginAllowed(origin));
    },
  },
  allowRequest: allowSocketHandshake,
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private readonly analyticsRefreshTimers = new Map<
    string,
    ReturnType<typeof setTimeout>
  >();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = this.extractToken(client);
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret,
        algorithms: [JWT_ALGORITHM],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      });
      const user = await this.usersService.findById(payload.sub);
      if (!user || user.email !== payload.email) {
        throw new Error('Account is unavailable');
      }
      (client.data as AuthenticatedSocketData).userId = payload.sub;
      await client.join(this.roomFor(payload.sub));
    } catch {
      this.logger.warn(`Rejected unauthenticated socket ${client.id}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    // Room membership is cleaned up automatically by socket.io. Pending
    // debounced `analytics:refresh` timers are left to fire — they're
    // harmless no-ops if the user has no sockets left in their room.
    this.logger.debug(`Socket ${client.id} disconnected`);
  }

  private extractToken(client: Socket): string {
    const authToken = client.handshake.auth?.token as string | undefined;
    const headerToken = client.handshake.headers.authorization?.replace(
      /^Bearer\s+/i,
      '',
    );
    const token = authToken ?? headerToken;
    if (!token) throw new Error('Missing auth token');
    return token;
  }

  private roomFor(userId: string): string {
    return `user:${userId}`;
  }

  private emitToUser(userId: string, event: string, payload: unknown): void {
    this.server?.to(this.roomFor(userId)).emit(event, payload);
  }

  emitExpenseCreated(userId: string, expense: unknown): void {
    this.emitToUser(userId, 'expense:created', expense);
    this.scheduleAnalyticsRefresh(userId);
  }

  emitExpenseUpdated(userId: string, expense: unknown): void {
    this.emitToUser(userId, 'expense:updated', expense);
    this.scheduleAnalyticsRefresh(userId);
  }

  emitExpenseDeleted(userId: string, expenseId: string): void {
    this.emitToUser(userId, 'expense:deleted', { expenseId });
    this.scheduleAnalyticsRefresh(userId);
  }

  emitInstallmentPaid(userId: string, expense: unknown): void {
    this.emitToUser(userId, 'installment:paid', expense);
    this.scheduleAnalyticsRefresh(userId);
  }

  emitBudgetAlert(userId: string, payload: unknown): void {
    this.emitToUser(userId, 'budget:alert', payload);
  }

  emitRecurringDueSoon(userId: string, payload: unknown): void {
    this.emitToUser(userId, 'recurring:due_soon', payload);
  }

  /** Debounces `analytics:refresh` per user so a burst of writes results in one refresh. */
  private scheduleAnalyticsRefresh(userId: string): void {
    const existing = this.analyticsRefreshTimers.get(userId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      this.emitToUser(userId, 'analytics:refresh', {
        at: new Date().toISOString(),
      });
      this.analyticsRefreshTimers.delete(userId);
    }, ANALYTICS_REFRESH_DEBOUNCE_MS);

    this.analyticsRefreshTimers.set(userId, timer);
  }
}
