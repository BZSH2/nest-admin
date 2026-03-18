import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../auth/enums/user-role.enum';

export class UserRoleDetailDto {
  @ApiProperty({ description: '用户ID', example: 'a8b53e4d-4b91-4f98-9ce3-8b8ab0ef85b6' })
  userId: string;

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

  @ApiProperty({ enum: UserRole, example: UserRole.USER, description: '当前角色' })
  role: UserRole;
}
