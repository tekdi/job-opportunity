import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Benefit } from './entities/benefits.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Benefit])],
  exports: [TypeOrmModule],
})
export class BenefitsModule {}
