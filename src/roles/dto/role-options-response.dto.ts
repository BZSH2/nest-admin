import { ApiProperty } from '@nestjs/swagger';
import { BaseSuccessResponseDto } from '../../common/dto/base-success-response.dto';
import { RoleOptionDto } from './role-option.dto';

export class RoleOptionsResponseDto extends BaseSuccessResponseDto {
  @ApiProperty({ type: [RoleOptionDto] })
  data: RoleOptionDto[];
}
