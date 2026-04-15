import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomFormsService } from './custom-forms.service';
import { CustomForm } from './entities/custom-form.entity';

type MockRepository = {
  create: jest.Mock;
  findOne: jest.Mock;
  findAndCount: jest.Mock;
  save: jest.Mock;
  softDelete: jest.Mock;
};

describe('CustomFormsService', () => {
  let service: CustomFormsService;
  let customFormsRepository: MockRepository;

  beforeEach(async () => {
    customFormsRepository = {
      create: jest.fn((input) => input),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      save: jest.fn(async (input) => input),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomFormsService,
        {
          provide: getRepositoryToken(CustomForm),
          useValue: customFormsRepository,
        },
      ],
    }).compile();

    service = module.get<CustomFormsService>(CustomFormsService);
  });

  it('returns paged custom form list', async () => {
    customFormsRepository.findAndCount.mockResolvedValue([
      [
        {
          id: 'form-1',
          code: 'interview-feedback',
          name: '面试反馈表单',
        },
      ],
      1,
    ]);

    await expect(service.findAll({ page: 1, pageSize: 10 })).resolves.toEqual({
      items: [
        {
          id: 'form-1',
          code: 'interview-feedback',
          name: '面试反馈表单',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    });
  });

  it('creates custom form successfully and auto injects field id', async () => {
    customFormsRepository.findOne.mockResolvedValue(null);
    customFormsRepository.save.mockImplementation(async (input) => ({
      id: 'form-1',
      createdAt: new Date('2026-04-15T00:00:00.000Z'),
      updatedAt: new Date('2026-04-15T00:00:00.000Z'),
      ...input,
    }));

    const result = await service.create({
      code: 'interview-feedback',
      name: '面试反馈表单',
      schema: [
        {
          type: 'input',
          label: '姓名',
          name: 'realName',
          required: true,
        },
      ],
    });

    expect(customFormsRepository.create).toHaveBeenCalledTimes(1);
    expect(customFormsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'interview-feedback',
        name: '面试反馈表单',
        schema: [
          expect.objectContaining({
            type: 'input',
            label: '姓名',
            name: 'realName',
            id: expect.any(String),
          }),
        ],
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: 'form-1',
        code: 'interview-feedback',
        name: '面试反馈表单',
      }),
    );
  });

  it('throws when creating duplicate form code', async () => {
    customFormsRepository.findOne.mockResolvedValue({
      id: 'form-1',
      code: 'interview-feedback',
    });

    await expect(
      service.create({
        code: 'interview-feedback',
        name: '重复表单',
        schema: [],
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws when schema contains duplicated field name', async () => {
    customFormsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create({
        code: 'duplicate-field',
        name: '重复字段测试',
        schema: [
          {
            type: 'input',
            label: '姓名',
            name: 'realName',
          },
          {
            type: 'textarea',
            label: '备注',
            name: 'realName',
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when select-like field misses options', async () => {
    customFormsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create({
        code: 'missing-options',
        name: '缺少选项测试',
        schema: [
          {
            type: 'select',
            label: '岗位',
            name: 'position',
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updates custom form schema', async () => {
    customFormsRepository.findOne
      .mockResolvedValueOnce({
        id: 'form-1',
        code: 'interview-feedback',
        name: '面试反馈表单',
        remark: null,
        schema: [],
      })
      .mockResolvedValueOnce(null);
    customFormsRepository.save.mockImplementation(async (input) => input);

    const result = await service.update('form-1', {
      code: 'interview-feedback-v2',
      schema: [
        {
          type: 'switch',
          label: '是否通过',
          name: 'passed',
          value: false,
        },
      ],
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: 'form-1',
        code: 'interview-feedback-v2',
        schema: [
          expect.objectContaining({
            name: 'passed',
            id: expect.any(String),
          }),
        ],
      }),
    );
  });

  it('findByCode throws when form does not exist', async () => {
    customFormsRepository.findOne.mockResolvedValue(null);

    await expect(service.findByCode('missing-form')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('removes custom form by soft delete', async () => {
    customFormsRepository.findOne.mockResolvedValue({
      id: 'form-1',
      code: 'interview-feedback',
    });
    customFormsRepository.softDelete.mockResolvedValue(undefined);

    await expect(service.remove('form-1')).resolves.toEqual({ message: '删除成功' });
    expect(customFormsRepository.softDelete).toHaveBeenCalledWith('form-1');
  });
});
