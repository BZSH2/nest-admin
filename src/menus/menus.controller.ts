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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../auth/enums/user-role.enum';
import { ApiModule } from '../common/decorators/api-module.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { OperationMessageResponseDto } from '../common/dto/operation-message-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateMenuDto } from './dto/create-menu.dto';
import { MenuDetailResponseDto } from './dto/menu-detail-response.dto';
import { MenuListResponseDto } from './dto/menu-list-response.dto';
import { MenuTreeResponseDto } from './dto/menu-tree-response.dto';
import { QueryMenuDto } from './dto/query-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenusService } from './menus.service';

@ApiTags('Menus')
@Controller('menus')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  @ApiModule('MenuModule')
  @ApiOperation({ summary: '查询菜单树列表' })
  @ApiOkResponse({ description: '获取成功', type: MenuListResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  findAll(@Query() query: QueryMenuDto) {
    return this.menusService.findAll(query);
  }

  @Get('tree')
  @ApiModule('MenuModule')
  @ApiOperation({ summary: '查询菜单树' })
  @ApiOkResponse({ description: '获取成功', type: MenuTreeResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  findTree(@Query() query: QueryMenuDto) {
    return this.menusService.findTree(query);
  }

  @Get(':id')
  @ApiModule('MenuModule')
  @ApiOperation({ summary: '获取菜单详情' })
  @ApiOkResponse({ description: '获取成功', type: MenuDetailResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  @ApiResponse({ status: 404, description: '菜单不存在' })
  findOne(@Param('id') id: string) {
    return this.menusService.findOne(id);
  }

  @Post()
  @ApiModule('MenuModule')
  @ApiOperation({ summary: '创建菜单' })
  @ApiOkResponse({ description: '创建成功', type: MenuDetailResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  @ApiResponse({ status: 404, description: '所属产品或父级菜单不存在' })
  @ApiResponse({ status: 409, description: '当前产品下菜单编码已存在或父级菜单不合法' })
  create(@Body() dto: CreateMenuDto) {
    return this.menusService.create(dto);
  }

  @Patch(':id')
  @ApiModule('MenuModule')
  @ApiOperation({ summary: '更新菜单' })
  @ApiOkResponse({ description: '更新成功', type: MenuDetailResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  @ApiResponse({ status: 404, description: '菜单、所属产品或父级菜单不存在' })
  @ApiResponse({ status: 409, description: '当前产品下菜单编码已存在或父级菜单不合法' })
  update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.menusService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiModule('MenuModule')
  @ApiOperation({ summary: '删除菜单' })
  @ApiOkResponse({ description: '删除成功', type: OperationMessageResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  @ApiResponse({ status: 404, description: '菜单不存在' })
  @ApiResponse({ status: 409, description: '请先删除子菜单' })
  remove(@Param('id') id: string) {
    return this.menusService.remove(id);
  }
}
