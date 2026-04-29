import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { StaticAssetFileType } from '../static-assets.utils';

@Entity('static_assets')
export class StaticAsset {
  @PrimaryGeneratedColumn('uuid', { comment: '静态资源ID' })
  id: string;

  @Column({ length: 120, comment: '资源名称' })
  name: string;

  @Column({ length: 255, comment: '原始文件名' })
  originalName: string;

  @Column({ type: 'varchar', length: 20, default: 'other', comment: '资源类型' })
  fileType: StaticAssetFileType;

  @Column({ type: 'varchar', length: 20, comment: '文件扩展名' })
  extension: string;

  @Column({ type: 'varchar', length: 120, comment: 'MIME 类型' })
  mimeType: string;

  @Column({ type: 'int', comment: '文件大小（字节）' })
  size: number;

  @Column({ type: 'varchar', length: 120, nullable: true, comment: '资源目录/分组' })
  folder: string | null;

  @Column({ type: 'varchar', length: 500, unique: true, comment: '存储相对路径' })
  storagePath: string;

  @Column({ type: 'varchar', length: 64, comment: '文件哈希（SHA-256）' })
  hash: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '备注' })
  remark: string | null;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @DeleteDateColumn({ comment: '软删除时间' })
  deletedAt: Date | null;
}
