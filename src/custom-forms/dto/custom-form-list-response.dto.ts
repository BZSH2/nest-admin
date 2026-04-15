import { ApiProperty } from '@nestjs/swagger';
import { BaseSuccessResponseDto } from '../../common/dto/base-success-response.dto';
import { CustomFormDetailDto } from './custom-form-detail.dto';

class CustomFormListDto {
  @ApiProperty({ type: [CustomFormDetailDto] })
  items: CustomFormDetailDto[];

  @ApiProperty({ example: 2 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  pageSize: number;
}

export class CustomFormListResponseDto extends BaseSuccessResponseDto {
  @ApiProperty({ type: CustomFormListDto })
  data: CustomFormListDto;
}
