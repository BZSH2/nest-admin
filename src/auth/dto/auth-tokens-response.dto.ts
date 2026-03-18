import { ApiProperty } from '@nestjs/swagger';
import { BaseSuccessResponseDto } from '../../common/dto/base-success-response.dto';
import { AuthTokensDto } from './auth-tokens.dto';

export class AuthTokensResponseDto extends BaseSuccessResponseDto {
  @ApiProperty({ type: AuthTokensDto })
  data: AuthTokensDto;
}
