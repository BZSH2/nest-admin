import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  const validEnv = {
    NODE_ENV: 'development',
    PORT: '35000',
    API_PREFIX: 'api',
    SWAGGER_PATH: 'docs',
    HOST: '0.0.0.0',
    PROTOCOL: 'http',
    ADMIN_PHONE_NUMBERS: '13800138000,13900139000',
    STATIC_ASSETS_DIR: 'storage/static-assets',
    STATIC_ASSETS_ROUTE_PREFIX: 'static-assets',
    STATIC_ASSETS_PUBLIC_BASE_URL: 'https://static.example.com',
    DB_HOST: '127.0.0.1',
    DB_PORT: '3306',
    DB_USERNAME: 'root',
    DB_PASSWORD: 'password',
    DB_DATABASE: 'nest_admin',
    DB_SYNCHRONIZE: 'false',
    JWT_SECRET: 'dev-secret',
    JWT_EXPIRATION_TIME: '1h',
    JWT_REFRESH_SECRET: 'dev-refresh-secret',
    JWT_REFRESH_EXPIRATION_TIME: '7d',
  };

  it('parses valid env values', () => {
    expect(validateEnv(validEnv)).toEqual(
      expect.objectContaining({
        PORT: 35000,
        DB_PORT: 3306,
        DB_SYNCHRONIZE: false,
        HOST: '0.0.0.0',
        ADMIN_PHONE_NUMBERS: '13800138000,13900139000',
        STATIC_ASSETS_DIR: 'storage/static-assets',
        STATIC_ASSETS_ROUTE_PREFIX: 'static-assets',
        STATIC_ASSETS_PUBLIC_BASE_URL: 'https://static.example.com',
      }),
    );
  });

  it('throws when required env is missing', () => {
    expect(() =>
      validateEnv({
        ...validEnv,
        DB_HOST: '',
      }),
    ).toThrow('环境变量 DB_HOST 未配置');
  });

  it('throws when boolean env is invalid', () => {
    expect(() =>
      validateEnv({
        ...validEnv,
        DB_SYNCHRONIZE: 'abc',
      }),
    ).toThrow('环境变量 DB_SYNCHRONIZE 必须为 true 或 false');
  });

  it('rejects placeholder secrets in production', () => {
    expect(() =>
      validateEnv({
        ...validEnv,
        NODE_ENV: 'production',
        JWT_SECRET: 'replace-me',
      }),
    ).toThrow('生产环境下 JWT_SECRET 不能使用占位值 replace-me');
  });
});
