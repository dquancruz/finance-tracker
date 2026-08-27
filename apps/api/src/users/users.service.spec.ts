import { ConflictException } from '@nestjs/common';
import type { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
import { UsersService } from './users.service';

describe('UsersService Google identities', () => {
  const identity = {
    providerId: 'google-123',
    email: 'person@example.com',
    name: 'Person',
    avatar: 'https://example.com/avatar.png',
  };

  function buildService() {
    const savedDocument = {
      save: jest.fn(),
    };
    savedDocument.save.mockResolvedValue(savedDocument);

    const model = jest.fn(() => savedDocument) as unknown as jest.Mock & {
      findOne: jest.Mock;
    };
    model.findOne = jest.fn();

    return {
      service: new UsersService(model as unknown as Model<UserDocument>),
      model,
      savedDocument,
    };
  }

  it('finds an existing OAuth user by stable Google provider id', async () => {
    const { service, model } = buildService();
    const existingGoogleUser = { _id: 'user-1' };
    model.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(existingGoogleUser),
    });

    await expect(service.findOrCreateGoogleUser(identity)).resolves.toBe(
      existingGoogleUser,
    );
    expect(model.findOne).toHaveBeenCalledWith({
      oauthProviders: {
        $elemMatch: {
          provider: 'google',
          providerId: identity.providerId,
        },
      },
      deletedAt: { $exists: false },
    });
  });

  it('rejects silent linking to an existing password account by email', async () => {
    const { service, model } = buildService();
    model.findOne
      .mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      })
      .mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({
          email: identity.email,
          passwordHash: 'password-hash',
        }),
      });

    await expect(
      service.findOrCreateGoogleUser(identity),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(model).not.toHaveBeenCalled();
  });

  it('creates an OAuth-only user when provider and email are both new', async () => {
    const { service, model, savedDocument } = buildService();
    model.findOne
      .mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      })
      .mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

    await expect(service.findOrCreateGoogleUser(identity)).resolves.toBe(
      savedDocument,
    );
    expect(model).toHaveBeenCalledWith({
      email: identity.email,
      name: identity.name,
      avatar: identity.avatar,
      oauthProviders: [{ provider: 'google', providerId: identity.providerId }],
    });
    expect(savedDocument.save).toHaveBeenCalled();
  });
});
