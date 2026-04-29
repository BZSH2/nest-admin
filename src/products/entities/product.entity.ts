import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid', { comment: '产品ID' })
  id: string;

  @Column({ length: 100, comment: '产品名称' })
  name: string;

  @Column({ unique: true, length: 50, comment: '产品代码' })
  code: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '产品描述' })
  description: string | null;

  @Column({ default: true, comment: '产品状态' })
  status: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @DeleteDateColumn({ comment: '软删除时间' })
  deletedAt: Date | null;
}
