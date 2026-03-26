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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../auth/enums/user-role.enum';
import { ApiModule } from '../common/decorators/api-module.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateMenuDto } from './dto/create-menu.dto';
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
  @ApiOperation({ summary: '分页查询菜单列表' })
  findAll(@Query() query: QueryMenuDto) {
    return this.menusService.findAll(query);
  }

  @Get('tree')
  @ApiModule('MenuModule')
  @ApiOperation({ summary: '查询菜单树' })
  findTree() {
    return this.menusService.findTree();
  }

  @Get(':id')
  @ApiModule('MenuModule')
  @ApiOperation({ summary: '获取菜单详情' })
  findOne(@Param('id') id: string) {
    return this.menusService.findOne(id);
  }

  @Post()
  @ApiModule('MenuModule')
  @ApiOperation({ summary: '创建菜单' })
  @ApiResponse({ status: 409, description: '菜单编码已存在' })
  create(@Body() dto: CreateMenuDto) {
    return this.menusService.create(dto);
  }

  @Patch(':id')
  @ApiModule('MenuModule')
  @ApiOperation({ summary: '更新菜单' })
  update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.menusService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiModule('MenuModule')
  @ApiOperation({ summary: '删除菜单' })
  remove(@Param('id') id: string) {
    return this.menusService.remove(id);
  }
}
