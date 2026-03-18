import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRole } from '../../auth/enums/user-role.enum';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN, description: '目标角色' })
  @IsEnum(UserRole, { message: '角色值不合法' })
  role: UserRole;
}
