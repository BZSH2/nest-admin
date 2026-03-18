import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { UserRole } from '../auth/enums/user-role.enum';
import { UsersService } from '../users/users.service';
import { RolesService } from './roles.service';

describe('RolesService', () => {
  let service: RolesService;
  const usersService = {
    findOneOrFail: jest.fn(),
    assignRole: jest.fn(),
  };
  const configService = new ConfigService({
    ADMIN_PHONE_NUMBERS: '13800138000',
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('returns available role options', () => {
    expect(service.getRoleOptions()).toEqual([
      { value: UserRole.ADMIN, label: '管理员' },
      { value: UserRole.USER, label: '普通用户' },
    ]);
  });

  it('returns user role detail', async () => {
    usersService.findOneOrFail.mockResolvedValue({
      id: 'user-1',
      phoneNumber: '13800138000',
      nickname: '管理员',
      avatar: null,
      role: null,
    });

    await expect(service.getUserRole('user-1')).resolves.toEqual({
      userId: 'user-1',
      phoneNumber: '13800138000',
      nickname: '管理员',
      avatar: null,
      role: UserRole.ADMIN,
    });
  });

  it('updates user role detail', async () => {
    usersService.assignRole.mockResolvedValue({
      id: 'user-2',
      phoneNumber: '13700137000',
      nickname: '普通用户',
      avatar: null,
      role: UserRole.ADMIN,
    });

    await expect(service.updateUserRole('user-2', { role: UserRole.ADMIN })).resolves.toEqual({
      userId: 'user-2',
      phoneNumber: '13700137000',
      nickname: '普通用户',
      avatar: null,
      role: UserRole.ADMIN,
    });
    expect(usersService.assignRole).toHaveBeenCalledWith('user-2', UserRole.ADMIN);
  });
});
