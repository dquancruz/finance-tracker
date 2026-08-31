import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UserRole } from '@finance-tracker/shared';

export interface JwtUser {
  userId: string;
  email: string;
  role: UserRole;
}

interface RequestWithUser {
  user: JwtUser;
}

/** Extracts the authenticated user (populated by JwtStrategy) from the request. */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return data ? request.user[data] : request.user;
  },
);
