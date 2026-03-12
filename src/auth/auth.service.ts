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

  async register(registerDto: RegisterDto) {
    // 检查用户是否已存在
    const existingUser = await this.usersService.findOneByPhoneNumber(registerDto.phoneNumber);
    if (existingUser) {
      throw new BadRequestException('该手机号已注册');
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // 创建用户
    const newUser = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    // 移除敏感信息
    const { password, currentHashedRefreshToken, ...result } = newUser;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOneByPhoneNumber(loginDto.phoneNumber);

    // 用户不存在或密码错误
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    // 生成 Token
    const tokens = await this.getTokens(user.id, user.phoneNumber);

    // 更新 Refresh Token
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

    // 验证旧密码
    // 注意：findOneById 默认不查 password，我们需要在这里处理一下
    // 为了安全，UsersService.findOneById 默认最好不查密码
    // 这里我们用 findOneByPhoneNumber 重新查一次带密码的，或者修改 UsersService
    const userWithPassword = await this.usersService.findOneByPhoneNumber(user.phoneNumber);

    if (
      !userWithPassword ||
      !(await bcrypt.compare(changePasswordDto.oldPassword, userWithPassword.password))
    ) {
      throw new BadRequestException('旧密码错误');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // 更新密码
    await this.usersService.update(userId, {
      password: hashedPassword,
    });

    // 密码修改后，建议让 Refresh Token 失效，强制重新登录
    await this.usersService.removeRefreshToken(userId);

    return { message: '密码修改成功，请重新登录' };
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
}
