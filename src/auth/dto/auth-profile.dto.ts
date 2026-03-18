import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enums/user-role.enum';

export class AuthProfileDto {
  @ApiProperty({ description: '用户ID', example: 'a8b53e4d-4b91-4f98-9ce3-8b8ab0ef85b6' })
  id: string;

  @ApiProperty({ description: '手机号', example: '13800138000' })
  phoneNumber: string;

  @ApiProperty({ description: '昵称', example: '测试用户', required: false, nullable: true })
  nickname?: string | null;

  @ApiProperty({
    description: '头像地址',
    example: 'https://cdn.example.com/avatar.png',
    required: false,
    nullable: true,
  })
  avatar?: string | null;

  @ApiProperty({ enum: UserRole, description: '当前用户角色', example: UserRole.USER })
  role: UserRole;

  @ApiProperty({ description: '创建时间', example: '2026-03-18T04:00:00.000Z' })
  createdAt?: Date;

  @ApiProperty({ description: '更新时间', example: '2026-03-18T04:10:00.000Z' })
  updatedAt?: Date;
}
