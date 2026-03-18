import { ApiProperty } from '@nestjs/swagger';

export class BaseSuccessResponseDto {
  @ApiProperty({ example: 200, description: '业务状态码' })
  code: number;

  @ApiProperty({ example: '请求成功', description: '响应消息' })
  message: string;
}
