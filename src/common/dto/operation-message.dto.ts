import { ApiProperty } from '@nestjs/swagger';

export class OperationMessageDto {
  @ApiProperty({ example: '操作成功', description: '操作结果消息' })
  message: string;
}
