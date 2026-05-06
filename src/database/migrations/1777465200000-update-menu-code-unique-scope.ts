import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class UpdateMenuCodeUniqueScope1777465200000 implements MigrationInterface {
  name = 'UpdateMenuCodeUniqueScope1777465200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasMenusTable = await queryRunner.hasTable('menus');
    if (!hasMenusTable) {
      return;
    }

    const table = await queryRunner.getTable('menus');
    const existingUniqueIndex = table?.indices.find(
      (index) =>
        index.isUnique && index.columnNames.length === 1 && index.columnNames[0] === 'code',
    );

    if (existingUniqueIndex) {
      await queryRunner.dropIndex('menus', existingUniqueIndex);
    }

    const nextTable = await queryRunner.getTable('menus');
    const hasScopedUniqueIndex = nextTable?.indices.some(
      (index) => index.name === 'UQ_menus_product_code',
    );

    if (!hasScopedUniqueIndex) {
      await queryRunner.createIndex(
        'menus',
        new TableIndex({
          name: 'UQ_menus_product_code',
          columnNames: ['productId', 'code'],
          isUnique: true,
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
    const scopedUniqueIndex = table?.indices.find(
      (index) => index.name === 'UQ_menus_product_code',
    );

    if (scopedUniqueIndex) {
      await queryRunner.dropIndex('menus', scopedUniqueIndex);
    }

    const nextTable = await queryRunner.getTable('menus');
    const hasCodeUniqueIndex = nextTable?.indices.some(
      (index) =>
        index.isUnique && index.columnNames.length === 1 && index.columnNames[0] === 'code',
    );

    if (!hasCodeUniqueIndex) {
      await queryRunner.createIndex(
        'menus',
        new TableIndex({
          name: 'UQ_menus_code',
          columnNames: ['code'],
          isUnique: true,
        }),
      );
    }
  }
}
