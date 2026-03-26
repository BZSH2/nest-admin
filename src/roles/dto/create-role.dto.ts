import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    example: 'content_admin',
    description: '角色编码，仅支持字母、数字、下划线和中划线',
  })
  @IsNotEmpty({ message: '角色编码不能为空' })
  @IsString()
  @Length(2, 50, { message: '角色编码长度在2-50位之间' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: '角色编码格式不正确' })
  code: string;

  @ApiProperty({ example: '内容管理员', description: '角色名称' })
  @IsNotEmpty({ message: '角色名称不能为空' })
  @IsString()
  @Length(2, 50, { message: '角色名称长度在2-50位之间' })
  name: string;

  @ApiProperty({ example: '负责内容审核与发布管理', description: '角色描述', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 255, { message: '角色描述长度不能超过255位' })
  description?: string;

  @ApiProperty({ example: 10, description: '排序值', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort?: number = 0;

  @ApiProperty({ example: true, description: '是否启用', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  enabled?: boolean = true;

  @ApiProperty({ example: false, description: '是否默认角色', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isDefault?: boolean = false;
}
