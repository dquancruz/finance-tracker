import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { JWT_VERIFY_OPTIONS } from '../jwt.constants';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const config = {
    get: jest.fn().mockReturnValue('a'.repeat(32)),
  } as unknown as ConfigService;
  const findById = jest.fn();
  const strategy = new JwtStrategy(config, {
    findById,
  } as unknown as UsersService);

  beforeEach(() => {
    findById.mockReset();
  });

  it('configures Passport JWT verification with issuer, audience, and HS256', () => {
    const verifyOptions = (
      strategy as unknown as {
        _verifOpts?: {
          algorithms?: string[];
          issuer?: string;
          audience?: string;
        };
      }
    )._verifOpts;

    expect(JWT_VERIFY_OPTIONS).toEqual({
      algorithms: ['HS256'],
      issuer: 'finance-tracker-api',
      audience: 'finance-tracker-web',
    });
    expect(verifyOptions).toEqual(
      expect.objectContaining({
        algorithms: ['HS256'],
        issuer: 'finance-tracker-api',
        audience: 'finance-tracker-web',
      }),
    );
  });

  it('accepts claims only for the current active account', async () => {
    findById.mockResolvedValue({ email: 'person@example.com', role: 'admin' });

    await expect(
      strategy.validate({ sub: 'user-1', email: 'person@example.com' }),
    ).resolves.toEqual({
      userId: 'user-1',
      email: 'person@example.com',
      role: 'admin',
    });
  });

  it('rejects deleted users and stale email claims', async () => {
    findById.mockResolvedValue(null);
    await expect(
      strategy.validate({ sub: 'deleted', email: 'person@example.com' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    findById.mockResolvedValue({ email: 'new@example.com' });
    await expect(
      strategy.validate({ sub: 'user-1', email: 'old@example.com' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
