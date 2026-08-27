import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { isSocketOriginAllowed, RealtimeGateway } from './realtime.gateway';

function buildSocket(overrides: Record<string, unknown> = {}) {
  return {
    id: 'socket-1',
    data: {},
    handshake: { auth: {}, headers: {} },
    join: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn(),
    ...overrides,
  };
}

describe('RealtimeGateway', () => {
  let gateway: RealtimeGateway;
  let jwtService: { verify: jest.Mock };
  let emitMock: jest.Mock;
  let toMock: jest.Mock;

  beforeEach(async () => {
    jwtService = { verify: jest.fn() };
    emitMock = jest.fn();
    toMock = jest.fn().mockReturnValue({ emit: emitMock });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RealtimeGateway,
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('secret') },
        },
      ],
    }).compile();

    gateway = module.get<RealtimeGateway>(RealtimeGateway);
    // @ts-expect-error server is normally injected by @WebSocketServer()
    gateway.server = { to: toMock };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('handleConnection', () => {
    it('joins the per-user room when the JWT is valid', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1', email: 'a@b.com' });
      const socket = buildSocket({
        handshake: { auth: { token: 'valid-token' }, headers: {} },
      });

      await gateway.handleConnection(socket as never);

      expect(socket.join).toHaveBeenCalledWith('user:user-1');
      expect(socket.disconnect).not.toHaveBeenCalled();
    });

    it('falls back to the Authorization header when auth.token is absent', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-2', email: 'a@b.com' });
      const socket = buildSocket({
        handshake: {
          auth: {},
          headers: { authorization: 'Bearer header-token' },
        },
      });

      await gateway.handleConnection(socket as never);

      expect(socket.join).toHaveBeenCalledWith('user:user-2');
    });

    it('disconnects the socket when no token is present', async () => {
      const socket = buildSocket();

      await gateway.handleConnection(socket as never);

      expect(socket.disconnect).toHaveBeenCalledWith(true);
      expect(socket.join).not.toHaveBeenCalled();
    });

    it('disconnects the socket when the token is invalid', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });
      const socket = buildSocket({
        handshake: { auth: { token: 'bad-token' }, headers: {} },
      });

      await gateway.handleConnection(socket as never);

      expect(socket.disconnect).toHaveBeenCalledWith(true);
    });
  });

  describe('emit helpers', () => {
    it('scopes expense:created to the user room and debounces analytics:refresh', () => {
      jest.useFakeTimers();

      gateway.emitExpenseCreated('user-1', { _id: 'exp-1' });

      expect(toMock).toHaveBeenCalledWith('user:user-1');
      expect(emitMock).toHaveBeenCalledWith('expense:created', {
        _id: 'exp-1',
      });

      jest.advanceTimersByTime(500);

      const refreshCall = emitMock.mock.calls.find(
        ([event]) => event === 'analytics:refresh',
      ) as [string, { at: string }] | undefined;
      expect(refreshCall).toBeDefined();
      expect(typeof refreshCall?.[1].at).toBe('string');
    });

    it('collapses multiple rapid mutations into a single analytics:refresh', () => {
      jest.useFakeTimers();

      gateway.emitExpenseCreated('user-1', { _id: 'exp-1' });
      gateway.emitExpenseUpdated('user-1', { _id: 'exp-1' });
      gateway.emitExpenseDeleted('user-1', 'exp-1');

      jest.advanceTimersByTime(500);

      const refreshCalls = emitMock.mock.calls.filter(
        ([event]) => event === 'analytics:refresh',
      );
      expect(refreshCalls).toHaveLength(1);
    });

    it('emits budget:alert without scheduling an analytics refresh', () => {
      jest.useFakeTimers();

      gateway.emitBudgetAlert('user-1', { title: 'Over budget' });

      expect(emitMock).toHaveBeenCalledWith('budget:alert', {
        title: 'Over budget',
      });

      jest.advanceTimersByTime(500);

      const refreshCalls = emitMock.mock.calls.filter(
        ([event]) => event === 'analytics:refresh',
      );
      expect(refreshCalls).toHaveLength(0);
    });

    it('emits recurring:due_soon scoped to the user room', () => {
      gateway.emitRecurringDueSoon('user-1', { expenseId: 'exp-1' });

      expect(toMock).toHaveBeenCalledWith('user:user-1');
      expect(emitMock).toHaveBeenCalledWith('recurring:due_soon', {
        expenseId: 'exp-1',
      });
    });
  });
});

describe('isSocketOriginAllowed', () => {
  it('allows only configured browser origins in production', () => {
    const configured = 'https://app.example.com, https://admin.example.com';

    expect(
      isSocketOriginAllowed('https://app.example.com', configured, true),
    ).toBe(true);
    expect(
      isSocketOriginAllowed('https://attacker.example', configured, true),
    ).toBe(false);
  });

  it('fails closed for browser origins when production has no allowlist', () => {
    expect(
      isSocketOriginAllowed('https://app.example.com', undefined, true),
    ).toBe(false);
  });

  it('allows origin-less clients and development origins', () => {
    expect(isSocketOriginAllowed(undefined, undefined, true)).toBe(true);
    expect(
      isSocketOriginAllowed('http://localhost:3000', undefined, false),
    ).toBe(true);
  });
});
