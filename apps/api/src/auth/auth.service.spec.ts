import { ConflictException } from '@nestjs/common';
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
    role: 'user' as const,
  };

  let usersService: {
    findByEmail: jest.Mock;
    create: jest.Mock;
    findOrCreateGoogleUser: jest.Mock;
  };
  let jwtService: { sign: jest.Mock };
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
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

  it('returns null when the user does not exist', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.validateUser('missing@example.com', 'password'),
    ).resolves.toBeNull();
    expect(argon2.verify).not.toHaveBeenCalled();
  });

  it('returns null when the password does not match', async () => {
    usersService.findByEmail.mockResolvedValue(user);
    (argon2.verify as jest.Mock).mockResolvedValue(false);

    await expect(
      service.validateUser(user.email, 'wrong-password'),
    ).resolves.toBeNull();
  });

  it('returns null for OAuth-only users without a password hash', async () => {
    usersService.findByEmail.mockResolvedValue({
      ...user,
      passwordHash: undefined,
    });

    await expect(
      service.validateUser(user.email, 'password'),
    ).resolves.toBeNull();
    expect(argon2.verify).not.toHaveBeenCalled();
  });

  it('registers a password user as unverified', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockResolvedValue(user);
    (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');

    const result = await service.register({
      name: 'Person',
      email: ' PERSON@Example.com ',
      password: 'password12',
    });

    expect(usersService.create).toHaveBeenCalledWith({
      name: 'Person',
      email: 'person@example.com',
      passwordHash: 'hashed-password',
      emailVerified: false,
    });
    expect(result.user.accessToken).toBe('api-token');
  });

  it('rejects duplicate email registration', async () => {
    usersService.findByEmail.mockResolvedValue(user);

    await expect(
      service.register({
        name: 'Person',
        email: user.email,
        password: 'password12',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(usersService.create).not.toHaveBeenCalled();
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
      role: 'user',
    });
  });
});
