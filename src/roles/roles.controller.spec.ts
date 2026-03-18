import { Test, type TestingModule } from '@nestjs/testing';
import { UserRole } from '../auth/enums/user-role.enum';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

describe('RolesController', () => {
  let controller: RolesController;
  const rolesService = {
    getRoleOptions: jest.fn(),
    getUserRole: jest.fn(),
    updateUserRole: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: rolesService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
  });

  it('delegates role option query to service', () => {
    controller.getOptions();

    expect(rolesService.getRoleOptions).toHaveBeenCalledTimes(1);
  });

  it('delegates user role query to service', () => {
    controller.getUserRole('user-1');

    expect(rolesService.getUserRole).toHaveBeenCalledWith('user-1');
  });

  it('delegates role update to service', () => {
    controller.updateUserRole('user-1', { role: UserRole.ADMIN });

    expect(rolesService.updateUserRole).toHaveBeenCalledWith('user-1', {
      role: UserRole.ADMIN,
    });
  });
});
