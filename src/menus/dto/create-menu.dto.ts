import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Min,
} from 'class-validator';
import type { MenuType } from '../entities/menu.entity';

export class CreateMenuDto {
  @ApiProperty({ example: 'system_role', description: '菜单编码' })
  @IsNotEmpty({ message: '菜单编码不能为空' })
  @IsString()
  @Length(2, 50)
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: '菜单编码仅支持字母、数字、下划线和中划线' })
  code: string;

  @ApiProperty({ example: '角色管理', description: '菜单名称' })
  @IsNotEmpty({ message: '菜单名称不能为空' })
  @IsString()
  @Length(2, 50)
  name: string;

  @ApiProperty({ required: false, example: null, description: '父级菜单ID' })
  @IsOptional()
  @IsUUID('4', { message: '父级菜单ID格式不正确' })
  parentId?: string | null;

  @ApiProperty({ enum: ['directory', 'menu', 'button'], example: 'menu' })
  @IsIn(['directory', 'menu', 'button'])
  type: MenuType;

  @ApiProperty({ required: false, example: '/system/roleManagement' })
  @IsOptional()
  @IsString()
  @Length(0, 120)
  path?: string | null;

  @ApiProperty({ required: false, example: '@/views/system/roleManagement/index.vue' })
  @IsOptional()
  @IsString()
  @Length(0, 160)
  component?: string | null;

  @ApiProperty({ required: false, example: 'system:role:view' })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  permission?: string | null;

  @ApiProperty({ required: false, example: 'menus-blink' })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  icon?: string | null;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort?: number = 0;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  visible?: boolean = true;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  enabled?: boolean = true;

  @ApiProperty({ required: false, example: '系统管理菜单' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  remark?: string | null;
}
