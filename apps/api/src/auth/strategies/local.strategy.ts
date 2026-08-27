import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      email.length === 0 ||
      email.length > 254 ||
      password.length === 0 ||
      password.length > 128
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const user = await this.authService.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return user;
  }
}
