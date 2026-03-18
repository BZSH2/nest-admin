import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../../auth/enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid', { comment: '用户ID' })
  id: string;

  @Column({ unique: true, length: 20, comment: '手机号' })
  phoneNumber: string;

  @Column({ select: false, comment: '加密密码' })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    nullable: true,
    comment: '用户角色',
  })
  role: UserRole | null;

  @Column({ length: 50, nullable: true, comment: '昵称' })
  nickname: string;

  @Column({ nullable: true, comment: '头像URL' })
  avatar: string;

  @Column({ nullable: true, select: false, comment: '当前刷新令牌哈希', type: 'varchar' })
  currentHashedRefreshToken: string | null;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @DeleteDateColumn({ comment: '软删除时间' })
  deletedAt: Date;
}
