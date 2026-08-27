import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { GoogleIdentityService } from './google-identity.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    loginWithGoogle: jest.Mock;
  };
  let googleIdentityService: { verify: jest.Mock };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      loginWithGoogle: jest.fn(),
    };
    googleIdentityService = { verify: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: GoogleIdentityService, useValue: googleIdentityService },
      ],
    }).compile();

    controller = module.get(AuthController);
  });

  it('delegates register to AuthService', async () => {
    const dto = {
      name: 'Person',
      email: 'person@example.com',
      password: 'password12',
    };
    authService.register.mockResolvedValue({ user: { id: 'user-1' } });

    await expect(controller.register(dto)).resolves.toEqual({
      user: { id: 'user-1' },
    });
    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('delegates login to AuthService with the authenticated user', () => {
    const req = {
      user: {
        _id: { toString: () => 'user-1' },
        email: 'person@example.com',
        name: 'Person',
      },
    };
    authService.login.mockReturnValue({ user: { id: 'user-1' } });

    expect(controller.login({} as LoginDto, req)).toEqual({
      user: { id: 'user-1' },
    });
    expect(authService.login).toHaveBeenCalledWith(req.user);
  });

  it('verifies the Google identity then logs in', async () => {
    const identity = {
      providerId: 'google-123',
      email: 'person@example.com',
      name: 'Person',
    };
    googleIdentityService.verify.mockResolvedValue(identity);
    authService.loginWithGoogle.mockResolvedValue({ user: { id: 'user-1' } });

    await expect(
      controller.googleLogin({ idToken: 'google-id-token' }),
    ).resolves.toEqual({ user: { id: 'user-1' } });
    expect(googleIdentityService.verify).toHaveBeenCalledWith(
      'google-id-token',
    );
    expect(authService.loginWithGoogle).toHaveBeenCalledWith(identity);
  });
});
