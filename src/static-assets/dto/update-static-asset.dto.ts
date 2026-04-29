import { PartialType } from '@nestjs/swagger';
import { UploadStaticAssetDto } from './upload-static-asset.dto';

export class UpdateStaticAssetDto extends PartialType(UploadStaticAssetDto) {}
