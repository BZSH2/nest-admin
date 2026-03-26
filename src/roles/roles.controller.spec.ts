import { Test, type TestingModule } from '@nestjs/testing';
import { UserRole } from '../auth/enums/user-role.enum';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

describe('RolesController', () => {
  let controller: RolesController;
  const rolesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    createRole: jest.fn(),
    updateRole: jest.fn(),
    updateRoleStatus: jest.fn(),
    removeRole: jest.fn(),
    findUsersByRole: jest.fn(),
    addUserToRole: jest.fn(),
    removeUserFromRole: jest.fn(),
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

  it('delegates role list query to service', () => {
    controller.findAll({ page: 1, pageSize: 10 });

    expect(rolesService.findAll).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
  });

  it('delegates role creation to service', () => {
    controller.create({ code: 'editor', name: '编辑' });

    expect(rolesService.createRole).toHaveBeenCalledWith({ code: 'editor', name: '编辑' });
  });

  it('delegates role detail query to service', () => {
    controller.findOne('role-1');

    expect(rolesService.findOne).toHaveBeenCalledWith('role-1');
  });

  it('delegates role update to service', () => {
    controller.update('role-1', { name: '新名称' });

    expect(rolesService.updateRole).toHaveBeenCalledWith('role-1', { name: '新名称' });
  });

  it('delegates role status update to service', () => {
    controller.updateStatus('role-1', { enabled: true });

    expect(rolesService.updateRoleStatus).toHaveBeenCalledWith('role-1', { enabled: true });
  });

  it('delegates role removal to service', () => {
    controller.remove('role-1');

    expect(rolesService.removeRole).toHaveBeenCalledWith('role-1');
  });

  it('delegates role member list query to service', () => {
    controller.findUsers('role-1', { page: 1, pageSize: 10 });

    expect(rolesService.findUsersByRole).toHaveBeenCalledWith('role-1', {
      page: 1,
      pageSize: 10,
    });
  });

  it('delegates role member add to service', () => {
    controller.addUser('role-1', { userId: 'user-1' }, { user: { id: 'actor-1' } } as any);

    expect(rolesService.addUserToRole).toHaveBeenCalledWith(
      'role-1',
      { userId: 'user-1' },
      'actor-1',
    );
  });

  it('delegates role member removal to service', () => {
    controller.removeUser('role-1', 'user-1', { user: { id: 'actor-1' } } as any);

    expect(rolesService.removeUserFromRole).toHaveBeenCalledWith('role-1', 'user-1', 'actor-1');
  });

  it('delegates role option query to service', () => {
    controller.getOptions();

    expect(rolesService.getRoleOptions).toHaveBeenCalledTimes(1);
  });

  it('delegates user role query to service', () => {
    controller.getUserRole('user-1');

    expect(rolesService.getUserRole).toHaveBeenCalledWith('user-1');
  });

  it('delegates user role update to service with actor id', () => {
    controller.updateUserRole('user-1', { role: UserRole.ADMIN }, {
      user: { id: 'actor-1' },
    } as any);

    expect(rolesService.updateUserRole).toHaveBeenCalledWith(
      'user-1',
      { role: UserRole.ADMIN },
      'actor-1',
    );
  });
});
