import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { JWT_ALGORITHM, JWT_AUDIENCE, JWT_ISSUER } from '../jwt.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET environment variable is not set');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      algorithms: [JWT_ALGORITHM],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || user.email !== payload.email) {
      throw new UnauthorizedException('Account is unavailable');
    }
    return { userId: payload.sub, email: payload.email };
  }
}
