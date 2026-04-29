import { ApiProperty } from '@nestjs/swagger';
import { BaseSuccessResponseDto } from '../../common/dto/base-success-response.dto';
import { BatchDeleteStaticAssetsResultDto } from './batch-delete-static-assets-result.dto';

export class BatchDeleteStaticAssetsResponseDto extends BaseSuccessResponseDto {
  @ApiProperty({ type: BatchDeleteStaticAssetsResultDto })
  data: BatchDeleteStaticAssetsResultDto;
}
