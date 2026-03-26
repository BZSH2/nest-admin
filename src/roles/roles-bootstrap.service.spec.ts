import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRole } from '../auth/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { Role } from './entities/role.entity';
import { UserRoleAssignment } from './entities/user-role.entity';
import { RolesBootstrapService } from './roles-bootstrap.service';

type MockRepository = {
  find: jest.Mock;
  findOne: jest.Mock;
  save: jest.Mock;
  recover: jest.Mock;
  delete: jest.Mock;
  create: jest.Mock;
};

describe('RolesBootstrapService', () => {
  let service: RolesBootstrapService;
  let rolesRepository: MockRepository;
  let userRolesRepository: MockRepository;
  let usersRepository: MockRepository;

  beforeEach(async () => {
    rolesRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(async (input) => input),
      recover: jest.fn(),
      delete: jest.fn(),
      create: jest.fn((input) => input),
    };

    userRolesRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(async (input) => input),
      recover: jest.fn(),
      delete: jest.fn(),
      create: jest.fn((input) => input),
    };

    usersRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      recover: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesBootstrapService,
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
        {
          provide: ConfigService,
          useValue: new ConfigService({
            ADMIN_PHONE_NUMBERS: '13800138000',
          }),
        },
      ],
    }).compile();

    service = module.get<RolesBootstrapService>(RolesBootstrapService);
  });

  it('creates built-in roles and backfills user-role assignments from legacy user roles', async () => {
    rolesRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    rolesRepository.find.mockResolvedValue([
      { id: 'role-admin', code: UserRole.ADMIN },
      { id: 'role-user', code: UserRole.USER },
    ]);
    usersRepository.find.mockResolvedValue([
      { id: 'user-1', phoneNumber: '13800138000', role: null },
      { id: 'user-2', phoneNumber: '13700137000', role: UserRole.USER },
    ]);
    userRolesRepository.find.mockResolvedValue([]);

    await service.onModuleInit();

    expect(rolesRepository.save).toHaveBeenCalledTimes(2);
    expect(userRolesRepository.delete).toHaveBeenCalledWith({ userId: 'user-1' });
    expect(userRolesRepository.delete).toHaveBeenCalledWith({ userId: 'user-2' });
    expect(userRolesRepository.save).toHaveBeenCalledWith({
      userId: 'user-1',
      roleId: 'role-admin',
    });
    expect(userRolesRepository.save).toHaveBeenCalledWith({
      userId: 'user-2',
      roleId: 'role-user',
    });
  });
});
