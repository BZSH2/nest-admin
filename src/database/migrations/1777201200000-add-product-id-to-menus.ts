import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddProductIdToMenus1777201200000 implements MigrationInterface {
  name = 'AddProductIdToMenus1777201200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasMenusTable = await queryRunner.hasTable('menus');
    if (!hasMenusTable) {
      return;
    }

    const table = await queryRunner.getTable('menus');
    const hasProductIdColumn = table?.findColumnByName('productId');

    if (!hasProductIdColumn) {
      await queryRunner.addColumn(
        'menus',
        new TableColumn({
          name: 'productId',
          type: 'varchar',
          length: '36',
          isNullable: true,
          comment: '所属产品ID',
        }),
      );
    }

    const nextTable = await queryRunner.getTable('menus');
    const hasProductIdIndex = nextTable?.indices.some(
      (index) => index.name === 'IDX_menus_productId',
    );

    if (!hasProductIdIndex) {
      await queryRunner.createIndex(
        'menus',
        new TableIndex({
          name: 'IDX_menus_productId',
          columnNames: ['productId'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasMenusTable = await queryRunner.hasTable('menus');
    if (!hasMenusTable) {
      return;
    }

    const table = await queryRunner.getTable('menus');
    const hasProductIdIndex = table?.indices.some((index) => index.name === 'IDX_menus_productId');

    if (hasProductIdIndex) {
      await queryRunner.dropIndex('menus', 'IDX_menus_productId');
    }

    const nextTable = await queryRunner.getTable('menus');
    const hasProductIdColumn = nextTable?.findColumnByName('productId');

    if (hasProductIdColumn) {
      await queryRunner.dropColumn('menus', 'productId');
    }
  }
}
