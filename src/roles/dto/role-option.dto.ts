import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../auth/enums/user-role.enum';

export class RoleOptionDto {
  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN, description: '角色值' })
  value: UserRole;

  @ApiProperty({ example: '管理员', description: '角色展示名称' })
  label: string;
}
