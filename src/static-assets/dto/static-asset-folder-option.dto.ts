import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StaticAssetFolderOptionDto {
  @ApiPropertyOptional({
    description: '资源目录值；未分组时为 null',
    example: 'branding',
    nullable: true,
  })
  folder?: string | null;

  @ApiProperty({ description: '前端展示标签', example: 'branding' })
  label: string;

  @ApiProperty({ description: '是否属于未分组资源', example: false })
  uncategorized: boolean;

  @ApiProperty({ description: '该目录下资源数量', example: 12 })
  count: number;
}
