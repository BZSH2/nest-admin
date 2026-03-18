import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import type { ChangePasswordDto } from './dto/change-password.dto';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  register(registerDto: RegisterDto) {
    return this.usersService.create(registerDto);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOneByPhoneNumber(loginDto.phoneNumber);

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    const tokens = await this.getTokens(user.id, user.phoneNumber);
    await this.usersService.setCurrentRefreshToken(tokens.refreshToken, user.id);

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

    await this.usersService.update(userId, {
      password: changePasswordDto.newPassword,
    });

    await this.usersService.removeRefreshToken(userId);

    return { message: '密码修改成功，请重新登录' };
  }

  async getTokens(userId: string, phoneNumber: string) {
    const payload = { sub: userId, phoneNumber };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: (this.configService.get<string>('JWT_EXPIRATION_TIME') || '1h') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME') || '7d') as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
