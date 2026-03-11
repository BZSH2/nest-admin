import { ForbiddenException, Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET') || 'defaultRefreshSecret',
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    const authHeader = req.get('Authorization');
    if (!authHeader) throw new ForbiddenException('Refresh token malformed');
    const refreshToken = authHeader.replace('Bearer', '').trim();
    if (!refreshToken) throw new ForbiddenException('Refresh token malformed');
    return {
      ...payload,
      refreshToken,
    };
  }
}
