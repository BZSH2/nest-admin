import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type MenuType = 'directory' | 'menu' | 'button';

@Entity('menus')
export class Menu {
  @PrimaryGeneratedColumn('uuid', { comment: '菜单ID' })
  id: string;

  @Column({ unique: true, length: 50, comment: '菜单编码' })
  code: string;

  @Column({ length: 50, comment: '菜单名称' })
  name: string;

  @Column({ type: 'char', length: 36, nullable: true, comment: '父级菜单ID' })
  parentId: string | null;

  @Column({ type: 'varchar', length: 20, comment: '菜单类型' })
  type: MenuType;

  @Column({ type: 'varchar', length: 120, nullable: true, comment: '路由路径' })
  path: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true, comment: '前端组件路径' })
  component: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '权限标识' })
  permission: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '图标' })
  icon: string | null;

  @Column({ default: 0, comment: '排序' })
  sort: number;

  @Column({ default: true, comment: '是否可见' })
  visible: boolean;

  @Column({ default: true, comment: '是否启用' })
  enabled: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '备注' })
  remark: string | null;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @DeleteDateColumn({ comment: '软删除时间' })
  deletedAt: Date | null;
}
