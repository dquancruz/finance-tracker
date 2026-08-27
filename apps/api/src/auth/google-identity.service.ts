import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

export interface VerifiedGoogleIdentity {
  providerId: string;
  email: string;
  name: string;
  avatar?: string;
}

@Injectable()
export class GoogleIdentityService {
  private readonly client = new OAuth2Client();

  constructor(private readonly config: ConfigService) {}

  async verify(idToken: string): Promise<VerifiedGoogleIdentity> {
    const audience = this.config.get<string>('GOOGLE_CLIENT_ID');
    if (!audience) {
      throw new ServiceUnavailableException('Google sign-in is not configured');
    }

    try {
      const ticket = await this.client.verifyIdToken({ idToken, audience });
      const payload = ticket.getPayload();

      if (!payload?.sub || !payload.email || payload.email_verified !== true) {
        throw new UnauthorizedException('Google account is not verified');
      }

      return {
        providerId: payload.sub,
        email: payload.email.toLowerCase(),
        name: payload.name?.trim() || payload.email.split('@')[0],
        avatar: payload.picture,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid Google identity token');
    }
  }
}
