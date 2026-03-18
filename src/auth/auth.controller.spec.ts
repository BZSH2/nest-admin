import { Test, type TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type {
  AuthenticatedRequest,
  RefreshTokenRequest,
} from './interfaces/authenticated-request.interface';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    refreshTokens: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('passes authenticated user id to logout', async () => {
    const req = {
      user: {
        id: 'user-1',
        phoneNumber: '13800138000',
        role: 'user' as const,
      },
    } as AuthenticatedRequest;

    await controller.logout(req);

    expect(authService.logout).toHaveBeenCalledWith('user-1');
  });

  it('passes refresh payload to refreshTokens', async () => {
    const req = {
      user: {
        sub: 'user-1',
        phoneNumber: '13800138000',
        refreshToken: 'refresh-token',
      },
    } as RefreshTokenRequest;

    await controller.refreshTokens(req);

    expect(authService.refreshTokens).toHaveBeenCalledWith('user-1', 'refresh-token');
  });

  it('passes authenticated user id to changePassword', async () => {
    const req = {
      user: {
        id: 'user-1',
        phoneNumber: '13800138000',
        role: 'user' as const,
      },
    } as AuthenticatedRequest;
    const dto = {
      oldPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
    };

    await controller.changePassword(req, dto);

    expect(authService.changePassword).toHaveBeenCalledWith('user-1', dto);
  });

  it('returns current profile from request', () => {
    const req = {
      user: {
        id: 'user-1',
        phoneNumber: '13800138000',
        nickname: '测试用户',
        role: 'user' as const,
      },
    } as AuthenticatedRequest;

    expect(controller.getProfile(req)).toEqual(req.user);
  });
});
