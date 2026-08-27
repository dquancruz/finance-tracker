import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const body: unknown = context.switchToHttp().getRequest<{
      body?: unknown;
    }>().body;
    const dto = plainToInstance(LoginDto, body ?? {});
    const errors = await validate(dto);
    if (errors.length > 0) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return super.canActivate(context) as Promise<boolean>;
  }
}
