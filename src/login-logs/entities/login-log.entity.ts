import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('login_logs')
export class LoginLog {
  @PrimaryGeneratedColumn('uuid', { comment: '登录日志ID' })
  id: string;

  @Column({ type: 'char', length: 36, nullable: true, comment: '用户ID' })
  userId: string | null;

  @Column({ length: 20, comment: '手机号' })
  phoneNumber: string;

  @Column({ default: false, comment: '是否登录成功' })
  success: boolean;

  @Column({ type: 'varchar', length: 64, nullable: true, comment: '登录IP' })
  ip: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: 'User-Agent' })
  userAgent: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '失败原因' })
  failureReason: string | null;

  @CreateDateColumn({ comment: '登录时间' })
  createdAt: Date;
}
