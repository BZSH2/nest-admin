import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Like, Repository } from 'typeorm';
import { UserRole } from '../auth/enums/user-role.enum';
import { resolveUserRole } from '../auth/utils/resolve-user-role';
import type { CreateUserDto } from './dto/create-user.dto';
import type { QueryUserDto } from './dto/query-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

export type SafeUser = Omit<User, 'password' | 'currentHashedRefreshToken'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    await this.ensurePhoneNumberAvailable(createUserDto.phoneNumber);

    const user = this.usersRepository.create(
      await this.withHashedPassword({
        ...createUserDto,
        role: resolveUserRole(createUserDto.phoneNumber, this.configService),
      }),
    );
    const savedUser = await this.usersRepository.save(user);
    return this.sanitizeUser(savedUser);
  }

  async findAll(query: QueryUserDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const keyword = query.keyword?.trim();

    const where = keyword
      ? [{ phoneNumber: Like(`%${keyword}%`) }, { nickname: Like(`%${keyword}%`) }]
      : undefined;

    const [items, total] = await this.usersRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
      select: ['id', 'phoneNumber', 'role', 'nickname', 'avatar', 'createdAt', 'updatedAt'],
    });

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  findOneByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { phoneNumber },
      select: [
        'id',
        'phoneNumber',
        'password',
        'role',
        'nickname',
        'avatar',
        'currentHashedRefreshToken',
      ],
    });
  }

  findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async findOneOrFail(id: string): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<SafeUser> {
    const existingUser = await this.findOneOrFail(id);

    if (updateUserDto.phoneNumber && updateUserDto.phoneNumber !== existingUser.phoneNumber) {
      await this.ensurePhoneNumberAvailable(updateUserDto.phoneNumber, id);
    }

    await this.usersRepository.update(id, await this.withHashedPassword(updateUserDto));
    return this.findOneOrFail(id);
  }

  async assignRole(id: string, role: UserRole): Promise<SafeUser> {
    await this.findOneOrFail(id);
    await this.usersRepository.update(id, { role });
    return this.findOneOrFail(id);
  }

  async delete(id: string) {
    const result = await this.usersRepository.softDelete(id);

    if (!result.affected) {
      throw new NotFoundException('用户不存在');
    }

    return { id };
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.update(userId, {
      currentHashedRefreshToken,
    });
  }

  removeRefreshToken(userId: string) {
    return this.usersRepository.update(userId, {
      currentHashedRefreshToken: null,
    });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'phoneNumber', 'role', 'nickname', 'avatar', 'currentHashedRefreshToken'],
    });

    if (!user?.currentHashedRefreshToken) {
      return null;
    }

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );

    if (isRefreshTokenMatching) {
      return user;
    }
    return null;
  }

  private async ensurePhoneNumberAvailable(phoneNumber: string, excludeUserId?: string) {
    const existingUser = await this.findOneByPhoneNumber(phoneNumber);
    if (existingUser && existingUser.id !== excludeUserId) {
      throw new ConflictException('该手机号已存在');
    }
  }

  private async withHashedPassword<T extends { password?: string }>(payload: T): Promise<T> {
    if (!payload.password) {
      return payload;
    }

    return {
      ...payload,
      password: await bcrypt.hash(payload.password, 10),
    };
  }

  private sanitizeUser(user: User): SafeUser {
    const { password, currentHashedRefreshToken, ...safeUser } = user;
    return safeUser;
  }
}
