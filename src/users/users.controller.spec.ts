import { Test, type TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  const usersService = {
    findAll: jest.fn(),
    create: jest.fn(),
    findOneOrFail: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('delegates findOne to the not-found-aware service method', async () => {
    await controller.findOne('user-1');

    expect(usersService.findOneOrFail).toHaveBeenCalledWith('user-1');
  });

  it('delegates delete to the service', async () => {
    await controller.remove('user-1');

    expect(usersService.delete).toHaveBeenCalledWith('user-1');
  });
});
