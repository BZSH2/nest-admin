import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { resolveUserRole } from '../auth/utils/resolve-user-role';
import { User } from '../users/entities/user.entity';
import { Role } from './entities/role.entity';
import { UserRoleAssignment } from './entities/user-role.entity';
import { SYSTEM_ROLE_SEEDS } from './role.constants';

@Injectable()
export class RolesBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(RolesBootstrapService.name);

  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(UserRoleAssignment)
    private readonly userRolesRepository: Repository<UserRoleAssignment>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.ensureSystemRoles();
    await this.backfillLegacyUserRoles();
  }

  private async ensureSystemRoles() {
    for (const seed of SYSTEM_ROLE_SEEDS) {
      const existing = await this.rolesRepository.findOne({
        where: { code: seed.code },
        withDeleted: true,
      });

      if (!existing) {
        await this.rolesRepository.save(this.rolesRepository.create(seed));
        continue;
      }

      if (existing.deletedAt) {
        await this.rolesRepository.recover(existing);
      }

      await this.rolesRepository.save({
        ...existing,
        name: seed.name,
        description: seed.description,
        sort: seed.sort,
        enabled: seed.enabled,
        isSystem: seed.isSystem,
        isDefault: seed.isDefault,
      });
    }
  }

  private async backfillLegacyUserRoles() {
    const roles = await this.rolesRepository.find();
    const roleMap = new Map(roles.map((role) => [role.code, role]));

    const users = await this.usersRepository.find({
      select: ['id', 'phoneNumber', 'role'],
    });

    const existingAssignments = await this.userRolesRepository.find({
      relations: {
        role: true,
      },
    });

    const existingAssignmentMap = new Map(
      existingAssignments.map((assignment) => [assignment.userId, assignment]),
    );

    let changed = 0;

    for (const user of users) {
      const resolvedRole = resolveUserRole(user.phoneNumber, this.configService, user.role);
      const targetRole = roleMap.get(resolvedRole);

      if (!targetRole) {
        continue;
      }

      const existingAssignment = existingAssignmentMap.get(user.id);
      if (existingAssignment?.roleId === targetRole.id) {
        continue;
      }

      await this.userRolesRepository.delete({ userId: user.id });
      await this.userRolesRepository.save(
        this.userRolesRepository.create({
          userId: user.id,
          roleId: targetRole.id,
        }),
      );
      changed += 1;
    }

    if (changed > 0) {
      this.logger.log(`角色关联回填完成，更新 ${changed} 条用户角色关系`);
    }
  }
}
