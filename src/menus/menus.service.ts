import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateMenuDto } from './dto/create-menu.dto';
import { QueryMenuDto } from './dto/query-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Menu } from './entities/menu.entity';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private readonly menusRepository: Repository<Menu>,
  ) {}

  async findAll(query: QueryMenuDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const keyword = query.keyword?.trim();

    const where = keyword
      ? [
          {
            code: Like(`%${keyword}%`),
            ...(query.type ? { type: query.type } : {}),
            ...(query.enabled == null ? {} : { enabled: query.enabled }),
          },
          {
            name: Like(`%${keyword}%`),
            ...(query.type ? { type: query.type } : {}),
            ...(query.enabled == null ? {} : { enabled: query.enabled }),
          },
          {
            permission: Like(`%${keyword}%`),
            ...(query.type ? { type: query.type } : {}),
            ...(query.enabled == null ? {} : { enabled: query.enabled }),
          },
        ]
      : {
          ...(query.type ? { type: query.type } : {}),
          ...(query.enabled == null ? {} : { enabled: query.enabled }),
        };

    const [items, total] = await this.menusRepository.findAndCount({
      where,
      order: { sort: 'ASC', createdAt: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { items, total, page, pageSize };
  }

  async findTree() {
    const menus = await this.menusRepository.find({ order: { sort: 'ASC', createdAt: 'ASC' } });
    const map = new Map(menus.map((item) => [item.id, { ...item, children: [] as any[] }]));
    const roots: Array<Menu & { children: any[] }> = [];

    for (const menu of map.values()) {
      if (menu.parentId && map.has(menu.parentId)) {
        map.get(menu.parentId)?.children.push(menu);
      } else {
        roots.push(menu);
      }
    }

    return roots;
  }

  findOne(id: string) {
    return this.findOneOrFail(id);
  }

  async create(dto: CreateMenuDto) {
    await this.ensureCodeAvailable(dto.code);
    await this.ensureParentExists(dto.parentId);

    const menu = await this.menusRepository.save(
      this.menusRepository.create({
        code: dto.code,
        name: dto.name,
        parentId: dto.parentId ?? null,
        type: dto.type,
        path: dto.path ?? null,
        component: dto.component ?? null,
        permission: dto.permission ?? null,
        icon: dto.icon ?? null,
        sort: dto.sort ?? 0,
        visible: dto.visible ?? true,
        enabled: dto.enabled ?? true,
        remark: dto.remark ?? null,
      }),
    );

    return menu;
  }

  async update(id: string, dto: UpdateMenuDto) {
    const menu = await this.findOneOrFail(id);

    if (dto.code && dto.code !== menu.code) {
      await this.ensureCodeAvailable(dto.code, id);
    }

    if (dto.parentId && dto.parentId === id) {
      throw new ConflictException('父级菜单不能是自己');
    }

    await this.ensureParentExists(dto.parentId, id);

    return this.menusRepository.save({
      ...menu,
      ...dto,
      parentId: dto.parentId === undefined ? menu.parentId : (dto.parentId ?? null),
      path: dto.path === undefined ? menu.path : (dto.path ?? null),
      component: dto.component === undefined ? menu.component : (dto.component ?? null),
      permission: dto.permission === undefined ? menu.permission : (dto.permission ?? null),
      icon: dto.icon === undefined ? menu.icon : (dto.icon ?? null),
      remark: dto.remark === undefined ? menu.remark : (dto.remark ?? null),
    });
  }

  async remove(id: string) {
    await this.findOneOrFail(id);
    const childCount = await this.menusRepository.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new ConflictException('请先删除子菜单');
    }
    await this.menusRepository.softDelete(id);
    return { message: '删除成功' };
  }

  private async findOneOrFail(id: string) {
    const menu = await this.menusRepository.findOne({ where: { id } });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }
    return menu;
  }

  private async ensureCodeAvailable(code: string, excludeId?: string) {
    const existing = await this.menusRepository.findOne({ where: { code }, withDeleted: true });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('菜单编码已存在');
    }
  }

  private async ensureParentExists(parentId?: string | null, excludeId?: string) {
    if (!parentId) return;
    if (excludeId && parentId === excludeId) {
      throw new ConflictException('父级菜单不能是自己');
    }
    const parent = await this.menusRepository.findOne({ where: { id: parentId } });
    if (!parent) {
      throw new NotFoundException('父级菜单不存在');
    }
  }
}
