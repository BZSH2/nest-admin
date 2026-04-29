import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UploadStaticAssetDto {
  @ApiPropertyOptional({
    description: '资源名称，不传时默认使用原始文件名（去扩展名）',
    example: '站点 Logo',
  })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string;

  @ApiPropertyOptional({
    description: '资源目录/分组，例如 branding、docs、banners',
    example: 'branding',
  })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  folder?: string;

  @ApiPropertyOptional({ description: '备注', example: '官网顶部使用' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  remark?: string;
}
