import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../auth/enums/user-role.enum';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

type MockRepository = {
  create: jest.Mock;
  save: jest.Mock;
  findAndCount: jest.Mock;
  findOne: jest.Mock;
  findOneBy: jest.Mock;
  update: jest.Mock;
  softDelete: jest.Mock;
};

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: MockRepository;
  const configService = new ConfigService({
    ADMIN_PHONE_NUMBERS: '13800138000',
  });

  beforeEach(async () => {
    usersRepository = {
      create: jest.fn((input) => input),
      save: jest.fn(),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('hashes password on create, assigns default role, and removes sensitive fields from response', async () => {
    usersRepository.findOne.mockResolvedValue(null);
    usersRepository.save.mockImplementation(async (input) => ({
      id: 'user-1',
      phoneNumber: input.phoneNumber,
      role: input.role,
      nickname: input.nickname,
      password: input.password,
      currentHashedRefreshToken: null,
    }));

    const result = await service.create({
      phoneNumber: '13800138000',
      password: 'Password123!',
      nickname: '测试用户',
    });

    expect(usersRepository.create).toHaveBeenCalledTimes(1);
    const savedPayload = usersRepository.create.mock.calls[0][0] as {
      password: string;
      role: UserRole;
    };
    expect(savedPayload.password).not.toBe('Password123!');
    expect(savedPayload.role).toBe(UserRole.ADMIN);
    await expect(bcrypt.compare('Password123!', savedPayload.password)).resolves.toBe(true);

    expect(result).toEqual({
      id: 'user-1',
      phoneNumber: '13800138000',
      role: UserRole.ADMIN,
      nickname: '测试用户',
    });
    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('currentHashedRefreshToken');
  });

  it('throws conflict when creating a duplicated phone number', async () => {
    usersRepository.findOne.mockResolvedValue({
      id: 'existing-user',
      phoneNumber: '13800138000',
      password: 'hashed',
      role: UserRole.USER,
    });

    await expect(
      service.create({
        phoneNumber: '13800138000',
        password: 'Password123!',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('findOneOrFail throws when user does not exist', async () => {
    usersRepository.findOneBy.mockResolvedValue(null);

    await expect(service.findOneOrFail('missing-user')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('hashes password on update before persisting', async () => {
    usersRepository.findOneBy
      .mockResolvedValueOnce({
        id: 'user-1',
        phoneNumber: '13800138000',
        role: UserRole.USER,
        nickname: '原用户',
      })
      .mockResolvedValueOnce({
        id: 'user-1',
        phoneNumber: '13800138000',
        role: UserRole.USER,
        nickname: '更新后的用户',
      });
    usersRepository.update.mockResolvedValue(undefined);

    const result = await service.update('user-1', {
      password: 'NewPassword123!',
    });

    expect(usersRepository.update).toHaveBeenCalledTimes(1);
    const updatePayload = usersRepository.update.mock.calls[0][1] as { password: string };
    expect(updatePayload.password).not.toBe('NewPassword123!');
    await expect(bcrypt.compare('NewPassword123!', updatePayload.password)).resolves.toBe(true);
    expect(result).toEqual({
      id: 'user-1',
      phoneNumber: '13800138000',
      role: UserRole.USER,
      nickname: '更新后的用户',
    });
  });

  it('assigns role explicitly', async () => {
    usersRepository.findOneBy
      .mockResolvedValueOnce({
        id: 'user-1',
        phoneNumber: '13800138000',
        role: UserRole.USER,
        nickname: '原用户',
      })
      .mockResolvedValueOnce({
        id: 'user-1',
        phoneNumber: '13800138000',
        role: UserRole.ADMIN,
        nickname: '原用户',
      });
    usersRepository.update.mockResolvedValue(undefined);

    await expect(service.assignRole('user-1', UserRole.ADMIN)).resolves.toEqual(
      expect.objectContaining({
        id: 'user-1',
        role: UserRole.ADMIN,
      }),
    );
    expect(usersRepository.update).toHaveBeenCalledWith('user-1', { role: UserRole.ADMIN });
  });

  it('throws conflict when updating phone number to another existing user', async () => {
    usersRepository.findOneBy.mockResolvedValue({
      id: 'user-1',
      phoneNumber: '13800138000',
      role: UserRole.USER,
      nickname: '原用户',
    });
    usersRepository.findOne.mockResolvedValue({
      id: 'user-2',
      phoneNumber: '13900139000',
      password: 'hashed',
      role: UserRole.USER,
    });

    await expect(
      service.update('user-1', {
        phoneNumber: '13900139000',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws when deleting a missing user', async () => {
    usersRepository.softDelete.mockResolvedValue({ affected: 0 });

    await expect(service.delete('missing-user')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('loads the hashed refresh token explicitly when validating refresh tokens', async () => {
    const currentHashedRefreshToken = await bcrypt.hash('refresh-token', 10);
    usersRepository.findOne.mockResolvedValue({
      id: 'user-1',
      phoneNumber: '13800138000',
      role: UserRole.ADMIN,
      nickname: '测试用户',
      avatar: null,
      currentHashedRefreshToken,
    });

    const result = await service.getUserIfRefreshTokenMatches('refresh-token', 'user-1');

    expect(usersRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        select: expect.arrayContaining(['currentHashedRefreshToken', 'role']),
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: 'user-1',
        phoneNumber: '13800138000',
        role: UserRole.ADMIN,
      }),
    );
  });
});
