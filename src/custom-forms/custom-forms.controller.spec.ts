import { Test, type TestingModule } from '@nestjs/testing';
import { CustomFormsController } from './custom-forms.controller';
import { CustomFormsService } from './custom-forms.service';

describe('CustomFormsController', () => {
  let controller: CustomFormsController;
  const customFormsService = {
    findAll: jest.fn(),
    findByCode: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomFormsController],
      providers: [
        {
          provide: CustomFormsService,
          useValue: customFormsService,
        },
      ],
    }).compile();

    controller = module.get<CustomFormsController>(CustomFormsController);
  });

  it('delegates list query to service', () => {
    controller.findAll({ page: 1, pageSize: 10 });

    expect(customFormsService.findAll).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
  });

  it('delegates code query to service', () => {
    controller.findByCode('interview-feedback');

    expect(customFormsService.findByCode).toHaveBeenCalledWith('interview-feedback');
  });

  it('delegates detail query to service', () => {
    controller.findOne('form-1');

    expect(customFormsService.findOne).toHaveBeenCalledWith('form-1');
  });

  it('delegates create to service', () => {
    controller.create({
      code: 'interview-feedback',
      name: '面试反馈表单',
      schema: [],
    });

    expect(customFormsService.create).toHaveBeenCalledWith({
      code: 'interview-feedback',
      name: '面试反馈表单',
      schema: [],
    });
  });

  it('delegates update to service', () => {
    controller.update('form-1', { name: '新名称' });

    expect(customFormsService.update).toHaveBeenCalledWith('form-1', { name: '新名称' });
  });

  it('delegates remove to service', () => {
    controller.remove('form-1');

    expect(customFormsService.remove).toHaveBeenCalledWith('form-1');
  });
});
