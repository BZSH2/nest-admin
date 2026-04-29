import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateProductsTable1777200000000 implements MigrationInterface {
  name = 'CreateProductsTable1777200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('products');
    if (hasTable) {
      return;
    }

    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            isPrimary: true,
            comment: '产品ID',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: '产品名称',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isNullable: false,
            isUnique: true,
            comment: '产品代码',
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: '产品描述',
          },
          {
            name: 'status',
            type: 'tinyint',
            default: 1,
            isNullable: false,
            comment: '产品状态',
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
      'products',
      new TableIndex({
        name: 'IDX_products_deletedAt',
        columnNames: ['deletedAt'],
      }),
    );

    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_products_name',
        columnNames: ['name'],
      }),
    );

    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_products_status',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('products');
    if (!hasTable) {
      return;
    }

    await queryRunner.dropIndex('products', 'IDX_products_status');
    await queryRunner.dropIndex('products', 'IDX_products_name');
    await queryRunner.dropIndex('products', 'IDX_products_deletedAt');
    await queryRunner.dropTable('products');
  }
}
