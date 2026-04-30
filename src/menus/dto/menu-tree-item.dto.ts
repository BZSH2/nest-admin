import { ApiProperty } from '@nestjs/swagger';
import { MenuDetailDto } from './menu-detail.dto';

export class MenuTreeItemDto extends MenuDetailDto {
  @ApiProperty({ type: () => [MenuTreeItemDto], description: '子菜单树' })
  children: MenuTreeItemDto[];
}
