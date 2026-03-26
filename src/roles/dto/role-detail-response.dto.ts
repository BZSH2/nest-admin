import { ApiProperty } from '@nestjs/swagger';
import { BaseSuccessResponseDto } from '../../common/dto/base-success-response.dto';
import { RoleDetailDto } from './role-detail.dto';

export class RoleDetailResponseDto extends BaseSuccessResponseDto {
  @ApiProperty({ type: RoleDetailDto })
  data: RoleDetailDto;
}
