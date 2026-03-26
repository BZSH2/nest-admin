import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginLogsService } from '../login-logs/login-logs.service';
import { UsersService } from '../users/users.service';
import type { ChangePasswordDto } from './dto/change-password.dto';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

interface RequestMeta {
  ip?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly loginLogsService: LoginLogsService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findOneByPhoneNumber(registerDto.phoneNumber);
    if (existingUser) {
      throw new BadRequestException('该手机号已注册');
    }

    const newUser = await this.usersService.create({
      ...registerDto,
      status: true,
    });

    return newUser;
  }

  async login(loginDto: LoginDto, requestMeta?: RequestMeta) {
    const user = await this.usersService.findOneByPhoneNumber(loginDto.phoneNumber);

    if (!user || !user.password) {
      await this.recordLogin(
        user?.id ?? null,
        loginDto.phoneNumber,
        false,
        requestMeta,
        '手机号或密码错误',
      );
      throw new UnauthorizedException('手机号或密码错误');
    }

    if (user.status === false) {
      await this.recordLogin(user.id, loginDto.phoneNumber, false, requestMeta, '用户已被禁用');
      throw new UnauthorizedException('用户已被禁用');
    }

    if (!(await bcrypt.compare(loginDto.password, user.password))) {
      await this.recordLogin(user.id, loginDto.phoneNumber, false, requestMeta, '手机号或密码错误');
      throw new UnauthorizedException('手机号或密码错误');
    }

    const tokens = await this.getTokens(user.id, user.phoneNumber);

    await this.usersService.setCurrentRefreshToken(tokens.refreshToken, user.id);
    await this.usersService.updateLastLogin(user.id, requestMeta?.ip ?? null);
    await this.recordLogin(user.id, loginDto.phoneNumber, true, requestMeta);

    return tokens;
  }

  logout(userId: string) {
    return this.usersService.removeRefreshToken(userId);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.getUserIfRefreshTokenMatches(refreshToken, userId);
    if (!user) {
      throw new UnauthorizedException('Access Denied');
    }

    if (user.status === false) {
      throw new UnauthorizedException('用户已被禁用');
    }

    const tokens = await this.getTokens(user.id, user.phoneNumber);
    await this.usersService.setCurrentRefreshToken(tokens.refreshToken, user.id);
    return tokens;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    const userWithPassword = await this.usersService.findOneByPhoneNumber(user.phoneNumber);

    if (
      !userWithPassword ||
      !(await bcrypt.compare(changePasswordDto.oldPassword, userWithPassword.password))
    ) {
      throw new BadRequestException('旧密码错误');
    }

    await this.usersService.setPassword(userId, changePasswordDto.newPassword);

    return { message: '密码修改成功，请重新登录' };
  }

  async getProfile(user: { id: string; phoneNumber: string }) {
    const profile = await this.usersService.findOneById(user.id);
    if (!profile) {
      throw new UnauthorizedException('用户不存在');
    }
    return profile;
  }

  async getTokens(userId: string, phoneNumber: string) {
    const payload = { sub: userId, phoneNumber };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: (this.configService.get<string>('JWT_EXPIRATION_TIME') || '1h') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME') || '7d') as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async recordLogin(
    userId: string | null,
    phoneNumber: string,
    success: boolean,
    requestMeta?: RequestMeta,
    failureReason?: string,
  ) {
    await this.loginLogsService.createLog({
      userId,
      phoneNumber,
      success,
      ip: requestMeta?.ip ?? null,
      userAgent: requestMeta?.userAgent ?? null,
      failureReason: success ? null : (failureReason ?? null),
    });
  }
}
