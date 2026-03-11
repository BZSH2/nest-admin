import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class LoginDto {
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
}
