import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { UserRole } from '@finance-tracker/shared';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import type { VerifiedGoogleIdentity } from './google-identity.service';

interface AuthenticatableUser {
  _id: { toString(): string };
  email: string;
  name: string;
  avatar?: string;
  role?: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(
      email.toLowerCase().trim(),
    );
    if (!user || !user.passwordHash) return null;
    const valid = await argon2.verify(user.passwordHash, password);
    return valid ? user : null;
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new ConflictException('Email already registered');
    const passwordHash = await argon2.hash(dto.password);
    const user = await this.usersService.create({
      name: dto.name,
      email,
      passwordHash,
      emailVerified: false,
    });
    return this.buildAuthResponse(user);
  }

  login(user: AuthenticatableUser) {
    return this.buildAuthResponse(user);
  }

  async loginWithGoogle(identity: VerifiedGoogleIdentity) {
    const user = await this.usersService.findOrCreateGoogleUser(identity);
    return this.buildAuthResponse(user);
  }

  // Shaped as `{ user: { ...accessToken } }` to match what the web app's
  // NextAuth Credentials authorize() callback expects — it reads
  // `data.user` off the response body (see apps/web/src/lib/auth.ts).
  private buildAuthResponse(user: AuthenticatableUser) {
    const role = user.role ?? 'user';
    const accessToken = this.jwtService.sign({
      sub: user._id.toString(),
      email: user.email,
      role,
    });
    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role,
        accessToken,
      },
    };
  }
}
