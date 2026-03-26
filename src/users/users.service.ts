import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Like, Repository } from 'typeorm';
import { UserRole } from '../auth/enums/user-role.enum';
import { resolveUserRole } from '../auth/utils/resolve-user-role';
import { Role } from '../roles/entities/role.entity';
import { UserRoleAssignment } from '../roles/entities/user-role.entity';
import { SYSTEM_ROLE_SEEDS } from '../roles/role.constants';
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
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(UserRoleAssignment)
    private readonly userRolesRepository: Repository<UserRoleAssignment>,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    await this.ensurePhoneNumberAvailable(createUserDto.phoneNumber);

    const resolvedRole = resolveUserRole(createUserDto.phoneNumber, this.configService);
    const user = this.usersRepository.create(
      await this.withHashedPassword({
        ...createUserDto,
        role: resolvedRole,
        avatar: createUserDto.avatar ?? null,
        status: createUserDto.status ?? true,
        remark: createUserDto.remark ?? null,
        passwordUpdatedAt: new Date(),
      }),
    );
    const savedUser = await this.usersRepository.save(user);
    await this.syncUserRoleAssignment(savedUser.id, resolvedRole);
    return this.sanitizeUser(savedUser);
  }

  async findAll(query: QueryUserDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const keyword = query.keyword?.trim();

    const where = keyword
      ? [
          {
            phoneNumber: Like(`%${keyword}%`),
            ...(query.status == null ? {} : { status: query.status }),
          },
          {
            nickname: Like(`%${keyword}%`),
            ...(query.status == null ? {} : { status: query.status }),
          },
        ]
      : query.status == null
        ? undefined
        : { status: query.status };

    const [items, total] = await this.usersRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
      select: [
        'id',
        'phoneNumber',
        'role',
        'nickname',
        'avatar',
        'status',
        'remark',
        'lastLoginAt',
        'lastLoginIp',
        'passwordUpdatedAt',
        'createdAt',
        'updatedAt',
      ],
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
        'status',
        'remark',
        'lastLoginAt',
        'lastLoginIp',
        'passwordUpdatedAt',
        'currentHashedRefreshToken',
        'createdAt',
        'updatedAt',
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

    await this.usersRepository.update(
      id,
      await this.withHashedPassword({
        ...updateUserDto,
        avatar: updateUserDto.avatar === undefined ? undefined : (updateUserDto.avatar ?? null),
        remark: updateUserDto.remark === undefined ? undefined : (updateUserDto.remark ?? null),
      }),
    );
    const updatedUser = await this.findOneOrFail(id);

    if (updateUserDto.phoneNumber && existingUser.role == null) {
      const resolvedRole = resolveUserRole(
        updatedUser.phoneNumber,
        this.configService,
        updatedUser.role,
      );
      await this.syncUserRoleAssignment(id, resolvedRole);
    }

    return updatedUser;
  }

  async updateStatus(id: string, status: boolean) {
    await this.findOneOrFail(id);
    await this.usersRepository.update(id, { status });
    return this.findOneOrFail(id);
  }

  async resetPassword(id: string, newPassword: string) {
    await this.findOneOrFail(id);
    await this.setPassword(id, newPassword);
    return { message: '密码重置成功' };
  }

  async assignRole(id: string, role: UserRole): Promise<SafeUser> {
    await this.findOneOrFail(id);
    await this.usersRepository.update(id, { role });
    await this.syncUserRoleAssignment(id, role);
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

  async updateLastLogin(userId: string, ip?: string | null) {
    await this.usersRepository.update(userId, {
      lastLoginAt: new Date(),
      lastLoginIp: ip ?? null,
    });
  }

  async setPassword(userId: string, plainPassword: string) {
    await this.usersRepository.update(userId, {
      password: await bcrypt.hash(plainPassword, 10),
      passwordUpdatedAt: new Date(),
      currentHashedRefreshToken: null,
    });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'phoneNumber',
        'role',
        'nickname',
        'avatar',
        'status',
        'currentHashedRefreshToken',
      ],
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

  private async syncUserRoleAssignment(userId: string, roleCode: UserRole) {
    const role = await this.findOrCreateRoleRecord(roleCode);
    await this.userRolesRepository.delete({ userId });
    await this.userRolesRepository.save(
      this.userRolesRepository.create({
        userId,
        roleId: role.id,
      }),
    );
  }

  private async findOrCreateRoleRecord(roleCode: UserRole) {
    const existingRole = await this.rolesRepository.findOne({
      where: { code: roleCode },
      withDeleted: true,
    });

    if (existingRole) {
      if (existingRole.deletedAt) {
        await this.rolesRepository.recover(existingRole);
      }
      return existingRole;
    }

    const seed = SYSTEM_ROLE_SEEDS.find((item) => item.code === roleCode);
    return this.rolesRepository.save(
      this.rolesRepository.create({
        code: roleCode,
        name: seed?.name || roleCode,
        description: seed?.description || null,
        sort: seed?.sort || 0,
        enabled: seed?.enabled ?? true,
        isSystem: seed?.isSystem || false,
        isDefault: seed?.isDefault || false,
      }),
    );
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
      passwordUpdatedAt: new Date(),
    };
  }

  private sanitizeUser(user: User): SafeUser {
    const { password, currentHashedRefreshToken, ...safeUser } = user;
    return safeUser;
  }
}
