import { randomUUID } from 'node:crypto';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedStaticAssetMenus1777110600000 implements MigrationInterface {
  name = 'SeedStaticAssetMenus1777110600000';

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

    const existingRows: Array<{ id: string }> = await queryRunner.query(
      `SELECT id FROM menus WHERE code = ? LIMIT 1`,
      ['system_static_asset'],
    );

    const staticAssetMenuId = existingRows[0]?.id ?? randomUUID();
    const parentId = systemRows[0]?.id ?? null;

    if (!existingRows.length) {
      await queryRunner.query(
        `
          INSERT INTO menus (
            id, code, name, parentId, type, path, component, permission, icon,
            sort, visible, enabled, remark, createdAt, updatedAt, deletedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(6), NOW(6), NULL)
        `,
        [
          staticAssetMenuId,
          'system_static_asset',
          '静态资源',
          parentId,
          'menu',
          '/system/staticAssets',
          '@/views/system/staticAsset/index.vue',
          'system:static-asset:view',
          'Picture',
          36,
          1,
          1,
          '静态资源管理',
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
          '静态资源',
          parentId,
          'menu',
          '/system/staticAssets',
          '@/views/system/staticAsset/index.vue',
          'system:static-asset:view',
          'Picture',
          36,
          1,
          1,
          '静态资源管理',
          staticAssetMenuId,
        ],
      );
    }

    const buttonSeeds = [
      {
        code: 'system_static_asset_create',
        name: '上传静态资源',
        permission: 'system:static-asset:create',
        sort: 1,
      },
      {
        code: 'system_static_asset_update',
        name: '编辑静态资源',
        permission: 'system:static-asset:update',
        sort: 2,
      },
      {
        code: 'system_static_asset_delete',
        name: '删除静态资源',
        permission: 'system:static-asset:delete',
        sort: 3,
      },
    ];

    for (const item of buttonSeeds) {
      const menuRows: Array<{ id: string }> = await queryRunner.query(
        `SELECT id FROM menus WHERE code = ? LIMIT 1`,
        [item.code],
      );

      if (!menuRows.length) {
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
            staticAssetMenuId,
            'button',
            null,
            null,
            item.permission,
            null,
            item.sort,
            0,
            1,
            '静态资源按钮权限',
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
          staticAssetMenuId,
          'button',
          item.permission,
          item.sort,
          0,
          1,
          '静态资源按钮权限',
          menuRows[0].id,
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
        'system_static_asset_delete',
        'system_static_asset_update',
        'system_static_asset_create',
        'system_static_asset',
      ],
    );
  }
}
