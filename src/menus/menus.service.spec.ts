import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Like } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Menu } from './entities/menu.entity';
import { MenusService } from './menus.service';

function createRepositoryMock() {
  return {
    count: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
    create: jest.fn((value) => value),
  };
}

describe('MenusService', () => {
  let service: MenusService;
  let menusRepository: ReturnType<typeof createRepositoryMock>;
  let productsRepository: ReturnType<typeof createRepositoryMock>;

  beforeEach(async () => {
    menusRepository = createRepositoryMock();
    productsRepository = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenusService,
        { provide: getRepositoryToken(Menu), useValue: menusRepository },
        { provide: getRepositoryToken(Product), useValue: productsRepository },
      ],
    }).compile();

    service = module.get<MenusService>(MenusService);
  });

  it('returns menu list as tree and supports product filter', async () => {
    const productId = 'demo-product';
    const parent = createMenu({
      id: 'parent',
      name: '系统管理',
      productId,
      parentId: null,
      sort: 1,
    });
    const child = createMenu({
      id: 'child',
      name: '菜单管理',
      productId,
      parentId: parent.id,
      sort: 2,
    });
    menusRepository.find.mockResolvedValue([parent, child]);

    const result = await service.findAll({ productId });

    expect(menusRepository.find).toHaveBeenCalledWith({
      where: { productId },
      order: { sort: 'ASC', createdAt: 'ASC' },
    });
    expect(result).toMatchObject({ total: 2, page: 1, pageSize: 2 });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(parent.id);
    expect(result.items[0].children).toHaveLength(1);
    expect(result.items[0].children[0].id).toBe(child.id);
  });

  it('supports keyword query while returning menu tree', async () => {
    menusRepository.find.mockResolvedValue([]);

    await service.findTree({ keyword: 'system', productId: 'demo-product' });

    expect(menusRepository.find).toHaveBeenCalledWith({
      where: [
        { productId: 'demo-product', code: Like('%system%') },
        { productId: 'demo-product', name: Like('%system%') },
        { productId: 'demo-product', permission: Like('%system%') },
      ],
      order: { sort: 'ASC', createdAt: 'ASC' },
    });
  });

  it('rejects creating menu under a parent from another product', async () => {
    productsRepository.findOne.mockResolvedValue({ id: 'target-product' });
    menusRepository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(createMenu({ id: 'parent', productId: 'another-product' }));

    await expect(
      service.create({
        code: 'demo_menu',
        name: '演示菜单',
        productId: 'target-product',
        parentId: 'parent',
        type: 'menu',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('rejects unknown product when creating menu', async () => {
    menusRepository.findOne.mockResolvedValue(null);
    productsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create({
        code: 'demo_menu',
        name: '演示菜单',
        productId: 'missing-product',
        type: 'menu',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});

function createMenu(overrides: Partial<Menu> = {}): Menu {
  return {
    id: 'menu-id',
    code: 'system_menu',
    name: '菜单管理',
    productId: null,
    product: null,
    parentId: null,
    type: 'menu',
    path: '/system/menus',
    component: '@/views/system/menuManagement/index.vue',
    permission: 'system:menu:view',
    icon: null,
    sort: 0,
    visible: true,
    enabled: true,
    remark: null,
    createdAt: new Date('2026-04-30T02:00:00.000Z'),
    updatedAt: new Date('2026-04-30T02:00:00.000Z'),
    deletedAt: null,
    ...overrides,
  };
}
