import { ConfigService } from '@nestjs/config';
import { UserRole } from '../enums/user-role.enum';

export function resolveUserRole(
  phoneNumber: string,
  configService: ConfigService,
  persistedRole?: UserRole | null,
): UserRole {
  if (persistedRole) {
    return persistedRole;
  }

  const adminPhoneNumbers = new Set(
    (configService.get<string>('ADMIN_PHONE_NUMBERS') || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  );

  return adminPhoneNumbers.has(phoneNumber) ? UserRole.ADMIN : UserRole.USER;
}
