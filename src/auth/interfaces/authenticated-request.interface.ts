import type { Request } from 'express';
import type { SafeUser } from '../../users/users.service';
import type { UserRole } from '../enums/user-role.enum';

export type AuthenticatedUser = SafeUser & {
  role: UserRole;
};

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

export interface RefreshTokenPayload {
  sub: string;
  phoneNumber: string;
  refreshToken: string;
}

export interface RefreshTokenRequest extends Request {
  user: RefreshTokenPayload;
}
