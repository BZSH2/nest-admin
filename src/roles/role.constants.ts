import { UserRole } from '../auth/enums/user-role.enum';

type SystemRoleSeed = {
  code: UserRole;
  name: string;
  description: string;
  sort: number;
  enabled: true;
  isSystem: true;
  isDefault: boolean;
};

export const SYSTEM_ROLE_SEEDS: SystemRoleSeed[] = [
  {
    code: UserRole.ADMIN,
    name: '管理员',
    description: '系统内置管理员角色',
    sort: 1,
    enabled: true,
    isSystem: true,
    isDefault: false,
  },
  {
    code: UserRole.USER,
    name: '普通用户',
    description: '系统内置普通用户角色',
    sort: 2,
    enabled: true,
    isSystem: true,
    isDefault: true,
  },
];

export const SYSTEM_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: '管理员',
  [UserRole.USER]: '普通用户',
};
