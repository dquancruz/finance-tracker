import { ConfigService } from '@nestjs/config';
import {
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { GoogleIdentityService } from './google-identity.service';

describe('GoogleIdentityService', () => {
  function buildService(clientId: string | undefined = 'google-client-id') {
    const config = {
      get: jest.fn().mockReturnValue(clientId),
    } as unknown as ConfigService;
    const service = new GoogleIdentityService(config);
    const verifyIdToken = jest.fn();
    (
      service as unknown as {
        client: { verifyIdToken: typeof verifyIdToken };
      }
    ).client = { verifyIdToken };
    return { service, verifyIdToken };
  }

  it('returns a normalized verified identity', async () => {
    const { service, verifyIdToken } = buildService();
    verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'google-123',
        email: 'PERSON@Example.com',
        email_verified: true,
        name: 'Person',
        picture: 'https://example.com/avatar.png',
      }),
    });

    await expect(service.verify('id-token')).resolves.toEqual({
      providerId: 'google-123',
      email: 'person@example.com',
      name: 'Person',
      avatar: 'https://example.com/avatar.png',
    });
    expect(verifyIdToken).toHaveBeenCalledWith({
      idToken: 'id-token',
      audience: 'google-client-id',
    });
  });

  it('rejects unverified Google email addresses', async () => {
    const { service, verifyIdToken } = buildService();
    verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'google-123',
        email: 'person@example.com',
        email_verified: false,
      }),
    });

    await expect(service.verify('id-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects invalid identity tokens', async () => {
    const { service, verifyIdToken } = buildService();
    verifyIdToken.mockRejectedValue(new Error('invalid signature'));

    await expect(service.verify('bad-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('fails clearly when Google login is not configured', async () => {
    const { service } = buildService('');

    await expect(service.verify('id-token')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
