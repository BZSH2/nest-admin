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
import { CreateDnsRelationDto } from './dto/create-dns-relation.dto';
import { QueryDnsRelationDto } from './dto/query-dns-relation.dto';
import { UpdateDnsRelationDto } from './dto/update-dns-relation.dto';
import { DnsRelationsService } from './dns-relations.service';

@ApiTags('DnsRelations')
@Controller('dns-relations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
export class DnsRelationsController {
  constructor(private readonly dnsRelationsService: DnsRelationsService) {}

  @Get()
  @ApiModule('DnsRelationModule')
  @ApiOperation({ summary: '分页查询 DNS 关联' })
  findAll(@Query() query: QueryDnsRelationDto) {
    return this.dnsRelationsService.findAll(query);
  }

  @Get(':id')
  @ApiModule('DnsRelationModule')
  @ApiOperation({ summary: '查询 DNS 关联详情' })
  findOne(@Param('id') id: string) {
    return this.dnsRelationsService.findOne(id);
  }

  @Post()
  @ApiModule('DnsRelationModule')
  @ApiOperation({ summary: '创建 DNS 关联' })
  create(@Body() dto: CreateDnsRelationDto) {
    return this.dnsRelationsService.create(dto);
  }

  @Patch(':id')
  @ApiModule('DnsRelationModule')
  @ApiOperation({ summary: '更新 DNS 关联' })
  update(@Param('id') id: string, @Body() dto: UpdateDnsRelationDto) {
    return this.dnsRelationsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiModule('DnsRelationModule')
  @ApiOperation({ summary: '删除 DNS 关联' })
  remove(@Param('id') id: string) {
    return this.dnsRelationsService.remove(id);
  }
}
