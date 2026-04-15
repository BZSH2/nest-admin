import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateCustomFormsTable1776224000000 implements MigrationInterface {
  name = 'CreateCustomFormsTable1776224000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('custom_forms');
    if (hasTable) {
      return;
    }

    await queryRunner.createTable(
      new Table({
        name: 'custom_forms',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            isPrimary: true,
            comment: '自定义表单ID',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '80',
            isNullable: false,
            isUnique: true,
            comment: '表单唯一编码',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '120',
            isNullable: false,
            comment: '表单名称',
          },
          {
            name: 'schema',
            type: 'json',
            isNullable: false,
            comment: '表单 Schema，单个表单按 Form.Item[] 存储',
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
      'custom_forms',
      new TableIndex({
        name: 'IDX_custom_forms_deletedAt',
        columnNames: ['deletedAt'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('custom_forms');
    if (!hasTable) {
      return;
    }

    await queryRunner.dropIndex('custom_forms', 'IDX_custom_forms_deletedAt');
    await queryRunner.dropTable('custom_forms');
  }
}
