import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export type UserRole = 'user' | 'admin';

@Schema({ _id: false })
class OAuthProvider {
  @Prop({ required: true, enum: ['google', 'github'] })
  provider: 'google' | 'github';

  @Prop({ required: true })
  providerId: string;
}

const OAuthProviderSchema = SchemaFactory.createForClass(OAuthProvider);

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop()
  passwordHash?: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop()
  avatar?: string;

  @Prop({ type: [OAuthProviderSchema], default: [] })
  oauthProviders: OAuthProvider[];

  /**
   * Password registration does not prove email ownership. Google ID tokens
   * do (`email_verified`). New password signups set this to `false` so a
   * later verified Google sign-in can recover the squat. Legacy documents
   * without the field are treated as already claimed (not recoverable).
   */
  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({
    type: String,
    required: true,
    enum: ['user', 'admin'],
    default: 'user',
  })
  role: UserRole;

  @Prop({ default: 'USD' })
  defaultCurrency: string;

  @Prop({ default: 'UTC' })
  timezone: string;

  @Prop()
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
