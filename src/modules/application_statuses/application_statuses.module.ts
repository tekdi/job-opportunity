import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApplicationStatus } from "./entities/application_status.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationStatus])],
  exports: [TypeOrmModule],
})
export class ApplicationStatusesModule {}
