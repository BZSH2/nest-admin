import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type SystemConfigValueType = 'string' | 'number' | 'boolean' | 'json';

@Entity('system_configs')
export class SystemConfig {
  @PrimaryGeneratedColumn('uuid', { comment: '配置ID' })
  id: string;

  @Column({ unique: true, length: 80, comment: '配置键' })
  key: string;

  @Column({ length: 80, comment: '配置名称' })
  name: string;

  @Column({ type: 'varchar', length: 20, default: 'string', comment: '值类型' })
  valueType: SystemConfigValueType;

  @Column({ type: 'text', comment: '配置值' })
  value: string;

  @Column({ type: 'varchar', length: 80, nullable: true, comment: '分组' })
  groupName: string | null;

  @Column({ default: false, comment: '是否系统内置' })
  isSystem: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '备注' })
  remark: string | null;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @DeleteDateColumn({ comment: '软删除时间' })
  deletedAt: Date | null;
}
