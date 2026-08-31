import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const getAllAndOverride = jest.fn();
  const reflector = {
    getAllAndOverride,
  } as unknown as Reflector;
  const guard = new RolesGuard(reflector);

  function buildContext(user?: {
    userId: string;
    email: string;
    role: 'user' | 'admin';
  }) {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows access when no roles are required', () => {
    getAllAndOverride.mockReturnValue(undefined);

    expect(
      guard.canActivate(
        buildContext({ userId: '1', email: 'a@b.com', role: 'user' }) as never,
      ),
    ).toBe(true);
  });

  it('allows admins when admin role is required', () => {
    getAllAndOverride.mockReturnValue(['admin']);

    expect(
      guard.canActivate(
        buildContext({ userId: '1', email: 'a@b.com', role: 'admin' }) as never,
      ),
    ).toBe(true);
  });

  it('rejects non-admin users for admin-only routes', () => {
    getAllAndOverride.mockReturnValue(['admin']);

    expect(() =>
      guard.canActivate(
        buildContext({ userId: '1', email: 'a@b.com', role: 'user' }) as never,
      ),
    ).toThrow(ForbiddenException);
  });
});
