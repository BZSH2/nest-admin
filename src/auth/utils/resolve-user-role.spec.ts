import { ConfigService } from '@nestjs/config';
import { UserRole } from '../enums/user-role.enum';
import { resolveUserRole } from './resolve-user-role';

describe('resolveUserRole', () => {
  it('returns persisted role when present', () => {
    const configService = new ConfigService({
      ADMIN_PHONE_NUMBERS: '13800138000, 13900139000',
    });

    expect(resolveUserRole('13700137000', configService, UserRole.ADMIN)).toBe(UserRole.ADMIN);
  });

  it('returns admin for configured phone numbers when no persisted role exists', () => {
    const configService = new ConfigService({
      ADMIN_PHONE_NUMBERS: '13800138000, 13900139000',
    });

    expect(resolveUserRole('13800138000', configService)).toBe(UserRole.ADMIN);
  });

  it('returns user when phone number is not in allowlist', () => {
    const configService = new ConfigService({
      ADMIN_PHONE_NUMBERS: '13800138000, 13900139000',
    });

    expect(resolveUserRole('13700137000', configService)).toBe(UserRole.USER);
  });
});
