import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../auth/enums/user-role.enum';
import { ApiModule } from '../common/decorators/api-module.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RoleOptionsResponseDto } from './dto/role-options-response.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserRoleDetailResponseDto } from './dto/user-role-detail-response.dto';
import { RolesService } from './roles.service';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('options')
  @ApiModule('RoleModule')
  @ApiOperation({ summary: '获取角色选项列表' })
  @ApiOkResponse({ description: '获取成功', type: RoleOptionsResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  getOptions() {
    return this.rolesService.getRoleOptions();
  }

  @Get('users/:userId')
  @ApiModule('RoleModule')
  @ApiOperation({ summary: '获取指定用户角色信息' })
  @ApiOkResponse({ description: '获取成功', type: UserRoleDetailResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  getUserRole(@Param('userId') userId: string) {
    return this.rolesService.getUserRole(userId);
  }

  @Patch('users/:userId')
  @ApiModule('RoleModule')
  @ApiOperation({ summary: '更新指定用户角色' })
  @ApiOkResponse({ description: '更新成功', type: UserRoleDetailResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  updateUserRole(@Param('userId') userId: string, @Body() dto: UpdateUserRoleDto) {
    return this.rolesService.updateUserRole(userId, dto);
  }
}
