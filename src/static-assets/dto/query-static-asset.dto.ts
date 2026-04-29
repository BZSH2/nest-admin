import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { STATIC_ASSET_FILE_TYPES, type StaticAssetFileType } from '../static-assets.utils';

export class QueryStaticAssetDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  @ApiPropertyOptional({ example: 'logo' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ example: 'branding' })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiPropertyOptional({ enum: STATIC_ASSET_FILE_TYPES, example: 'image' })
  @IsOptional()
  @IsIn(STATIC_ASSET_FILE_TYPES)
  fileType?: StaticAssetFileType;

  @ApiPropertyOptional({
    description: '是否仅查询图片资源；为 true 时优先按 image 类型筛选',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return value;
  })
  @IsBoolean()
  imagesOnly?: boolean;

  @ApiPropertyOptional({
    description: '是否仅查询未分组资源；为 true 时忽略 folder 精确筛选',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return value;
  })
  @IsBoolean()
  uncategorizedOnly?: boolean;
}
