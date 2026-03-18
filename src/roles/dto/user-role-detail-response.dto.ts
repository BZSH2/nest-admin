import { ApiProperty } from '@nestjs/swagger';
import { BaseSuccessResponseDto } from '../../common/dto/base-success-response.dto';
import { UserRoleDetailDto } from './user-role-detail.dto';

export class UserRoleDetailResponseDto extends BaseSuccessResponseDto {
  @ApiProperty({ type: UserRoleDetailDto })
  data: UserRoleDetailDto;
}
