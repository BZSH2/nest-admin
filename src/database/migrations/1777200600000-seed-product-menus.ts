import { randomUUID } from 'node:crypto';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedProductMenus1777200600000 implements MigrationInterface {
  name = 'SeedProductMenus1777200600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('menus');
    if (!hasTable) {
      return;
    }

    const systemRows: Array<{ id: string }> = await queryRunner.query(
      `
        SELECT id
        FROM menus
        WHERE deletedAt IS NULL
          AND (code = ? OR name = ?)
        ORDER BY sort ASC, createdAt ASC
        LIMIT 1
      `,
      ['system', '系统管理'],
    );

    const existingProductRows: Array<{ id: string }> = await queryRunner.query(
      `SELECT id FROM menus WHERE code = ? LIMIT 1`,
      ['system_product'],
    );

    const productMenuId = existingProductRows[0]?.id ?? randomUUID();
    const parentId = systemRows[0]?.id ?? null;

    if (!existingProductRows.length) {
      await queryRunner.query(
        `
          INSERT INTO menus (
            id, code, name, parentId, type, path, component, permission, icon,
            sort, visible, enabled, remark, createdAt, updatedAt, deletedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(6), NOW(6), NULL)
        `,
        [
          productMenuId,
          'system_product',
          '产品管理',
          parentId,
          'menu',
          '/system/products',
          '@/views/system/product/index.vue',
          'system:product:view',
          'Box',
          36,
          1,
          1,
          '产品管理',
        ],
      );
    } else {
      await queryRunner.query(
        `
          UPDATE menus
          SET name = ?,
              parentId = ?,
              type = ?,
              path = ?,
              component = ?,
              permission = ?,
              icon = ?,
              sort = ?,
              visible = ?,
              enabled = ?,
              remark = ?,
              deletedAt = NULL,
              updatedAt = NOW(6)
          WHERE id = ?
        `,
        [
          '产品管理',
          parentId,
          'menu',
          '/system/products',
          '@/views/system/product/index.vue',
          'system:product:view',
          'Box',
          36,
          1,
          1,
          '产品管理',
          productMenuId,
        ],
      );
    }

    const buttonSeeds = [
      {
        code: 'system_product_create',
        name: '新增产品',
        permission: 'system:product:create',
        sort: 1,
      },
      {
        code: 'system_product_update',
        name: '编辑产品',
        permission: 'system:product:update',
        sort: 2,
      },
      {
        code: 'system_product_delete',
        name: '删除产品',
        permission: 'system:product:delete',
        sort: 3,
      },
    ];

    for (const item of buttonSeeds) {
      const existingRows: Array<{ id: string }> = await queryRunner.query(
        `SELECT id FROM menus WHERE code = ? LIMIT 1`,
        [item.code],
      );

      if (!existingRows.length) {
        await queryRunner.query(
          `
            INSERT INTO menus (
              id, code, name, parentId, type, path, component, permission, icon,
              sort, visible, enabled, remark, createdAt, updatedAt, deletedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(6), NOW(6), NULL)
          `,
          [
            randomUUID(),
            item.code,
            item.name,
            productMenuId,
            'button',
            null,
            null,
            item.permission,
            null,
            item.sort,
            0,
            1,
            '产品管理按钮权限',
          ],
        );
        continue;
      }

      await queryRunner.query(
        `
          UPDATE menus
          SET name = ?,
              parentId = ?,
              type = ?,
              path = NULL,
              component = NULL,
              permission = ?,
              icon = NULL,
              sort = ?,
              visible = ?,
              enabled = ?,
              remark = ?,
              deletedAt = NULL,
              updatedAt = NOW(6)
          WHERE id = ?
        `,
        [
          item.name,
          productMenuId,
          'button',
          item.permission,
          item.sort,
          0,
          1,
          '产品管理按钮权限',
          existingRows[0].id,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('menus');
    if (!hasTable) {
      return;
    }

    await queryRunner.query(
      `
        DELETE FROM menus
        WHERE code IN (?, ?, ?, ?)
      `,
      [
        'system_product_delete',
        'system_product_update',
        'system_product_create',
        'system_product',
      ],
    );
  }
}
