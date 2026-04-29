import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateStaticAssetsTable1777110000000 implements MigrationInterface {
  name = 'CreateStaticAssetsTable1777110000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('static_assets');
    if (hasTable) {
      return;
    }

    await queryRunner.createTable(
      new Table({
        name: 'static_assets',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            isPrimary: true,
            comment: '静态资源ID',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '120',
            isNullable: false,
            comment: '资源名称',
          },
          {
            name: 'originalName',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment: '原始文件名',
          },
          {
            name: 'fileType',
            type: 'varchar',
            length: '20',
            default: `'other'`,
            isNullable: false,
            comment: '资源类型',
          },
          {
            name: 'extension',
            type: 'varchar',
            length: '20',
            isNullable: false,
            comment: '文件扩展名',
          },
          {
            name: 'mimeType',
            type: 'varchar',
            length: '120',
            isNullable: false,
            comment: 'MIME 类型',
          },
          {
            name: 'size',
            type: 'int',
            isNullable: false,
            comment: '文件大小（字节）',
          },
          {
            name: 'folder',
            type: 'varchar',
            length: '120',
            isNullable: true,
            comment: '资源目录/分组',
          },
          {
            name: 'storagePath',
            type: 'varchar',
            length: '500',
            isNullable: false,
            isUnique: true,
            comment: '存储相对路径',
          },
          {
            name: 'hash',
            type: 'varchar',
            length: '64',
            isNullable: false,
            comment: '文件哈希（SHA-256）',
          },
          {
            name: 'remark',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: '备注',
          },
          {
            name: 'createdAt',
            type: 'datetime',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
            isNullable: false,
            comment: '创建时间',
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
            onUpdate: 'CURRENT_TIMESTAMP(6)',
            isNullable: false,
            comment: '更新时间',
          },
          {
            name: 'deletedAt',
            type: 'datetime',
            precision: 6,
            isNullable: true,
            comment: '软删除时间',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'static_assets',
      new TableIndex({
        name: 'IDX_static_assets_deletedAt',
        columnNames: ['deletedAt'],
      }),
    );

    await queryRunner.createIndex(
      'static_assets',
      new TableIndex({
        name: 'IDX_static_assets_fileType',
        columnNames: ['fileType'],
      }),
    );

    await queryRunner.createIndex(
      'static_assets',
      new TableIndex({
        name: 'IDX_static_assets_folder',
        columnNames: ['folder'],
      }),
    );

    await queryRunner.createIndex(
      'static_assets',
      new TableIndex({
        name: 'IDX_static_assets_hash',
        columnNames: ['hash'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('static_assets');
    if (!hasTable) {
      return;
    }

    await queryRunner.dropIndex('static_assets', 'IDX_static_assets_hash');
    await queryRunner.dropIndex('static_assets', 'IDX_static_assets_folder');
    await queryRunner.dropIndex('static_assets', 'IDX_static_assets_fileType');
    await queryRunner.dropIndex('static_assets', 'IDX_static_assets_deletedAt');
    await queryRunner.dropTable('static_assets');
  }
}
