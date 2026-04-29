import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StaticAssetDetailDto {
  @ApiProperty({ description: '静态资源ID', example: '7a8c3aa4-2e05-4a8f-8df5-16ced58ba31f' })
  id: string;

  @ApiProperty({ description: '资源名称', example: '站点 Logo' })
  name: string;

  @ApiProperty({ description: '原始文件名', example: 'logo.png' })
  originalName: string;

  @ApiProperty({
    description: '资源类型',
    enum: ['image', 'video', 'audio', 'document', 'archive', 'other'],
    example: 'image',
  })
  fileType: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';

  @ApiProperty({ description: '文件扩展名', example: 'png' })
  extension: string;

  @ApiProperty({ description: 'MIME 类型', example: 'image/png' })
  mimeType: string;

  @ApiProperty({ description: '文件大小（字节）', example: 10240 })
  size: number;

  @ApiPropertyOptional({ description: '资源目录/分组', example: 'branding', nullable: true })
  folder?: string | null;

  @ApiProperty({ description: '存储相对路径', example: '2026/04/28/1714278900000-demo.png' })
  storagePath: string;

  @ApiProperty({
    description: '资源访问路径',
    example: '/static-assets/2026/04/28/1714278900000-demo.png',
  })
  accessPath: string;

  @ApiProperty({
    description: '资源访问 URL，未配置公网前缀时与 accessPath 一致',
    example: 'https://static.example.com/static-assets/2026/04/28/1714278900000-demo.png',
  })
  accessUrl: string;

  @ApiProperty({
    description: '文件哈希（SHA-256）',
    example: 'c0535e4be2b79ffd93291305436bf889314e4a3faec05ecffcbb7df31fdf0bce',
  })
  hash: string;

  @ApiPropertyOptional({ description: '备注', example: '官网公共资源', nullable: true })
  remark?: string | null;

  @ApiProperty({ description: '创建时间', example: '2026-04-28T02:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2026-04-28T02:10:00.000Z' })
  updatedAt: Date;
}
