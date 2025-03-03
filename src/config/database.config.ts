import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.resolve(__dirname, '../../.env');

// Check if .env file exists
import * as fs from 'fs';
if (fs.existsSync(envPath)) {
  console.log('.env file found!');
} else {
  console.log('.env file NOT found!');
}

// Load .env file
dotenv.config({ path: envPath });

export const databaseConfig: TypeOrmModuleOptions = {
  type: process.env.DATABASE_TYPE as any,
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5433', 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  migrationsRun: true,
};
