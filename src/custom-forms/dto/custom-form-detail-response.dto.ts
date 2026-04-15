import { ApiProperty } from '@nestjs/swagger';
import { BaseSuccessResponseDto } from '../../common/dto/base-success-response.dto';
import { CustomFormDetailDto } from './custom-form-detail.dto';

export class CustomFormDetailResponseDto extends BaseSuccessResponseDto {
  @ApiProperty({ type: CustomFormDetailDto })
  data: CustomFormDetailDto;
}
