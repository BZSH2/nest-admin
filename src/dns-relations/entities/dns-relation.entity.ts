import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type DnsRelationEnvironment = 'dev' | 'test' | 'staging' | 'uat' | 'prod';
export type DnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX' | 'NS' | 'SRV';

@Entity('dns_relations')
export class DnsRelation {
  @PrimaryGeneratedColumn('uuid', { comment: 'DNS关联ID' })
  id: string;

  @Column({ length: 100, comment: '项目名称' })
  projectName: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '服务名称' })
  serviceName: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '环境' })
  environment: DnsRelationEnvironment | null;

  @Column({ length: 255, comment: '域名' })
  domain: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: 'DNS服务商' })
  provider: string | null;

  @Column({ type: 'varchar', length: 20, default: 'A', comment: '记录类型' })
  recordType: DnsRecordType;

  @Column({ type: 'varchar', length: 500, comment: '解析值或目标' })
  recordValue: string;

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
