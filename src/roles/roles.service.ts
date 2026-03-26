import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { UserRole } from '../auth/enums/user-role.enum';
import { resolveUserRole } from '../auth/utils/resolve-user-role';
import { User } from '../users/entities/user.entity';
import { type SafeUser, UsersService } from '../users/users.service';
import type { CreateRoleDto } from './dto/create-role.dto';
import type { CreateRoleUserDto } from './dto/create-role-user.dto';
import type { QueryRoleDto } from './dto/query-role.dto';
import type { RoleDetailDto } from './dto/role-detail.dto';
import type { RoleMemberDto } from './dto/role-member.dto';
import type { RoleOptionDto } from './dto/role-option.dto';
import type { UpdateRoleDto } from './dto/update-role.dto';
import type { UpdateRoleStatusDto } from './dto/update-role-status.dto';
import type { UpdateUserRoleDto } from './dto/update-user-role.dto';
import type { UserRoleDetailDto } from './dto/user-role-detail.dto';
import { Role } from './entities/role.entity';
import { UserRoleAssignment } from './entities/user-role.entity';
import { SYSTEM_ROLE_LABELS } from './role.constants';

@Injectable()
export class RolesService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(UserRoleAssignment)
    private readonly userRolesRepository: Repository<UserRoleAssignment>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(query: QueryRoleDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const keyword = query.keyword?.trim();

    const where = this.buildRoleWhere(keyword, query.enabled);
    const [items, total] = await this.rolesRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { sort: 'ASC', createdAt: 'ASC' },
    });

    return {
      items: await Promise.all(items.map((item) => this.toRoleDetail(item))),
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: string): Promise<RoleDetailDto> {
    const role = await this.findRoleByIdOrFail(id);
    return this.toRoleDetail(role);
  }

  async createRole(dto: CreateRoleDto): Promise<RoleDetailDto> {
    await this.ensureRoleCodeAvailable(dto.code);

    if (dto.isDefault) {
      await this.clearDefaultRole();
    }

    const role = await this.rolesRepository.save(
      this.rolesRepository.create({
        code: dto.code,
        name: dto.name,
        description: dto.description ?? null,
        sort: dto.sort ?? 0,
        enabled: dto.enabled ?? true,
        isSystem: false,
        isDefault: dto.isDefault ?? false,
      }),
    );

    return this.toRoleDetail(role);
  }

  async updateRole(id: string, dto: UpdateRoleDto): Promise<RoleDetailDto> {
    const role = await this.findRoleByIdOrFail(id);

    if (dto.code && dto.code !== role.code) {
      if (role.isSystem) {
        throw new ConflictException('系统内置角色不允许修改编码');
      }
      await this.ensureRoleCodeAvailable(dto.code, role.id);
    }

    if (dto.isDefault === true) {
      await this.clearDefaultRole(role.id);
    }

    const nextRole = await this.rolesRepository.save({
      ...role,
      code: dto.code ?? role.code,
      name: dto.name ?? role.name,
      description: dto.description ?? role.description,
      sort: dto.sort ?? role.sort,
      enabled: dto.enabled ?? role.enabled,
      isDefault: dto.isDefault ?? role.isDefault,
    });

    return this.toRoleDetail(nextRole);
  }

  async updateRoleStatus(id: string, dto: UpdateRoleStatusDto): Promise<RoleDetailDto> {
    const role = await this.findRoleByIdOrFail(id);

    if (role.isSystem && dto.enabled === false) {
      throw new ConflictException('系统内置角色不允许停用');
    }

    const nextRole = await this.rolesRepository.save({
      ...role,
      enabled: dto.enabled,
    });

    return this.toRoleDetail(nextRole);
  }

  async removeRole(id: string) {
    const role = await this.findRoleByIdOrFail(id);

    if (role.isSystem) {
      throw new ConflictException('系统内置角色不允许删除');
    }

    const memberCount = await this.userRolesRepository.count({
      where: { roleId: id },
    });

    if (memberCount > 0) {
      throw new ConflictException('该角色下仍有关联用户，不允许删除');
    }

    await this.rolesRepository.softDelete(id);

    return { message: '删除成功' };
  }

  async findUsersByRole(roleId: string, query: QueryRoleDto) {
    await this.findRoleByIdOrFail(roleId);

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const keyword = query.keyword?.trim();

    const assignments = await this.userRolesRepository.find({
      where: { roleId },
      relations: {
        user: true,
      },
      order: { createdAt: 'DESC' },
    });

    const filtered = assignments.filter((assignment) => {
      if (!keyword) {
        return true;
      }

      return (
        assignment.user.phoneNumber.includes(keyword) ||
        (assignment.user.nickname ?? '').includes(keyword)
      );
    });

    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

    return {
      items: paged.map((item) => this.toRoleMember(item)),
      total: filtered.length,
      page,
      pageSize,
    };
  }

  async addUserToRole(roleId: string, dto: CreateRoleUserDto, actorUserId?: string) {
    const role = await this.findRoleByIdOrFail(roleId);
    const user = await this.usersService.findOneOrFail(dto.userId);

    await this.assertRoleTransitionAllowed(user, role.code, actorUserId);

    await this.userRolesRepository.delete({ userId: user.id });
    await this.userRolesRepository.save(
      this.userRolesRepository.create({
        userId: user.id,
        roleId: role.id,
      }),
    );
    await this.syncLegacyUserRole(user.id, role.code);

    return { message: '添加成员成功' };
  }

  async removeUserFromRole(roleId: string, userId: string, actorUserId?: string) {
    const role = await this.findRoleByIdOrFail(roleId);
    const user = await this.usersService.findOneOrFail(userId);
    const assignment = await this.userRolesRepository.findOne({
      where: { roleId, userId },
      relations: { role: true },
    });

    if (!assignment) {
      throw new NotFoundException('该用户不在当前角色下');
    }

    await this.assertRoleRemovalAllowed(user, role.code, actorUserId);

    await this.userRolesRepository.delete({ roleId, userId });
    await this.syncLegacyUserRole(userId, null);

    return { message: '移除成员成功' };
  }

  async getRoleOptions(): Promise<RoleOptionDto[]> {
    const roles = await this.rolesRepository.find({
      where: [{ code: UserRole.ADMIN }, { code: UserRole.USER }],
      order: { sort: 'ASC', createdAt: 'ASC' },
    });

    if (roles.length === 0) {
      return Object.values(UserRole).map((role) => ({
        value: role,
        label: SYSTEM_ROLE_LABELS[role],
      }));
    }

    return roles.map((role) => ({
      value: role.code as UserRole,
      label: role.name,
    }));
  }

  async getUserRole(userId: string): Promise<UserRoleDetailDto> {
    const user = await this.usersService.findOneOrFail(userId);
    return this.toUserRoleDetail(user);
  }

  async updateUserRole(
    userId: string,
    dto: UpdateUserRoleDto,
    actorUserId?: string,
  ): Promise<UserRoleDetailDto> {
    const user = await this.usersService.findOneOrFail(userId);
    await this.assertRoleTransitionAllowed(user, dto.role, actorUserId);

    const nextUser = await this.usersService.assignRole(userId, dto.role);
    return this.toUserRoleDetail(nextUser);
  }

  private buildRoleWhere(keyword?: string, enabled?: boolean) {
    if (!keyword && enabled == null) {
      return undefined;
    }

    const keywordWhere = keyword
      ? [{ name: Like(`%${keyword}%`) }, { code: Like(`%${keyword}%`) }]
      : [{}];

    return keywordWhere.map((item) => ({
      ...item,
      ...(enabled == null ? {} : { enabled }),
    }));
  }

  private async toRoleDetail(role: Role): Promise<RoleDetailDto> {
    const memberCount = await this.userRolesRepository.count({
      where: { roleId: role.id },
    });

    return {
      id: role.id,
      code: role.code,
      name: role.name,
      description: role.description,
      sort: role.sort,
      enabled: role.enabled,
      isSystem: role.isSystem,
      isDefault: role.isDefault,
      memberCount,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  private toRoleMember(assignment: UserRoleAssignment): RoleMemberDto {
    return {
      userId: assignment.user.id,
      phoneNumber: assignment.user.phoneNumber,
      nickname: assignment.user.nickname,
      avatar: assignment.user.avatar,
      assignedAt: assignment.createdAt,
    };
  }

  private async toUserRoleDetail(user: SafeUser): Promise<UserRoleDetailDto> {
    return {
      userId: user.id,
      phoneNumber: user.phoneNumber,
      nickname: user.nickname,
      avatar: user.avatar,
      role: await this.resolvePersistedUserRole(user),
    };
  }

  private async resolvePersistedUserRole(user: SafeUser): Promise<UserRole> {
    const assignment = await this.userRolesRepository.findOne({
      where: { userId: user.id },
      relations: {
        role: true,
      },
    });

    if (
      assignment?.role?.code &&
      Object.values(UserRole).includes(assignment.role.code as UserRole)
    ) {
      return assignment.role.code as UserRole;
    }

    return resolveUserRole(user.phoneNumber, this.configService, user.role);
  }

  private async findRoleByIdOrFail(id: string) {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    return role;
  }

  private async ensureRoleCodeAvailable(code: string, excludeId?: string) {
    const existing = await this.rolesRepository.findOne({
      where: { code },
      withDeleted: true,
    });

    if (existing && existing.id !== excludeId) {
      throw new ConflictException('角色编码已存在');
    }
  }

  private async clearDefaultRole(excludeId?: string) {
    const defaultRoles = await this.rolesRepository.find({ where: { isDefault: true } });

    await Promise.all(
      defaultRoles
        .filter((role) => role.id !== excludeId)
        .map((role) =>
          this.rolesRepository.save({
            ...role,
            isDefault: false,
          }),
        ),
    );
  }

  private async assertRoleTransitionAllowed(
    user: SafeUser,
    nextRoleCode: string,
    actorUserId?: string,
  ) {
    const currentRole = await this.resolvePersistedUserRole(user);

    if (currentRole !== UserRole.ADMIN || nextRoleCode === UserRole.ADMIN) {
      return;
    }

    if (actorUserId && actorUserId === user.id) {
      throw new ConflictException('不能移除自己的管理员角色');
    }

    const adminRole = await this.rolesRepository.findOne({ where: { code: UserRole.ADMIN } });
    if (!adminRole) {
      return;
    }

    const adminCount = await this.userRolesRepository.count({
      where: { roleId: adminRole.id },
    });

    if (adminCount <= 1) {
      throw new ConflictException('至少需要保留一个管理员');
    }
  }

  private async assertRoleRemovalAllowed(user: SafeUser, roleCode: string, actorUserId?: string) {
    if (roleCode !== UserRole.ADMIN) {
      return;
    }

    if (actorUserId && actorUserId === user.id) {
      throw new ConflictException('不能移除自己的管理员角色');
    }

    const adminRole = await this.rolesRepository.findOne({ where: { code: UserRole.ADMIN } });
    if (!adminRole) {
      return;
    }

    const adminCount = await this.userRolesRepository.count({
      where: { roleId: adminRole.id },
    });

    if (adminCount <= 1) {
      throw new ConflictException('至少需要保留一个管理员');
    }
  }

  private async syncLegacyUserRole(userId: string, roleCode: string | null) {
    if (roleCode && Object.values(UserRole).includes(roleCode as UserRole)) {
      await this.usersRepository.update(userId, { role: roleCode as UserRole });
      return;
    }

    await this.usersRepository.update(userId, { role: null });
  }
}
