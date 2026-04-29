import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { StaticAsset } from './entities/static-asset.entity';
import { StaticAssetsService } from './static-assets.service';

describe('StaticAssetsService', () => {
  let service: StaticAssetsService;
  let tempDir: string;

  const repository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    query: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
    create: jest.fn((value) => value),
  };

  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'STATIC_ASSETS_DIR') return tempDir;
      if (key === 'STATIC_ASSETS_ROUTE_PREFIX') return 'static-assets';
      if (key === 'STATIC_ASSETS_PUBLIC_BASE_URL') return 'https://static.example.com';
      return undefined;
    }),
  } as unknown as ConfigService;

  beforeEach(async () => {
    jest.clearAllMocks();
    tempDir = await mkdtemp(join(tmpdir(), 'nest-admin-static-assets-'));
    service = new StaticAssetsService(repository as never, configService);
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('returns paginated static assets with computed access URL', async () => {
    repository.findAndCount.mockResolvedValue([
      [
        {
          id: 'asset-1',
          name: '站点 Logo',
          originalName: 'logo.png',
          fileType: 'image',
          extension: 'png',
          mimeType: 'image/png',
          size: 12,
          folder: 'branding',
          storagePath: '2026/04/28/demo.png',
          hash: 'hash-1',
          remark: null,
          createdAt: new Date('2026-04-28T02:00:00.000Z'),
          updatedAt: new Date('2026-04-28T02:10:00.000Z'),
        },
      ],
      1,
    ]);

    const result = await service.findAll({ page: 1, pageSize: 10, keyword: 'logo' });

    expect(repository.findAndCount).toHaveBeenCalled();
    expect(result.total).toBe(1);
    expect(result.items[0]).toEqual(
      expect.objectContaining({
        id: 'asset-1',
        accessPath: '/static-assets/2026/04/28/demo.png',
        accessUrl: 'https://static.example.com/static-assets/2026/04/28/demo.png',
      }),
    );
  });

  it('returns folder options with uncategorized bucket', async () => {
    repository.query.mockResolvedValue([
      { folder: 'branding', count: '2' },
      { folder: null, count: '1' },
    ]);

    const result = await service.findFolders();

    expect(repository.query).toHaveBeenCalled();
    expect(result).toEqual([
      { folder: 'branding', label: 'branding', uncategorized: false, count: 2 },
      { folder: null, label: '未分组', uncategorized: true, count: 1 },
    ]);
  });

  it('uploads file, writes to disk, and persists metadata', async () => {
    repository.save.mockImplementation(async (value: StaticAsset) => ({
      id: 'asset-2',
      createdAt: new Date('2026-04-28T02:00:00.000Z'),
      updatedAt: new Date('2026-04-28T02:10:00.000Z'),
      ...value,
    }));

    const result = await service.upload(
      {
        originalname: 'logo.png',
        mimetype: 'image/png',
        size: 5,
        buffer: Buffer.from('hello'),
      },
      { name: '站点 Logo', folder: 'branding', remark: '官网顶部' },
    );

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '站点 Logo',
        originalName: 'logo.png',
        fileType: 'image',
        mimeType: 'image/png',
        size: 5,
        folder: 'branding',
        remark: '官网顶部',
      }),
    );

    const absolutePath = join(tempDir, ...result.storagePath.split('/'));
    await expect(readFile(absolutePath, 'utf8')).resolves.toBe('hello');
    expect(result.accessUrl).toContain('/static-assets/');
  });

  it('soft deletes record and removes physical file', async () => {
    const storagePath = '2026/04/28/demo.txt';
    const absolutePath = join(tempDir, ...storagePath.split('/'));
    await mkdir(join(tempDir, '2026/04/28'), { recursive: true });
    await writeFile(absolutePath, 'hello');

    repository.findOne.mockResolvedValue({
      id: 'asset-3',
      name: 'demo',
      originalName: 'demo.txt',
      fileType: 'document',
      extension: 'txt',
      mimeType: 'text/plain',
      size: 5,
      folder: null,
      storagePath,
      hash: 'hash-3',
      remark: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    repository.softDelete.mockResolvedValue({ affected: 1 });

    const result = await service.remove('asset-3');

    expect(repository.softDelete).toHaveBeenCalledWith('asset-3');
    await expect(readFile(absolutePath, 'utf8')).rejects.toThrow();
    expect(result).toEqual({ message: '删除成功' });
  });

  it('batch removes existing assets and reports missing ids', async () => {
    const storagePathA = '2026/04/28/a.txt';
    const storagePathB = '2026/04/28/b.txt';
    await mkdir(join(tempDir, '2026/04/28'), { recursive: true });
    await writeFile(join(tempDir, ...storagePathA.split('/')), 'a');
    await writeFile(join(tempDir, ...storagePathB.split('/')), 'b');

    repository.find.mockResolvedValue([
      {
        id: '7a8c3aa4-2e05-4a8f-8df5-16ced58ba31f',
        storagePath: storagePathA,
      },
      {
        id: '8b3a4bd7-9858-4e8d-98bf-867661244f4b',
        storagePath: storagePathB,
      },
    ]);
    repository.softDelete.mockResolvedValue({ affected: 2 });

    const result = await service.batchRemove({
      ids: [
        '7a8c3aa4-2e05-4a8f-8df5-16ced58ba31f',
        '8b3a4bd7-9858-4e8d-98bf-867661244f4b',
        '4e091d4f-c01d-4614-a13d-a11d684dbf80',
      ],
    });

    expect(repository.find).toHaveBeenCalled();
    expect(repository.softDelete).toHaveBeenCalledWith([
      '7a8c3aa4-2e05-4a8f-8df5-16ced58ba31f',
      '8b3a4bd7-9858-4e8d-98bf-867661244f4b',
    ]);
    expect(result).toEqual(
      expect.objectContaining({
        requestedCount: 3,
        deletedCount: 2,
        ids: ['7a8c3aa4-2e05-4a8f-8df5-16ced58ba31f', '8b3a4bd7-9858-4e8d-98bf-867661244f4b'],
        missingIds: ['4e091d4f-c01d-4614-a13d-a11d684dbf80'],
      }),
    );
  });

  it('throws not found when resource does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});
