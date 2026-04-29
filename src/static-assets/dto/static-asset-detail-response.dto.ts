import { ApiProperty } from '@nestjs/swagger';
import { BaseSuccessResponseDto } from '../../common/dto/base-success-response.dto';
import { StaticAssetDetailDto } from './static-asset-detail.dto';

export class StaticAssetDetailResponseDto extends BaseSuccessResponseDto {
  @ApiProperty({ type: StaticAssetDetailDto })
  data: StaticAssetDetailDto;
}
