import { ApiProperty } from '@nestjs/swagger';

export class RoleDetailDto {
  @ApiProperty({ description: '角色ID', example: 'a8b53e4d-4b91-4f98-9ce3-8b8ab0ef85b6' })
  id: string;

  @ApiProperty({ description: '角色编码', example: 'admin' })
  code: string;

  @ApiProperty({ description: '角色名称', example: '管理员' })
  name: string;

  @ApiProperty({
    description: '角色描述',
    example: '系统内置管理员角色',
    required: false,
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({ description: '排序值', example: 1 })
  sort: number;

  @ApiProperty({ description: '是否启用', example: true })
  enabled: boolean;

  @ApiProperty({ description: '是否系统内置角色', example: true })
  isSystem: boolean;

  @ApiProperty({ description: '是否默认角色', example: false })
  isDefault: boolean;

  @ApiProperty({ description: '绑定成员数', example: 3 })
  memberCount: number;

  @ApiProperty({ description: '创建时间', example: '2026-03-26T04:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2026-03-26T04:10:00.000Z' })
  updatedAt: Date;
}
