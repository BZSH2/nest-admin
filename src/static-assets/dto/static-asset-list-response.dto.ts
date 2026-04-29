import { ApiProperty } from '@nestjs/swagger';
import { BaseSuccessResponseDto } from '../../common/dto/base-success-response.dto';
import { StaticAssetDetailDto } from './static-asset-detail.dto';

class StaticAssetListDto {
  @ApiProperty({ type: [StaticAssetDetailDto] })
  items: StaticAssetDetailDto[];

  @ApiProperty({ example: 12 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  pageSize: number;
}

export class StaticAssetListResponseDto extends BaseSuccessResponseDto {
  @ApiProperty({ type: StaticAssetListDto })
  data: StaticAssetListDto;
}
