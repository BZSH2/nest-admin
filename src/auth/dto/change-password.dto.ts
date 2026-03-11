import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123!', description: '旧密码' })
  @IsNotEmpty({ message: '旧密码不能为空' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ example: 'NewPassword123!', description: '新密码' })
  @IsNotEmpty({ message: '新密码不能为空' })
  @IsString()
  @Length(6, 20, { message: '新密码长度在6-20位之间' })
  newPassword: string;
}
