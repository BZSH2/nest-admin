import 'dotenv/config';
import { join } from 'node:path';
import { DataSource } from 'typeorm';

const rootDir = process.cwd();
const isTsRuntime = __filename.endsWith('.ts');

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number.parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  charset: 'utf8mb4',
  synchronize: false,
  migrationsTableName: 'typeorm_migrations',
  entities: [
    isTsRuntime ? join(rootDir, 'src/**/*.entity.ts') : join(rootDir, 'dist/**/*.entity.js'),
  ],
  migrations: [
    isTsRuntime
      ? join(rootDir, 'src/database/migrations/*.ts')
      : join(rootDir, 'dist/database/migrations/*.js'),
  ],
});
