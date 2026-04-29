import { randomUUID } from 'node:crypto';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDnsRelationMenus1777014600000 implements MigrationInterface {
  name = 'SeedDnsRelationMenus1777014600000';

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

    const existingDnsRows: Array<{ id: string }> = await queryRunner.query(
      `SELECT id FROM menus WHERE code = ? LIMIT 1`,
      ['system_dns_relation'],
    );

    const dnsMenuId = existingDnsRows[0]?.id ?? randomUUID();
    const parentId = systemRows[0]?.id ?? null;

    if (!existingDnsRows.length) {
      await queryRunner.query(
        `
          INSERT INTO menus (
            id, code, name, parentId, type, path, component, permission, icon,
            sort, visible, enabled, remark, createdAt, updatedAt, deletedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(6), NOW(6), NULL)
        `,
        [
          dnsMenuId,
          'system_dns_relation',
          'DNS关联',
          parentId,
          'menu',
          '/system/dnsRelations',
          '@/views/system/dnsRelation/index.vue',
          'system:dns-relation:view',
          'Link',
          35,
          1,
          1,
          'DNS 关联管理',
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
          'DNS关联',
          parentId,
          'menu',
          '/system/dnsRelations',
          '@/views/system/dnsRelation/index.vue',
          'system:dns-relation:view',
          'Link',
          35,
          1,
          1,
          'DNS 关联管理',
          dnsMenuId,
        ],
      );
    }

    const buttonSeeds = [
      {
        code: 'system_dns_relation_create',
        name: '新增 DNS关联',
        permission: 'system:dns-relation:create',
        sort: 1,
      },
      {
        code: 'system_dns_relation_update',
        name: '编辑 DNS关联',
        permission: 'system:dns-relation:update',
        sort: 2,
      },
      {
        code: 'system_dns_relation_delete',
        name: '删除 DNS关联',
        permission: 'system:dns-relation:delete',
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
            dnsMenuId,
            'button',
            null,
            null,
            item.permission,
            null,
            item.sort,
            0,
            1,
            'DNS 关联按钮权限',
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
          dnsMenuId,
          'button',
          item.permission,
          item.sort,
          0,
          1,
          'DNS 关联按钮权限',
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
        'system_dns_relation_delete',
        'system_dns_relation_update',
        'system_dns_relation_create',
        'system_dns_relation',
      ],
    );
  }
}
