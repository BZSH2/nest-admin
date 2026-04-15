import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { FormSchema } from '../custom-form.types';

@Entity('custom_forms')
export class CustomForm {
  @PrimaryGeneratedColumn('uuid', { comment: '自定义表单ID' })
  id: string;

  @Column({ unique: true, length: 80, comment: '表单唯一编码' })
  code: string;

  @Column({ length: 120, comment: '表单名称' })
  name: string;

  @Column({ type: 'json', comment: '表单 Schema，单个表单按 Form.Item[] 存储' })
  schema: FormSchema;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '备注' })
  remark: string | null;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @DeleteDateColumn({ comment: '软删除时间' })
  deletedAt: Date | null;
}
