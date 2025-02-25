import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpportunityApplication } from './entities/opportunity-application.entity';
import { OpportunityApplicationService } from './opportunity_applications.service';
import { OpportunityApplicationController } from './opportunity_applications.controller';

@Module({
    imports: [TypeOrmModule.forFeature([OpportunityApplication])],
    controllers: [OpportunityApplicationController],
    providers: [OpportunityApplicationService],
    exports: [OpportunityApplicationService],
})
export class OpportunityApplicationModule {}