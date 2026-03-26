import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../auth/enums/user-role.enum';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { ApiModule } from '../common/decorators/api-module.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { OperationMessageResponseDto } from '../common/dto/operation-message-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreateRoleUserDto } from './dto/create-role-user.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { RoleDetailResponseDto } from './dto/role-detail-response.dto';
import { RoleListResponseDto } from './dto/role-list-response.dto';
import { RoleMemberListResponseDto } from './dto/role-member-list-response.dto';
import { RoleOptionsResponseDto } from './dto/role-options-response.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateRoleStatusDto } from './dto/update-role-status.dto';
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

  @Get()
  @ApiModule('RoleModule')
  @ApiOperation({ summary: '分页查询角色列表' })
  @ApiOkResponse({ description: '获取成功', type: RoleListResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  findAll(@Query() query: QueryRoleDto) {
    return this.rolesService.findAll(query);
  }

  @Post()
  @ApiModule('RoleModule')
  @ApiOperation({ summary: '创建角色' })
  @ApiOkResponse({ description: '创建成功', type: RoleDetailResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  @ApiResponse({ status: 409, description: '角色编码已存在' })
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.createRole(dto);
  }

  @Get('options')
  @ApiModule('RoleModule')
  @ApiOperation({ summary: '获取可分配角色选项列表' })
  @ApiOkResponse({ description: '获取成功', type: RoleOptionsResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  getOptions() {
    return this.rolesService.getRoleOptions();
  }

  @Get(':id')
  @ApiModule('RoleModule')
  @ApiOperation({ summary: '获取角色详情' })
  @ApiOkResponse({ description: '获取成功', type: RoleDetailResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ApiModule('RoleModule')
  @ApiOperation({ summary: '更新角色基础信息' })
  @ApiOkResponse({ description: '更新成功', type: RoleDetailResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  @ApiResponse({ status: 409, description: '系统角色限制或角色编码冲突' })
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.updateRole(id, dto);
  }

  @Patch(':id/status')
  @ApiModule('RoleModule')
  @ApiOperation({ summary: '更新角色启用状态' })
  @ApiOkResponse({ description: '更新成功', type: RoleDetailResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  @ApiResponse({ status: 409, description: '系统角色不允许停用' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateRoleStatusDto) {
    return this.rolesService.updateRoleStatus(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiModule('RoleModule')
  @ApiOperation({ summary: '删除角色' })
  @ApiOkResponse({ description: '删除成功', type: OperationMessageResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  @ApiResponse({ status: 409, description: '系统角色不允许删除或角色仍有关联用户' })
  remove(@Param('id') id: string) {
    return this.rolesService.removeRole(id);
  }

  @Get(':id/users')
  @ApiModule('RoleModule')
  @ApiOperation({ summary: '分页查询角色成员列表' })
  @ApiOkResponse({ description: '获取成功', type: RoleMemberListResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  findUsers(@Param('id') id: string, @Query() query: QueryRoleDto) {
    return this.rolesService.findUsersByRole(id, query);
  }

  @Post(':id/users')
  @ApiModule('RoleModule')
  @ApiOperation({ summary: '为角色添加成员' })
  @ApiOkResponse({ description: '添加成功', type: OperationMessageResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  @ApiResponse({ status: 404, description: '角色或用户不存在' })
  @ApiResponse({ status: 409, description: '成员添加受保护规则限制' })
  addUser(
    @Param('id') id: string,
    @Body() dto: CreateRoleUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.rolesService.addUserToRole(id, dto, req.user.id);
  }

  @Delete(':id/users/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiModule('RoleModule')
  @ApiOperation({ summary: '从角色移除成员' })
  @ApiOkResponse({ description: '移除成功', type: OperationMessageResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  @ApiResponse({ status: 404, description: '角色或成员不存在' })
  @ApiResponse({ status: 409, description: '成员移除受保护规则限制' })
  removeUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.rolesService.removeUserFromRole(id, userId, req.user.id);
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
  @ApiResponse({ status: 409, description: '管理员保护规则限制' })
  updateUserRole(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserRoleDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.rolesService.updateUserRole(userId, dto, req.user.id);
  }
}
