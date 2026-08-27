import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { LocalStrategy } from './local.strategy';

describe('LocalStrategy', () => {
  const validateUser = jest.fn();
  const strategy = new LocalStrategy({
    validateUser,
  } as unknown as AuthService);

  beforeEach(() => {
    validateUser.mockReset();
  });

  it('rejects empty or oversized login fields before looking up the user', async () => {
    await expect(strategy.validate('', 'password')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await expect(
      strategy.validate('a'.repeat(255), 'password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(strategy.validate('a@b.com', '')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await expect(
      strategy.validate('a@b.com', 'x'.repeat(129)),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(validateUser).not.toHaveBeenCalled();
  });

  it('looks up credentials when email and password are within bounds', async () => {
    validateUser.mockResolvedValue({ email: 'a@b.com' });

    await expect(strategy.validate('a@b.com', 'password')).resolves.toEqual({
      email: 'a@b.com',
    });

    expect(validateUser).toHaveBeenCalledWith('a@b.com', 'password');
  });
});
