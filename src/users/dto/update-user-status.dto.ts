import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class UpdateUserStatusDto {
  @ApiProperty({ example: true, description: '是否启用' })
  @Type(() => Boolean)
  @IsBoolean({ message: '状态必须为布尔值' })
  status: boolean;
}
