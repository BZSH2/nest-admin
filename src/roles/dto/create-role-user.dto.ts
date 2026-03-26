import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRoleUserDto {
  @ApiProperty({ description: '用户ID', example: 'a8b53e4d-4b91-4f98-9ce3-8b8ab0ef85b6' })
  @IsNotEmpty({ message: '用户ID不能为空' })
  @IsUUID('4', { message: '用户ID格式不正确' })
  userId: string;
}
