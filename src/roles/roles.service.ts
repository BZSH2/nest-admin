import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../auth/enums/user-role.enum';
import { resolveUserRole } from '../auth/utils/resolve-user-role';
import { type SafeUser, UsersService } from '../users/users.service';
import type { RoleOptionDto } from './dto/role-option.dto';
import type { UpdateUserRoleDto } from './dto/update-user-role.dto';
import type { UserRoleDetailDto } from './dto/user-role-detail.dto';

@Injectable()
export class RolesService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  getRoleOptions(): RoleOptionDto[] {
    return [
      {
        value: UserRole.ADMIN,
        label: '管理员',
      },
      {
        value: UserRole.USER,
        label: '普通用户',
      },
    ];
  }

  async getUserRole(userId: string): Promise<UserRoleDetailDto> {
    const user = await this.usersService.findOneOrFail(userId);
    return this.toUserRoleDetail(user);
  }

  async updateUserRole(userId: string, dto: UpdateUserRoleDto): Promise<UserRoleDetailDto> {
    const user = await this.usersService.assignRole(userId, dto.role);
    return this.toUserRoleDetail(user);
  }

  private toUserRoleDetail(user: SafeUser): UserRoleDetailDto {
    return {
      userId: user.id,
      phoneNumber: user.phoneNumber,
      nickname: user.nickname,
      avatar: user.avatar,
      role: resolveUserRole(user.phoneNumber, this.configService, user.role),
    };
  }
}
