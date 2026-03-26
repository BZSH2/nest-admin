import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('operation_logs')
export class OperationLog {
  @PrimaryGeneratedColumn('uuid', { comment: '操作日志ID' })
  id: string;

  @Column({ type: 'char', length: 36, nullable: true, comment: '操作人ID' })
  operatorUserId: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '操作人手机号' })
  operatorPhoneNumber: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true, comment: '模块名称' })
  moduleName: string | null;

  @Column({ type: 'varchar', length: 20, comment: '请求方法' })
  method: string;

  @Column({ type: 'varchar', length: 255, comment: '请求路径' })
  path: string;

  @Column({ type: 'int', default: 200, comment: '响应状态码' })
  statusCode: number;

  @Column({ type: 'int', default: 0, comment: '耗时毫秒' })
  durationMs: number;

  @Column({ type: 'varchar', length: 64, nullable: true, comment: 'IP地址' })
  ip: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: 'User-Agent' })
  userAgent: string | null;

  @Column({ type: 'text', nullable: true, comment: '请求摘要' })
  requestSummary: string | null;

  @Column({ type: 'text', nullable: true, comment: '响应摘要' })
  responseSummary: string | null;

  @CreateDateColumn({ comment: '操作时间' })
  createdAt: Date;
}
