import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
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
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('hashes password on create and removes sensitive fields from the response', async () => {
    usersRepository.findOne.mockResolvedValue(null);
    usersRepository.save.mockImplementation(async (input) => ({
      id: 'user-1',
      phoneNumber: input.phoneNumber,
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
    const savedPayload = usersRepository.create.mock.calls[0][0] as { password: string };
    expect(savedPayload.password).not.toBe('Password123!');
    await expect(bcrypt.compare('Password123!', savedPayload.password)).resolves.toBe(true);

    expect(result).toEqual({
      id: 'user-1',
      phoneNumber: '13800138000',
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
        nickname: '原用户',
      })
      .mockResolvedValueOnce({
        id: 'user-1',
        phoneNumber: '13800138000',
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
      nickname: '更新后的用户',
    });
  });

  it('throws conflict when updating phone number to another existing user', async () => {
    usersRepository.findOneBy.mockResolvedValue({
      id: 'user-1',
      phoneNumber: '13800138000',
      nickname: '原用户',
    });
    usersRepository.findOne.mockResolvedValue({
      id: 'user-2',
      phoneNumber: '13900139000',
      password: 'hashed',
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
      nickname: '测试用户',
      avatar: null,
      currentHashedRefreshToken,
    });

    const result = await service.getUserIfRefreshTokenMatches('refresh-token', 'user-1');

    expect(usersRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        select: expect.arrayContaining(['currentHashedRefreshToken']),
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: 'user-1',
        phoneNumber: '13800138000',
      }),
    );
  });
});
