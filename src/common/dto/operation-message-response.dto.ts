import { ApiProperty } from '@nestjs/swagger';
import { BaseSuccessResponseDto } from './base-success-response.dto';
import { OperationMessageDto } from './operation-message.dto';

export class OperationMessageResponseDto extends BaseSuccessResponseDto {
  @ApiProperty({ type: OperationMessageDto })
  data: OperationMessageDto;
}
