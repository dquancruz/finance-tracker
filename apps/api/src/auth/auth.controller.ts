import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleIdentityService } from './google-identity.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

interface AuthenticatedRequest {
  user: {
    _id: { toString(): string };
    email: string;
    name: string;
    avatar?: string;
  };
}

// Auth endpoints are prime brute-force/credential-stuffing/signup-spam
// targets, so they get a much tighter limit than the app-wide default
// (see AppModule's ThrottlerModule config) — 5 attempts per minute per
// client, tracked by IP.
const AUTH_THROTTLE = { default: { limit: 5, ttl: 60000 } };

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleIdentityService: GoogleIdentityService,
  ) {}

  @Throttle(AUTH_THROTTLE)
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Throttle(AUTH_THROTTLE)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Body() _dto: LoginDto, @Request() req: AuthenticatedRequest) {
    return this.authService.login(req.user);
  }

  @Throttle(AUTH_THROTTLE)
  @Post('google')
  async googleLogin(@Body() dto: GoogleLoginDto) {
    const identity = await this.googleIdentityService.verify(dto.idToken);
    return this.authService.loginWithGoogle(identity);
  }
}
