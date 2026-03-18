import { ApiProperty } from '@nestjs/swagger';
import { BaseSuccessResponseDto } from '../../common/dto/base-success-response.dto';
import { AuthProfileDto } from './auth-profile.dto';

export class AuthProfileResponseDto extends BaseSuccessResponseDto {
  @ApiProperty({ type: AuthProfileDto })
  data: AuthProfileDto;
}
