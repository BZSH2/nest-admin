import type { Request } from 'express';
import type { SafeUser } from '../../users/users.service';

export interface AuthenticatedRequest extends Request {
  user: SafeUser;
}

export interface RefreshTokenPayload {
  sub: string;
  phoneNumber: string;
  refreshToken: string;
}

export interface RefreshTokenRequest extends Request {
  user: RefreshTokenPayload;
}
