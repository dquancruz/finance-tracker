import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

export interface CreateUserInput {
  email: string;
  passwordHash?: string;
  name: string;
  avatar?: string;
  emailVerified?: boolean;
  oauthProviders?: Array<{
    provider: 'google' | 'github';
    providerId: string;
  }>;
}

export interface UpdateUserInput {
  name?: string;
  avatar?: string;
  defaultCurrency?: string;
  timezone?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email, deletedAt: { $exists: false } })
      .exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ _id: id, deletedAt: { $exists: false } })
      .exec();
  }

  /** All non-deleted users — used by scheduled jobs that fan out per user. */
  async findAllActive(): Promise<UserDocument[]> {
    return this.userModel.find({ deletedAt: { $exists: false } }).exec();
  }

  async create(dto: CreateUserInput): Promise<UserDocument> {
    const user = new this.userModel(dto);
    return user.save();
  }

  async findOrCreateGoogleUser(input: {
    providerId: string;
    email: string;
    name: string;
    avatar?: string;
  }): Promise<UserDocument> {
    const email = input.email.toLowerCase().trim();
    const byProvider = await this.userModel
      .findOne({
        oauthProviders: {
          $elemMatch: {
            provider: 'google',
            providerId: input.providerId,
          },
        },
        deletedAt: { $exists: false },
      })
      .exec();
    if (byProvider) return byProvider;

    const existing = await this.findByEmail(email);
    if (existing) {
      return this.claimUnverifiedAccountWithGoogle(existing, input);
    }

    return this.create({
      email,
      name: input.name,
      avatar: input.avatar,
      emailVerified: true,
      oauthProviders: [{ provider: 'google', providerId: input.providerId }],
    });
  }

  /**
   * Google has already verified the address. Recover an unverified password
   * squat (`emailVerified === false` only): attach Google and `$unset` the
   * password so the attacker cannot keep access.
   *
   * Legacy password accounts (field missing) and verified accounts still
   * require an explicit in-app link — do not steal those.
   */
  private async claimUnverifiedAccountWithGoogle(
    existing: UserDocument,
    input: {
      providerId: string;
      name: string;
      avatar?: string;
    },
  ): Promise<UserDocument> {
    const alreadyLinked = existing.oauthProviders?.some(
      (provider) => provider.provider === 'google',
    );

    if (existing.emailVerified !== false || alreadyLinked) {
      throw new ConflictException(
        'An account with this email already exists. Sign in with your password before linking Google.',
      );
    }

    const $set: {
      emailVerified: boolean;
      oauthProviders: UserDocument['oauthProviders'];
      avatar?: string;
      name?: string;
    } = {
      emailVerified: true,
      oauthProviders: [
        ...(existing.oauthProviders ?? []),
        { provider: 'google', providerId: input.providerId },
      ],
    };
    if (input.avatar && !existing.avatar) $set.avatar = input.avatar;
    if (!existing.name) $set.name = input.name;

    const claimed = await this.userModel
      .findByIdAndUpdate(
        existing._id,
        { $set, $unset: { passwordHash: 1 } },
        { new: true },
      )
      .exec();

    if (!claimed) {
      throw new ConflictException(
        'An account with this email already exists. Sign in with your password before linking Google.',
      );
    }

    return claimed;
  }

  async updateById(
    id: string,
    dto: UpdateUserInput,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .exec();
  }

  async softDelete(id: string): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }, { new: true })
      .exec();
  }
}
