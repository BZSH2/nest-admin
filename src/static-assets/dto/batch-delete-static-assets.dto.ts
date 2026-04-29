import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class BatchDeleteStaticAssetsDto {
  @ApiProperty({
    description: '待批量删除的静态资源 ID 列表',
    type: [String],
    example: ['7a8c3aa4-2e05-4a8f-8df5-16ced58ba31f', '8b3a4bd7-9858-4e8d-98bf-867661244f4b'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  ids: string[];
}
