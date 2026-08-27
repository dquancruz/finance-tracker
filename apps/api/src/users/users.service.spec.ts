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
      findByIdAndUpdate: jest.Mock;
    };
    model.findOne = jest.fn();
    model.findByIdAndUpdate = jest.fn();

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

  it('rejects silent linking to a verified password account', async () => {
    const { service, model } = buildService();
    model.findOne
      .mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      })
      .mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({
          email: identity.email,
          passwordHash: 'password-hash',
          emailVerified: true,
        }),
      });

    await expect(
      service.findOrCreateGoogleUser(identity),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(model.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(model).not.toHaveBeenCalled();
  });

  it('rejects silent linking to a legacy password account without emailVerified', async () => {
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
    expect(model.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('recovers an unverified password squat by linking Google and unsetting the password', async () => {
    const { service, model } = buildService();
    const existing = {
      _id: 'user-1',
      email: identity.email,
      name: 'Squatter',
      passwordHash: 'password-hash',
      emailVerified: false,
      oauthProviders: [],
    };
    const claimed = {
      ...existing,
      emailVerified: true,
      passwordHash: undefined,
      oauthProviders: [{ provider: 'google', providerId: identity.providerId }],
    };
    model.findOne
      .mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      })
      .mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(existing),
      });
    model.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(claimed),
    });

    await expect(service.findOrCreateGoogleUser(identity)).resolves.toBe(
      claimed,
    );
    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
      existing._id,
      {
        $set: {
          emailVerified: true,
          oauthProviders: [
            { provider: 'google', providerId: identity.providerId },
          ],
          avatar: identity.avatar,
        },
        $unset: { passwordHash: 1 },
      },
      { new: true },
    );
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
      emailVerified: true,
      oauthProviders: [{ provider: 'google', providerId: identity.providerId }],
    });
    expect(savedDocument.save).toHaveBeenCalled();
  });
});
