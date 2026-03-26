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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../auth/enums/user-role.enum';
import { ApiModule } from '../common/decorators/api-module.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { QuerySystemConfigDto } from './dto/query-system-config.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { SystemConfigsService } from './system-configs.service';

@ApiTags('SystemConfigs')
@Controller('configs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
export class SystemConfigsController {
  constructor(private readonly systemConfigsService: SystemConfigsService) {}

  @Get()
  @ApiModule('SystemConfigModule')
  @ApiOperation({ summary: '分页查询系统参数' })
  findAll(@Query() query: QuerySystemConfigDto) {
    return this.systemConfigsService.findAll(query);
  }

  @Get('key/:key')
  @ApiModule('SystemConfigModule')
  @ApiOperation({ summary: '按配置键查询系统参数' })
  findByKey(@Param('key') key: string) {
    return this.systemConfigsService.findByKey(key);
  }

  @Get(':id')
  @ApiModule('SystemConfigModule')
  @ApiOperation({ summary: '查询系统参数详情' })
  findOne(@Param('id') id: string) {
    return this.systemConfigsService.findOne(id);
  }

  @Post()
  @ApiModule('SystemConfigModule')
  @ApiOperation({ summary: '创建系统参数' })
  create(@Body() dto: CreateSystemConfigDto) {
    return this.systemConfigsService.create(dto);
  }

  @Patch(':id')
  @ApiModule('SystemConfigModule')
  @ApiOperation({ summary: '更新系统参数' })
  update(@Param('id') id: string, @Body() dto: UpdateSystemConfigDto) {
    return this.systemConfigsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiModule('SystemConfigModule')
  @ApiOperation({ summary: '删除系统参数' })
  remove(@Param('id') id: string) {
    return this.systemConfigsService.remove(id);
  }
}
