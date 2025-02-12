import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { databaseConfig } from "./config/database.config";
import { SkillsModule } from "./modules/skills/skills.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { OrganizationsModule } from "./modules/organizations/organizations.module";
import { LocationsModule } from "./modules/locations/locations.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes environment variables available across the app
    }),
    TypeOrmModule.forRoot({ ...databaseConfig, autoLoadEntities: true }),
    SkillsModule,
    CategoriesModule,
    OrganizationsModule,
    LocationsModule,
  ],
})
export class AppModule {}
