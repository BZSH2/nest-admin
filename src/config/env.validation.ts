type EnvRecord = Record<string, unknown>;

const ensureString = (config: EnvRecord, key: string) => {
  const value = config[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`环境变量 ${key} 未配置`);
  }
  return value.trim();
};

const ensurePort = (config: EnvRecord, key: string, defaultValue: number) => {
  const raw = config[key];
  if (raw == null || raw === '') {
    return defaultValue;
  }

  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`环境变量 ${key} 必须为正整数`);
  }
  return value;
};

const ensureBoolean = (config: EnvRecord, key: string, defaultValue: boolean) => {
  const raw = config[key];
  if (raw == null || raw === '') {
    return defaultValue;
  }

  if (raw === 'true' || raw === true) {
    return true;
  }

  if (raw === 'false' || raw === false) {
    return false;
  }

  throw new Error(`环境变量 ${key} 必须为 true 或 false`);
};

const ensureSecret = (config: EnvRecord, key: string, nodeEnv: string) => {
  const value = ensureString(config, key);
  if (nodeEnv === 'production' && value === 'replace-me') {
    throw new Error(`生产环境下 ${key} 不能使用占位值 replace-me`);
  }
  return value;
};

export function validateEnv(config: EnvRecord) {
  const nodeEnv = typeof config.NODE_ENV === 'string' ? config.NODE_ENV : 'development';

  return {
    NODE_ENV: nodeEnv,
    PORT: ensurePort(config, 'PORT', 35000),
    API_PREFIX: typeof config.API_PREFIX === 'string' ? config.API_PREFIX : 'api',
    SWAGGER_PATH: typeof config.SWAGGER_PATH === 'string' ? config.SWAGGER_PATH : 'docs',
    HOST: typeof config.HOST === 'string' ? config.HOST : '0.0.0.0',
    PROTOCOL: typeof config.PROTOCOL === 'string' ? config.PROTOCOL : 'http',
    ADMIN_PHONE_NUMBERS:
      typeof config.ADMIN_PHONE_NUMBERS === 'string' ? config.ADMIN_PHONE_NUMBERS : '',
    DB_HOST: ensureString(config, 'DB_HOST'),
    DB_PORT: ensurePort(config, 'DB_PORT', 3306),
    DB_USERNAME: ensureString(config, 'DB_USERNAME'),
    DB_PASSWORD: ensureString(config, 'DB_PASSWORD'),
    DB_DATABASE: ensureString(config, 'DB_DATABASE'),
    DB_SYNCHRONIZE: ensureBoolean(config, 'DB_SYNCHRONIZE', nodeEnv !== 'production'),
    JWT_SECRET: ensureSecret(config, 'JWT_SECRET', nodeEnv),
    JWT_EXPIRATION_TIME:
      typeof config.JWT_EXPIRATION_TIME === 'string' ? config.JWT_EXPIRATION_TIME : '1h',
    JWT_REFRESH_SECRET: ensureSecret(config, 'JWT_REFRESH_SECRET', nodeEnv),
    JWT_REFRESH_EXPIRATION_TIME:
      typeof config.JWT_REFRESH_EXPIRATION_TIME === 'string'
        ? config.JWT_REFRESH_EXPIRATION_TIME
        : '7d',
  };
}
