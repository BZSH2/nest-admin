import { ApiProperty } from '@nestjs/swagger';

export class BatchDeleteStaticAssetsResultDto {
  @ApiProperty({ description: '本次批量删除结果说明', example: '批量删除完成，成功删除 2 条静态资源' })
  message: string;

  @ApiProperty({ description: '请求删除的 ID 数量', example: 3 })
  requestedCount: number;

  @ApiProperty({ description: '实际删除成功的数量', example: 2 })
  deletedCount: number;

  @ApiProperty({
    description: '实际删除成功的资源 ID 列表',
    type: [String],
    example: ['7a8c3aa4-2e05-4a8f-8df5-16ced58ba31f', '8b3a4bd7-9858-4e8d-98bf-867661244f4b'],
  })
  ids: string[];

  @ApiProperty({
    description: '本次请求中未找到的资源 ID 列表',
    type: [String],
    example: ['4e091d4f-c01d-4614-a13d-a11d684dbf80'],
  })
  missingIds: string[];
}
