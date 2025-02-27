import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationStatus } from './entities/application_status.entity';
import { ApplicationStatusesService } from './application-statuses.service';
import { ApplicationStatusesController } from './application-statuses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationStatus])],
  providers: [ApplicationStatusesService],
  controllers: [ApplicationStatusesController],
  exports: [TypeOrmModule],
})
export class ApplicationStatusesModule {}
