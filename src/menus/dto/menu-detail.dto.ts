import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { MenuType } from '../entities/menu.entity';

export class MenuDetailDto {
  @ApiProperty({ description: '菜单ID', example: '7a8c3aa4-2e05-4a8f-8df5-16ced58ba31f' })
  id: string;

  @ApiProperty({ description: '菜单编码', example: 'system_menu' })
  code: string;

  @ApiProperty({ description: '菜单名称', example: '菜单管理' })
  name: string;

  @ApiPropertyOptional({ description: '所属产品ID', example: null, nullable: true })
  productId?: string | null;

  @ApiPropertyOptional({ description: '父级菜单ID', example: null, nullable: true })
  parentId?: string | null;

  @ApiProperty({ description: '菜单类型', enum: ['directory', 'menu', 'button'], example: 'menu' })
  type: MenuType;

  @ApiPropertyOptional({ description: '路由路径', example: '/system/menus', nullable: true })
  path?: string | null;

  @ApiPropertyOptional({
    description: '前端组件路径',
    example: '@/views/system/menuManagement/index.vue',
    nullable: true,
  })
  component?: string | null;

  @ApiPropertyOptional({ description: '权限标识', example: 'system:menu:view', nullable: true })
  permission?: string | null;

  @ApiPropertyOptional({ description: '图标', example: 'Menu', nullable: true })
  icon?: string | null;

  @ApiProperty({ description: '排序', example: 10 })
  sort: number;

  @ApiProperty({ description: '是否可见', example: true })
  visible: boolean;

  @ApiProperty({ description: '是否启用', example: true })
  enabled: boolean;

  @ApiPropertyOptional({ description: '备注', example: '系统管理菜单', nullable: true })
  remark?: string | null;

  @ApiProperty({ description: '创建时间', example: '2026-04-30T02:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2026-04-30T02:10:00.000Z' })
  updatedAt: Date;
}
