import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ResetUserPasswordDto {
  @ApiProperty({ example: 'Password123!', description: '新密码' })
  @IsNotEmpty({ message: '新密码不能为空' })
  @IsString()
  @Length(6, 20, { message: '密码长度在6-20位之间' })
  newPassword: string;
}
