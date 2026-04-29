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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '../auth/enums/user-role.enum';
import { ApiModule } from '../common/decorators/api-module.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { OperationMessageResponseDto } from '../common/dto/operation-message-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BatchDeleteStaticAssetsDto } from './dto/batch-delete-static-assets.dto';
import { BatchDeleteStaticAssetsResponseDto } from './dto/batch-delete-static-assets-response.dto';
import { QueryStaticAssetDto } from './dto/query-static-asset.dto';
import { StaticAssetDetailResponseDto } from './dto/static-asset-detail-response.dto';
import { StaticAssetFolderOptionsResponseDto } from './dto/static-asset-folder-options-response.dto';
import { StaticAssetListResponseDto } from './dto/static-asset-list-response.dto';
import { UpdateStaticAssetDto } from './dto/update-static-asset.dto';
import { UploadStaticAssetDto } from './dto/upload-static-asset.dto';
import { StaticAssetsService } from './static-assets.service';
import { DEFAULT_STATIC_ASSET_MAX_SIZE_MB } from './static-assets.utils';

type UploadedStaticAssetFile = {
  originalname?: string;
  mimetype?: string;
  size?: number;
  buffer?: Buffer;
};

@ApiTags('StaticAssets')
@Controller('static-assets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
export class StaticAssetsController {
  constructor(private readonly staticAssetsService: StaticAssetsService) {}

  @Get()
  @ApiModule('StaticAssetModule')
  @ApiOperation({ summary: '分页查询静态资源' })
  @ApiOkResponse({ description: '获取成功', type: StaticAssetListResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  findAll(@Query() query: QueryStaticAssetDto) {
    return this.staticAssetsService.findAll(query);
  }

  @Get('folders')
  @ApiModule('StaticAssetModule')
  @ApiOperation({ summary: '获取静态资源目录分组' })
  @ApiOkResponse({ description: '获取成功', type: StaticAssetFolderOptionsResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  findFolders() {
    return this.staticAssetsService.findFolders();
  }

  @Get(':id')
  @ApiModule('StaticAssetModule')
  @ApiOperation({ summary: '查询静态资源详情' })
  @ApiOkResponse({ description: '获取成功', type: StaticAssetDetailResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  @ApiResponse({ status: 404, description: '静态资源不存在' })
  findOne(@Param('id') id: string) {
    return this.staticAssetsService.findOne(id);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: DEFAULT_STATIC_ASSET_MAX_SIZE_MB * 1024 * 1024,
      },
    }),
  )
  @ApiModule('StaticAssetModule')
  @ApiOperation({ summary: '上传静态资源' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: `上传文件，当前默认限制 ${DEFAULT_STATIC_ASSET_MAX_SIZE_MB}MB`,
        },
        name: {
          type: 'string',
          description: '资源名称，不传时默认使用原始文件名（去扩展名）',
          example: '站点 Logo',
        },
        folder: {
          type: 'string',
          description: '资源目录/分组，例如 branding、docs、banners',
          example: 'branding',
        },
        remark: {
          type: 'string',
          description: '备注',
          example: '官网顶部使用',
        },
      },
    },
  })
  @ApiCreatedResponse({ description: '上传成功', type: StaticAssetDetailResponseDto })
  @ApiResponse({ status: 400, description: '未上传文件或表单字段不合法' })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  upload(@UploadedFile() file: UploadedStaticAssetFile | undefined, @Body() dto: UploadStaticAssetDto) {
    return this.staticAssetsService.upload(file, dto);
  }

  @Patch(':id')
  @ApiModule('StaticAssetModule')
  @ApiOperation({ summary: '更新静态资源元信息' })
  @ApiOkResponse({ description: '更新成功', type: StaticAssetDetailResponseDto })
  @ApiResponse({ status: 400, description: '参数不合法' })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  @ApiResponse({ status: 404, description: '静态资源不存在' })
  update(@Param('id') id: string, @Body() dto: UpdateStaticAssetDto) {
    return this.staticAssetsService.update(id, dto);
  }

  @Delete('batch')
  @HttpCode(HttpStatus.OK)
  @ApiModule('StaticAssetModule')
  @ApiOperation({ summary: '批量删除静态资源' })
  @ApiOkResponse({ description: '删除成功', type: BatchDeleteStaticAssetsResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  @ApiResponse({ status: 404, description: '未找到可删除的静态资源' })
  batchRemove(@Body() dto: BatchDeleteStaticAssetsDto) {
    return this.staticAssetsService.batchRemove(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiModule('StaticAssetModule')
  @ApiOperation({ summary: '删除静态资源' })
  @ApiOkResponse({ description: '删除成功', type: OperationMessageResponseDto })
  @ApiResponse({ status: 403, description: '需要管理员权限' })
  @ApiResponse({ status: 404, description: '静态资源不存在' })
  remove(@Param('id') id: string) {
    return this.staticAssetsService.remove(id);
  }
}
