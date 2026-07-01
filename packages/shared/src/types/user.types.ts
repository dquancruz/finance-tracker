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
  defaultCurrency: string;
  timezone: string;
  createdAt: Date;
}
