import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username:
    configService.get<string>('DB_USERNAME') ??
    configService.get<string>('DB_USER') ??
    'lingtour',
  password: configService.get<string>('DB_PASSWORD', 'lingtour_dev'),
  database:
    configService.get<string>('DB_DATABASE') ??
    configService.get<string>('DB_NAME') ??
    'lingtour',
  entities: [__dirname + '/../modules/**/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsRun: configService.get<string>('NODE_ENV') === 'production',
  synchronize: false,
  logging: configService.get<string>('NODE_ENV') === 'development',
});
