import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import type { SystemConfigValueType } from '../entities/system-config.entity';

export class CreateSystemConfigDto {
  @ApiProperty({ example: 'auth.allow_register' })
  @IsNotEmpty({ message: '配置键不能为空' })
  @IsString()
  @Length(2, 80)
  @Matches(/^[a-zA-Z0-9._:-]+$/, { message: '配置键格式不正确' })
  key: string;

  @ApiProperty({ example: '允许注册' })
  @IsNotEmpty({ message: '配置名称不能为空' })
  @IsString()
  @Length(2, 80)
  name: string;

  @ApiProperty({ enum: ['string', 'number', 'boolean', 'json'], example: 'boolean' })
  @IsIn(['string', 'number', 'boolean', 'json'])
  valueType: SystemConfigValueType;

  @ApiProperty({ example: 'true' })
  @IsString()
  value: string;

  @ApiProperty({ required: false, example: 'auth' })
  @IsOptional()
  @IsString()
  @Length(0, 80)
  groupName?: string | null;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean = false;

  @ApiProperty({ required: false, example: '注册相关配置' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  remark?: string | null;
}
