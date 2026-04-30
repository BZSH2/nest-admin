import { ApiProperty } from '@nestjs/swagger';
import { BaseSuccessResponseDto } from '../../common/dto/base-success-response.dto';
import { MenuTreeItemDto } from './menu-tree-item.dto';

class MenuListDto {
  @ApiProperty({ type: [MenuTreeItemDto], description: '菜单树列表' })
  items: MenuTreeItemDto[];

  @ApiProperty({ example: 12 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 12 })
  pageSize: number;
}

export class MenuListResponseDto extends BaseSuccessResponseDto {
  @ApiProperty({ type: MenuListDto })
  data: MenuListDto;
}
