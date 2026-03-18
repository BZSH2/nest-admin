import { ConfigService } from '@nestjs/config';
import { UserRole } from '../enums/user-role.enum';
import { resolveUserRole } from './resolve-user-role';

describe('resolveUserRole', () => {
  it('returns admin for configured phone numbers', () => {
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
