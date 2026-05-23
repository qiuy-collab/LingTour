import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? process.env.DB_USER ?? 'lingtour',
  password: process.env.DB_PASSWORD ?? 'lingtour_dev',
  database: process.env.DB_DATABASE ?? process.env.DB_NAME ?? 'lingtour',
  entities: [__dirname + '/../modules/**/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
