import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

export interface CreateUserInput {
  email: string;
  passwordHash?: string;
  name: string;
  avatar?: string;
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
    const existing = await this.findByEmail(email);

    if (existing) {
      const alreadyLinked = existing.oauthProviders.some(
        (provider) =>
          provider.provider === 'google' &&
          provider.providerId === input.providerId,
      );
      if (!alreadyLinked) {
        existing.oauthProviders.push({
          provider: 'google',
          providerId: input.providerId,
        });
      }
      if (!existing.avatar && input.avatar) existing.avatar = input.avatar;
      return existing.save();
    }

    return this.create({
      email,
      name: input.name,
      avatar: input.avatar,
      oauthProviders: [{ provider: 'google', providerId: input.providerId }],
    });
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
