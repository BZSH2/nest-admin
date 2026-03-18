import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiModule } from '../common/decorators/api-module.decorator';
import { Public } from '../common/decorators/public.decorator';
import { OperationMessageResponseDto } from '../common/dto/operation-message-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../common/guards/jwt-refresh.guard';
import { AuthService } from './auth.service';
import { AuthProfileResponseDto } from './dto/auth-profile-response.dto';
import { AuthTokensResponseDto } from './dto/auth-tokens-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type {
  AuthenticatedRequest,
  RefreshTokenRequest,
} from './interfaces/authenticated-request.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiModule('LoginModule')
  @ApiOperation({ summary: '用户注册' })
  @ApiCreatedResponse({ description: '注册成功', type: AuthProfileResponseDto })
  @ApiResponse({ status: 409, description: '手机号已存在' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @ApiModule('LoginModule')
  @ApiOperation({ summary: '用户登录' })
  @ApiOkResponse({ description: '登录成功，返回 Token', type: AuthTokensResponseDto })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiModule('LoginModule')
  @ApiOperation({ summary: '用户登出' })
  @ApiOkResponse({ description: '登出成功', type: OperationMessageResponseDto })
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: AuthenticatedRequest) {
    return this.authService.logout(req.user.id);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiBearerAuth()
  @ApiModule('LoginModule')
  @ApiOperation({ summary: '刷新 Token' })
  @ApiOkResponse({ description: '刷新成功', type: AuthTokensResponseDto })
  @HttpCode(HttpStatus.OK)
  refreshTokens(@Req() req: RefreshTokenRequest) {
    return this.authService.refreshTokens(req.user.sub, req.user.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiBearerAuth()
  @ApiModule('ProfileModule')
  @ApiOperation({ summary: '修改密码' })
  @ApiOkResponse({ description: '修改成功', type: OperationMessageResponseDto })
  @HttpCode(HttpStatus.OK)
  changePassword(@Req() req: AuthenticatedRequest, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiModule('ProfileModule')
  @ApiOperation({ summary: '获取个人信息' })
  @ApiOkResponse({ description: '获取成功', type: AuthProfileResponseDto })
  getProfile(@Req() req: AuthenticatedRequest) {
    return this.authService.getProfile(req.user);
  }
}
