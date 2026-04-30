import { ApiProperty } from '@nestjs/swagger';
import { BaseSuccessResponseDto } from '../../common/dto/base-success-response.dto';
import { MenuTreeItemDto } from './menu-tree-item.dto';

export class MenuTreeResponseDto extends BaseSuccessResponseDto {
  @ApiProperty({ type: [MenuTreeItemDto], description: '菜单树' })
  data: MenuTreeItemDto[];
}
