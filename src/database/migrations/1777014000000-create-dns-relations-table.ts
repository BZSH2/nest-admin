import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateDnsRelationsTable1777014000000 implements MigrationInterface {
  name = 'CreateDnsRelationsTable1777014000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('dns_relations');
    if (hasTable) {
      return;
    }

    await queryRunner.createTable(
      new Table({
        name: 'dns_relations',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            isPrimary: true,
            comment: 'DNS关联ID',
          },
          {
            name: 'projectName',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: '项目名称',
          },
          {
            name: 'serviceName',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: '服务名称',
          },
          {
            name: 'environment',
            type: 'varchar',
            length: '20',
            isNullable: true,
            comment: '环境',
          },
          {
            name: 'domain',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment: '域名',
          },
          {
            name: 'provider',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'DNS服务商',
          },
          {
            name: 'recordType',
            type: 'varchar',
            length: '20',
            default: `'A'`,
            isNullable: false,
            comment: '记录类型',
          },
          {
            name: 'recordValue',
            type: 'varchar',
            length: '500',
            isNullable: false,
            comment: '解析值或目标',
          },
          {
            name: 'enabled',
            type: 'tinyint',
            default: 1,
            isNullable: false,
            comment: '是否启用',
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
      'dns_relations',
      new TableIndex({
        name: 'IDX_dns_relations_deletedAt',
        columnNames: ['deletedAt'],
      }),
    );

    await queryRunner.createIndex(
      'dns_relations',
      new TableIndex({
        name: 'IDX_dns_relations_domain',
        columnNames: ['domain'],
      }),
    );

    await queryRunner.createIndex(
      'dns_relations',
      new TableIndex({
        name: 'IDX_dns_relations_projectName',
        columnNames: ['projectName'],
      }),
    );

    await queryRunner.createIndex(
      'dns_relations',
      new TableIndex({
        name: 'IDX_dns_relations_environment',
        columnNames: ['environment'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('dns_relations');
    if (!hasTable) {
      return;
    }

    await queryRunner.dropIndex('dns_relations', 'IDX_dns_relations_environment');
    await queryRunner.dropIndex('dns_relations', 'IDX_dns_relations_projectName');
    await queryRunner.dropIndex('dns_relations', 'IDX_dns_relations_domain');
    await queryRunner.dropIndex('dns_relations', 'IDX_dns_relations_deletedAt');
    await queryRunner.dropTable('dns_relations');
  }
}
