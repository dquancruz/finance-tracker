import type { UserRole } from '@finance-tracker/shared';
import {
  ConflictException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

export interface CreateUserInput {
  email: string;
  passwordHash?: string;
  name: string;
  avatar?: string;
  emailVerified?: boolean;
  role?: UserRole;
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
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.bootstrapAdminFromEnv();
  }

  /**
   * Idempotently ensures the configured admin account exists. When
   * `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set, creates the user on first
   * boot or promotes an existing account to `admin`.
   */
  async bootstrapAdminFromEnv(): Promise<void> {
    const email = this.config.get<string>('ADMIN_EMAIL')?.toLowerCase().trim();
    const password = this.config.get<string>('ADMIN_PASSWORD');
    if (!email || !password) return;

    const name = this.config.get<string>('ADMIN_NAME')?.trim() || 'Admin';
    const existing = await this.findByEmail(email);

    if (!existing) {
      const passwordHash = await argon2.hash(password);
      await this.create({
        email,
        name,
        passwordHash,
        emailVerified: true,
        role: 'admin',
      });
      this.logger.log(`Created admin user for ${email}`);
      return;
    }

    const updates: {
      role: UserRole;
      emailVerified: boolean;
      passwordHash?: string;
    } = {
      role: 'admin',
      emailVerified: true,
    };
    if (!existing.passwordHash) {
      updates.passwordHash = await argon2.hash(password);
    }

    if (existing.role === 'admin' && existing.passwordHash) {
      return;
    }

    await this.userModel
      .findByIdAndUpdate(existing._id, { $set: updates })
      .exec();

    if (existing.role !== 'admin') {
      this.logger.log(`Promoted existing user ${email} to admin`);
    } else if (!existing.passwordHash) {
      this.logger.log(`Set password for admin user ${email}`);
    }
  }

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
