import { Test, type TestingModule } from '@nestjs/testing';
import { StaticAssetsController } from './static-assets.controller';
import { StaticAssetsService } from './static-assets.service';

describe('StaticAssetsController', () => {
  let controller: StaticAssetsController;
  const staticAssetsService = {
    findAll: jest.fn(),
    findFolders: jest.fn(),
    findOne: jest.fn(),
    upload: jest.fn(),
    update: jest.fn(),
    batchRemove: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaticAssetsController],
      providers: [
        {
          provide: StaticAssetsService,
          useValue: staticAssetsService,
        },
      ],
    }).compile();

    controller = module.get<StaticAssetsController>(StaticAssetsController);
  });

  it('delegates list query to service', () => {
    controller.findAll({ page: 1, pageSize: 10, keyword: 'logo' });

    expect(staticAssetsService.findAll).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      keyword: 'logo',
    });
  });

  it('delegates folder options query to service', () => {
    controller.findFolders();

    expect(staticAssetsService.findFolders).toHaveBeenCalled();
  });

  it('delegates detail query to service', () => {
    controller.findOne('asset-1');

    expect(staticAssetsService.findOne).toHaveBeenCalledWith('asset-1');
  });

  it('delegates upload to service', () => {
    const file = {
      originalname: 'logo.png',
      mimetype: 'image/png',
      size: 12,
      buffer: Buffer.from('hello'),
    };

    controller.upload(file, { name: '站点 Logo', folder: 'branding' });

    expect(staticAssetsService.upload).toHaveBeenCalledWith(file, {
      name: '站点 Logo',
      folder: 'branding',
    });
  });

  it('delegates update to service', () => {
    controller.update('asset-1', { name: '新名称' });

    expect(staticAssetsService.update).toHaveBeenCalledWith('asset-1', { name: '新名称' });
  });

  it('delegates batch remove to service', () => {
    controller.batchRemove({ ids: ['7a8c3aa4-2e05-4a8f-8df5-16ced58ba31f'] });

    expect(staticAssetsService.batchRemove).toHaveBeenCalledWith({
      ids: ['7a8c3aa4-2e05-4a8f-8df5-16ced58ba31f'],
    });
  });

  it('delegates remove to service', () => {
    controller.remove('asset-1');

    expect(staticAssetsService.remove).toHaveBeenCalledWith('asset-1');
  });
});
