import { ApiProperty } from '@nestjs/swagger';
import { BaseSuccessResponseDto } from '../../common/dto/base-success-response.dto';
import { RoleMemberDto } from './role-member.dto';

class RoleMemberListDto {
  @ApiProperty({ type: [RoleMemberDto] })
  items: RoleMemberDto[];

  @ApiProperty({ example: 2 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  pageSize: number;
}

export class RoleMemberListResponseDto extends BaseSuccessResponseDto {
  @ApiProperty({ type: RoleMemberListDto })
  data: RoleMemberListDto;
}
