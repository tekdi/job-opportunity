import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { OpportunityModule } from './modules/opportunities/opportunity.module';
import { SkillsModule } from './modules/skills/skills.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { LocationsModule } from './modules/locations/locations.module';
import { OpportunityApplicationModule } from './modules/opportunity_applications/opportunity_applications.module';
import { ApplicationStatusesModule } from './modules/application_statuses/application_statuses.module';
import { BenefitsModule } from './modules/benefits/benefits.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes environment variables available across the app
    }),
    TypeOrmModule.forRoot({ ...databaseConfig, autoLoadEntities: true }),
    OpportunityModule,
    SkillsModule,
    CategoriesModule,
    OrganizationsModule,
    LocationsModule,
    OpportunityApplicationModule,
    ApplicationStatusesModule,
    BenefitsModule,
  ],
})
export class AppModule {}
