import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

describe('AuthService', () => {
  const user = {
    _id: { toString: () => 'user-1' },
    email: 'person@example.com',
    name: 'Person',
    avatar: undefined,
    passwordHash: 'password-hash',
  };

  let usersService: {
    findByEmail: jest.Mock;
    create: jest.Mock;
    findOrCreateGoogleUser: jest.Mock;
  };
  let jwtService: { sign: jest.Mock };
  let service: AuthService;

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findOrCreateGoogleUser: jest.fn(),
    };
    jwtService = { sign: jest.fn().mockReturnValue('api-token') };
    service = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
    );
  });

  it('normalizes credential email addresses before lookup', async () => {
    usersService.findByEmail.mockResolvedValue(user);
    (argon2.verify as jest.Mock).mockResolvedValue(true);

    await expect(
      service.validateUser(' PERSON@Example.com ', 'password'),
    ).resolves.toBe(user);
    expect(usersService.findByEmail).toHaveBeenCalledWith('person@example.com');
  });

  it('issues an API token for a verified Google identity', async () => {
    usersService.findOrCreateGoogleUser.mockResolvedValue(user);

    const result = await service.loginWithGoogle({
      providerId: 'google-123',
      email: user.email,
      name: user.name,
    });

    expect(result.user.accessToken).toBe('api-token');
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'user-1',
      email: user.email,
    });
  });
});
