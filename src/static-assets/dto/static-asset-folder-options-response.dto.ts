import { ApiProperty } from '@nestjs/swagger';
import { BaseSuccessResponseDto } from '../../common/dto/base-success-response.dto';
import { StaticAssetFolderOptionDto } from './static-asset-folder-option.dto';

export class StaticAssetFolderOptionsResponseDto extends BaseSuccessResponseDto {
  @ApiProperty({ type: [StaticAssetFolderOptionDto] })
  data: StaticAssetFolderOptionDto[];
}
