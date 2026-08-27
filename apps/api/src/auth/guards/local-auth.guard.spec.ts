import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';

describe('LocalAuthGuard', () => {
  const guard = new LocalAuthGuard();

  function contextWithBody(body: unknown): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ body }),
      }),
    } as unknown as ExecutionContext;
  }

  it('rejects a payload that fails LoginDto validation', async () => {
    await expect(
      guard.canActivate(
        contextWithBody({
          email: 'not-an-email',
          password: 'secret',
        }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects an oversized email before calling Passport', async () => {
    await expect(
      guard.canActivate(
        contextWithBody({
          email: `${'a'.repeat(250)}@example.com`,
          password: 'secret',
        }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a missing body', async () => {
    await expect(
      guard.canActivate(contextWithBody(undefined)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('defers to Passport when LoginDto is valid', async () => {
    const parent = Object.getPrototypeOf(LocalAuthGuard.prototype) as {
      canActivate: (context: ExecutionContext) => Promise<boolean>;
    };
    const canActivate = jest
      .spyOn(parent, 'canActivate')
      .mockResolvedValue(true);

    await expect(
      guard.canActivate(
        contextWithBody({
          email: 'person@example.com',
          password: 'secret',
        }),
      ),
    ).resolves.toBe(true);
    expect(canActivate).toHaveBeenCalled();
    canActivate.mockRestore();
  });
});
