import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { OpportunityApplication } from './entities/opportunity-application.entity';
import { OpportunityApplicationService } from './opportunity_applications.service';
import { OpportunityApplicationController } from './opportunity_applications.controller';
import { UserServiceClient } from './user-service.client';

@Module({
  imports: [
    TypeOrmModule.forFeature([OpportunityApplication]),
    HttpModule,
  ],
  controllers: [OpportunityApplicationController],
  providers: [OpportunityApplicationService, UserServiceClient],
  exports: [OpportunityApplicationService],
})
export class OpportunityApplicationModule {}
