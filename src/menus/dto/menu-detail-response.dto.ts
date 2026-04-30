import { ApiProperty } from '@nestjs/swagger';
import { BaseSuccessResponseDto } from '../../common/dto/base-success-response.dto';
import { MenuDetailDto } from './menu-detail.dto';

export class MenuDetailResponseDto extends BaseSuccessResponseDto {
  @ApiProperty({ type: MenuDetailDto })
  data: MenuDetailDto;
}
