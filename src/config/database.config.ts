import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

export const databaseConfig: TypeOrmModuleOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  // port: parseInt(process.env.DB_PORT, 10) || 5432,
  port: 5432,
  username: process.env.DATABASE_USER || "opportunity_test",
  password: process.env.DATABASE_PASSWORD || "opportunity_test",
  database: process.env.DATABASE_NAME || "opportunities",
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
  synchronize: process.env.DB_SYNCHRONIZE === "true",
  logging: process.env.DB_LOGGING === "true",
};
