import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import { LoginLogsService } from '../login-logs/login-logs.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { UserRole } from './enums/user-role.enum';

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    create: jest.fn(),
    findOneByPhoneNumber: jest.fn(),
    setCurrentRefreshToken: jest.fn(),
    removeRefreshToken: jest.fn(),
    getUserIfRefreshTokenMatches: jest.fn(),
    findOneById: jest.fn(),
    update: jest.fn(),
    updateLastLogin: jest.fn(),
    setPassword: jest.fn(),
  };
  const loginLogsService = {
    createLog: jest.fn(),
  };
  const jwtService = {
    signAsync: jest.fn(),
  };
  const configService = new ConfigService({
    JWT_SECRET: 'test-secret',
    JWT_REFRESH_SECRET: 'test-refresh-secret',
    JWT_EXPIRATION_TIME: '1h',
    JWT_REFRESH_EXPIRATION_TIME: '7d',
    ADMIN_PHONE_NUMBERS: '13800138000',
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: LoginLogsService,
          useValue: loginLogsService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('returns auth profile on register', async () => {
    usersService.findOneByPhoneNumber.mockResolvedValue(null);
    usersService.create.mockResolvedValue({
      id: 'user-1',
      phoneNumber: '13800138000',
      nickname: '管理员',
      avatar: null,
      role: UserRole.ADMIN,
      status: true,
      createdAt: new Date('2026-03-18T04:00:00.000Z'),
      updatedAt: new Date('2026-03-18T04:00:00.000Z'),
    });

    await expect(
      service.register({
        phoneNumber: '13800138000',
        password: 'Password123!',
        nickname: '管理员',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'user-1',
        phoneNumber: '13800138000',
        role: UserRole.ADMIN,
      }),
    );
  });

  it('delegates logout to users service', async () => {
    usersService.removeRefreshToken.mockResolvedValue(undefined);

    await expect(service.logout('user-1')).resolves.toBeUndefined();
    expect(usersService.removeRefreshToken).toHaveBeenCalledWith('user-1');
  });

  it('returns current profile with existing role', async () => {
    usersService.findOneById.mockResolvedValue({
      id: 'user-1',
      phoneNumber: '13700137000',
      nickname: '普通用户',
      avatar: null,
      role: UserRole.USER,
      status: true,
    });

    await expect(
      service.getProfile({
        id: 'user-1',
        phoneNumber: '13700137000',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'user-1',
        phoneNumber: '13700137000',
        role: UserRole.USER,
      }),
    );
  });
});
