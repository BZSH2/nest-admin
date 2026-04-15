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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '../auth/enums/user-role.enum';
import { ApiModule } from '../common/decorators/api-module.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { OperationMessageResponseDto } from '../common/dto/operation-message-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CustomFormsService } from './custom-forms.service';
import { CreateCustomFormDto } from './dto/create-custom-form.dto';
import { CustomFormDetailResponseDto } from './dto/custom-form-detail-response.dto';
import { CustomFormListResponseDto } from './dto/custom-form-list-response.dto';
import { QueryCustomFormDto } from './dto/query-custom-form.dto';
import { UpdateCustomFormDto } from './dto/update-custom-form.dto';

@ApiTags('CustomForms')
@Controller('custom-forms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
export class CustomFormsController {
  constructor(private readonly customFormsService: CustomFormsService) {}

  @Get()
  @ApiModule('CustomFormModule')
  @ApiOperation({ summary: '分页查询自定义表单' })
  @ApiOkResponse({ description: '获取成功', type: CustomFormListResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  findAll(@Query() query: QueryCustomFormDto) {
    return this.customFormsService.findAll(query);
  }

  @Get('code/:code')
  @ApiModule('CustomFormModule')
  @ApiOperation({ summary: '按编码查询自定义表单' })
  @ApiOkResponse({ description: '获取成功', type: CustomFormDetailResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  @ApiResponse({ status: 404, description: '自定义表单不存在' })
  findByCode(@Param('code') code: string) {
    return this.customFormsService.findByCode(code);
  }

  @Get(':id')
  @ApiModule('CustomFormModule')
  @ApiOperation({ summary: '查询自定义表单详情' })
  @ApiOkResponse({ description: '获取成功', type: CustomFormDetailResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  @ApiResponse({ status: 404, description: '自定义表单不存在' })
  findOne(@Param('id') id: string) {
    return this.customFormsService.findOne(id);
  }

  @Post()
  @ApiModule('CustomFormModule')
  @ApiOperation({ summary: '创建自定义表单' })
  @ApiCreatedResponse({ description: '创建成功', type: CustomFormDetailResponseDto })
  @ApiResponse({ status: 400, description: '表单 schema 或字段规则不合法' })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  @ApiResponse({ status: 409, description: '表单编码已存在' })
  create(@Body() dto: CreateCustomFormDto) {
    return this.customFormsService.create(dto);
  }

  @Patch(':id')
  @ApiModule('CustomFormModule')
  @ApiOperation({ summary: '更新自定义表单' })
  @ApiOkResponse({ description: '更新成功', type: CustomFormDetailResponseDto })
  @ApiResponse({ status: 400, description: '表单 schema 或字段规则不合法' })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  @ApiResponse({ status: 404, description: '自定义表单不存在' })
  @ApiResponse({ status: 409, description: '表单编码已存在' })
  update(@Param('id') id: string, @Body() dto: UpdateCustomFormDto) {
    return this.customFormsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiModule('CustomFormModule')
  @ApiOperation({ summary: '删除自定义表单' })
  @ApiOkResponse({ description: '删除成功', type: OperationMessageResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  @ApiResponse({ status: 404, description: '自定义表单不存在' })
  remove(@Param('id') id: string) {
    return this.customFormsService.remove(id);
  }
}
