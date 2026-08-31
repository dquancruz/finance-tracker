export type UserRole = 'user' | 'admin';

export interface IOAuthProvider {
  provider: 'google' | 'github';
  providerId: string;
}

export interface IUser {
  _id: string;
  email: string;
  passwordHash?: string;
  name: string;
  avatar?: string;
  oauthProviders: IOAuthProvider[];
  emailVerified?: boolean;
  role: UserRole;
  defaultCurrency: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface IUserPublic {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  defaultCurrency: string;
  timezone: string;
  createdAt: Date;
}
