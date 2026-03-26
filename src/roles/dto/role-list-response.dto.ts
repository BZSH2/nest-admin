import { ApiProperty } from '@nestjs/swagger';
import { BaseSuccessResponseDto } from '../../common/dto/base-success-response.dto';
import { RoleDetailDto } from './role-detail.dto';

class RoleListDto {
  @ApiProperty({ type: [RoleDetailDto] })
  items: RoleDetailDto[];

  @ApiProperty({ example: 2 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  pageSize: number;
}

export class RoleListResponseDto extends BaseSuccessResponseDto {
  @ApiProperty({ type: RoleListDto })
  data: RoleListDto;
}
