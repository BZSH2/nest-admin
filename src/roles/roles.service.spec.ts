import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRole } from '../auth/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Role } from './entities/role.entity';
import { UserRoleAssignment } from './entities/user-role.entity';
import { RolesService } from './roles.service';

type MockRepository = {
  create: jest.Mock;
  find: jest.Mock;
  findOne: jest.Mock;
  findAndCount: jest.Mock;
  save: jest.Mock;
  softDelete: jest.Mock;
  count: jest.Mock;
  delete: jest.Mock;
  update: jest.Mock;
};

describe('RolesService', () => {
  let service: RolesService;
  let rolesRepository: MockRepository;
  let userRolesRepository: MockRepository;
  let usersRepository: MockRepository;
  const usersService = {
    findOneOrFail: jest.fn(),
    assignRole: jest.fn(),
  };
  const configService = new ConfigService({
    ADMIN_PHONE_NUMBERS: '13800138000',
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    rolesRepository = {
      create: jest.fn((input) => input),
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      save: jest.fn(async (input) => input),
      softDelete: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    };

    userRolesRepository = {
      create: jest.fn((input) => input),
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      save: jest.fn(async (input) => input),
      softDelete: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    };

    usersRepository = {
      create: jest.fn((input) => input),
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      save: jest.fn(async (input) => input),
      softDelete: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    };

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
        {
          provide: getRepositoryToken(Role),
          useValue: rolesRepository,
        },
        {
          provide: getRepositoryToken(UserRoleAssignment),
          useValue: userRolesRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('returns role list with member counts', async () => {
    rolesRepository.findAndCount.mockResolvedValue([
      [
        {
          id: 'role-1',
          code: 'admin',
          name: '管理员',
          description: '系统角色',
          sort: 1,
          enabled: true,
          isSystem: true,
          isDefault: false,
          createdAt: new Date('2026-03-01T00:00:00.000Z'),
          updatedAt: new Date('2026-03-01T00:00:00.000Z'),
        },
      ],
      1,
    ]);
    userRolesRepository.count.mockResolvedValue(3);

    await expect(service.findAll({ page: 1, pageSize: 10 })).resolves.toEqual({
      items: [
        expect.objectContaining({
          id: 'role-1',
          code: 'admin',
          memberCount: 3,
        }),
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    });
  });

  it('creates role successfully', async () => {
    rolesRepository.findOne.mockResolvedValue(null);
    rolesRepository.save.mockResolvedValue({
      id: 'role-2',
      code: 'content_admin',
      name: '内容管理员',
      description: '负责内容管理',
      sort: 10,
      enabled: true,
      isSystem: false,
      isDefault: false,
      createdAt: new Date('2026-03-01T00:00:00.000Z'),
      updatedAt: new Date('2026-03-01T00:00:00.000Z'),
    });
    userRolesRepository.count.mockResolvedValue(0);

    await expect(
      service.createRole({
        code: 'content_admin',
        name: '内容管理员',
        description: '负责内容管理',
        sort: 10,
        enabled: true,
        isDefault: false,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'role-2',
        code: 'content_admin',
        name: '内容管理员',
      }),
    );
  });

  it('throws when creating duplicate role code', async () => {
    rolesRepository.findOne.mockResolvedValue({ id: 'role-1', code: 'admin' });

    await expect(
      service.createRole({
        code: 'admin',
        name: '管理员',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns available role options from built-in assignable roles', async () => {
    rolesRepository.find.mockResolvedValue([
      {
        code: UserRole.ADMIN,
        name: '管理员',
        sort: 1,
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
      },
      {
        code: UserRole.USER,
        name: '普通用户',
        sort: 2,
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
      },
    ]);

    await expect(service.getRoleOptions()).resolves.toEqual([
      { value: UserRole.ADMIN, label: '管理员' },
      { value: UserRole.USER, label: '普通用户' },
    ]);
  });

  it('lists users by role', async () => {
    rolesRepository.findOne.mockResolvedValue({ id: 'role-1', code: 'admin' });
    userRolesRepository.find.mockResolvedValue([
      {
        user: {
          id: 'user-1',
          phoneNumber: '13800138000',
          nickname: '管理员',
          avatar: null,
        },
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
      },
    ]);

    await expect(service.findUsersByRole('role-1', { page: 1, pageSize: 10 })).resolves.toEqual({
      items: [
        expect.objectContaining({
          userId: 'user-1',
          phoneNumber: '13800138000',
        }),
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    });
  });

  it('prevents self demotion when updating user role', async () => {
    usersService.findOneOrFail.mockResolvedValue({
      id: 'user-1',
      phoneNumber: '13800138000',
      nickname: '管理员',
      avatar: null,
      role: UserRole.ADMIN,
    });
    userRolesRepository.findOne.mockResolvedValue(null);

    await expect(
      service.updateUserRole('user-1', { role: UserRole.USER }, 'user-1'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('prevents removing the last admin role member', async () => {
    rolesRepository.findOne
      .mockResolvedValueOnce({ id: 'role-admin', code: UserRole.ADMIN })
      .mockResolvedValueOnce({ id: 'role-admin', code: UserRole.ADMIN });
    usersService.findOneOrFail.mockResolvedValue({
      id: 'user-2',
      phoneNumber: '13700137000',
      nickname: '管理员2',
      avatar: null,
      role: UserRole.ADMIN,
    });
    userRolesRepository.findOne.mockResolvedValue({
      userId: 'user-2',
      role: { code: UserRole.ADMIN },
    });
    userRolesRepository.count.mockResolvedValue(1);

    await expect(
      service.removeUserFromRole('role-admin', 'user-2', 'actor-1'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns user role detail from user-role assignment first', async () => {
    usersService.findOneOrFail.mockResolvedValue({
      id: 'user-1',
      phoneNumber: '13800138000',
      nickname: '管理员',
      avatar: null,
      role: null,
    });
    userRolesRepository.findOne.mockResolvedValue({
      userId: 'user-1',
      role: {
        code: UserRole.USER,
      },
    });

    await expect(service.getUserRole('user-1')).resolves.toEqual({
      userId: 'user-1',
      phoneNumber: '13800138000',
      nickname: '管理员',
      avatar: null,
      role: UserRole.USER,
    });
  });

  it('updates user role detail', async () => {
    usersService.findOneOrFail.mockResolvedValue({
      id: 'user-2',
      phoneNumber: '13700137000',
      nickname: '普通用户',
      avatar: null,
      role: UserRole.USER,
    });
    usersService.assignRole.mockResolvedValue({
      id: 'user-2',
      phoneNumber: '13700137000',
      nickname: '普通用户',
      avatar: null,
      role: UserRole.ADMIN,
    });
    userRolesRepository.findOne.mockResolvedValue(null);

    await expect(
      service.updateUserRole('user-2', { role: UserRole.ADMIN }, 'actor-1'),
    ).resolves.toEqual({
      userId: 'user-2',
      phoneNumber: '13700137000',
      nickname: '普通用户',
      avatar: null,
      role: UserRole.ADMIN,
    });
    expect(usersService.assignRole).toHaveBeenCalledWith('user-2', UserRole.ADMIN);
  });
});
