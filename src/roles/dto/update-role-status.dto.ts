import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class UpdateRoleStatusDto {
  @ApiProperty({ example: true, description: '是否启用' })
  @Type(() => Boolean)
  @IsBoolean({ message: '启用状态必须为布尔值' })
  enabled: boolean;
}
