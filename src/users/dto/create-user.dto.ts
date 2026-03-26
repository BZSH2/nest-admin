import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: '13800138000', description: '手机号' })
  @IsNotEmpty({ message: '手机号不能为空' })
  @Length(11, 11, { message: '手机号长度必须为11位' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phoneNumber: string;

  @ApiProperty({ example: 'Password123!', description: '密码' })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  @Length(6, 20, { message: '密码长度在6-20位之间' })
  password: string;

  @ApiProperty({ example: 'John Doe', description: '昵称', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 20, { message: '昵称长度在2-20位之间' })
  nickname?: string;

  @ApiProperty({
    example: 'https://cdn.example.com/avatar.png',
    description: '头像',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  avatar?: string;

  @ApiProperty({ example: true, description: '是否启用', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  status?: boolean = true;

  @ApiProperty({ example: '测试账号', description: '备注', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  remark?: string;
}
