import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid', { comment: '角色ID' })
  id: string;

  @Column({ unique: true, length: 50, comment: '角色编码' })
  code: string;

  @Column({ length: 50, comment: '角色名称' })
  name: string;

  @Column({ length: 255, nullable: true, comment: '角色描述' })
  description: string | null;

  @Column({ default: 0, comment: '排序' })
  sort: number;

  @Column({ default: true, comment: '是否启用' })
  enabled: boolean;

  @Column({ default: false, comment: '是否系统内置角色' })
  isSystem: boolean;

  @Column({ default: false, comment: '是否默认角色' })
  isDefault: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @DeleteDateColumn({ comment: '软删除时间' })
  deletedAt: Date;
}
