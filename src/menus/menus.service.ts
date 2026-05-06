import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Like, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { QueryMenuDto } from './dto/query-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Menu } from './entities/menu.entity';

type MenuTreeItem = Menu & { children: MenuTreeItem[] };

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private readonly menusRepository: Repository<Menu>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async findAll(query: QueryMenuDto) {
    const menus = await this.menusRepository.find({
      where: this.buildWhere(query),
      order: { sort: 'ASC', createdAt: 'ASC' },
    });
    const items = this.buildTree(menus);

    return { items, total: menus.length, page: 1, pageSize: menus.length };
  }

  async findTree(query: QueryMenuDto) {
    const menus = await this.menusRepository.find({
      where: this.buildWhere(query),
      order: { sort: 'ASC', createdAt: 'ASC' },
    });

    return this.buildTree(menus);
  }

  findOne(id: string) {
    return this.findOneOrFail(id);
  }

  async create(dto: CreateMenuDto) {
    const productId = dto.productId ?? null;

    await this.ensureCodeAvailable(dto.code, productId);
    await this.ensureProductExists(productId);
    await this.ensureParentExists(dto.parentId, undefined, productId);

    const menu = await this.menusRepository.save(
      this.menusRepository.create({
        code: dto.code,
        name: dto.name,
        productId: dto.productId ?? null,
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
    const nextProductId = dto.productId === undefined ? menu.productId : (dto.productId ?? null);
    const nextParentId = dto.parentId === undefined ? menu.parentId : (dto.parentId ?? null);

    if (dto.code && dto.code !== menu.code) {
      await this.ensureCodeAvailable(dto.code, nextProductId, id);
    } else if (nextProductId !== menu.productId) {
      await this.ensureCodeAvailable(menu.code, nextProductId, id);
    }

    if (nextParentId && nextParentId === id) {
      throw new ConflictException('父级菜单不能是自己');
    }

    await this.ensureProductExists(nextProductId);
    await this.ensureParentExists(nextParentId, id, nextProductId);

    return this.menusRepository.save({
      ...menu,
      ...dto,
      productId: nextProductId,
      parentId: nextParentId,
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

  private buildWhere(query: QueryMenuDto) {
    const keyword = query.keyword?.trim();
    const baseWhere = {
      ...(query.productId ? { productId: query.productId } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.enabled == null ? {} : { enabled: query.enabled }),
    };

    if (!keyword) {
      return Object.keys(baseWhere).length ? baseWhere : undefined;
    }

    return [
      { ...baseWhere, code: Like(`%${keyword}%`) },
      { ...baseWhere, name: Like(`%${keyword}%`) },
      { ...baseWhere, permission: Like(`%${keyword}%`) },
    ];
  }

  private buildTree(menus: Menu[]) {
    const map = new Map<string, MenuTreeItem>();
    const roots: MenuTreeItem[] = [];

    for (const item of menus) {
      map.set(item.id, { ...item, children: [] });
    }

    for (const menu of map.values()) {
      if (menu.parentId && map.has(menu.parentId)) {
        map.get(menu.parentId)?.children.push(menu);
      } else {
        roots.push(menu);
      }
    }

    return roots;
  }

  private async findOneOrFail(id: string) {
    const menu = await this.menusRepository.findOne({ where: { id } });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }
    return menu;
  }

  private async ensureCodeAvailable(code: string, productId?: string | null, excludeId?: string) {
    const existing = await this.menusRepository.findOne({
      where: {
        code,
        productId: productId == null ? IsNull() : productId,
      },
      withDeleted: true,
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('当前产品下菜单编码已存在');
    }
  }

  private async ensureProductExists(productId?: string | null) {
    if (!productId) return;

    const product = await this.productsRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('所属产品不存在');
    }
  }

  private async ensureParentExists(
    parentId?: string | null,
    excludeId?: string,
    productId?: string | null,
  ) {
    if (!parentId) return;
    if (excludeId && parentId === excludeId) {
      throw new ConflictException('父级菜单不能是自己');
    }
    const parent = await this.menusRepository.findOne({ where: { id: parentId } });
    if (!parent) {
      throw new NotFoundException('父级菜单不存在');
    }
    if ((parent.productId ?? null) !== (productId ?? null)) {
      throw new ConflictException('父级菜单必须属于同一产品');
    }
  }
}
