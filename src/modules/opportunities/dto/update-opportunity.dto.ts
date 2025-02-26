import { PartialType } from '@nestjs/mapped-types';
import { CreateOpportunityDto } from './create-opportunity.dto';
import {
  IsUUID,
  IsOptional,
  ValidateIf,
  IsArray,
  IsInt,
  Min,
  MaxLength,
  IsString,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { OpportunityPricingType } from '../entities/opportunity.entity';

export class UpdateOpportunityDto extends PartialType(CreateOpportunityDto) {
  @ValidateIf((o) => o.updated_by && o.updated_by.trim() !== '')
  @IsOptional()
  @IsUUID()
  updated_by?: string;

  @ValidateIf((o) => o.location && o.location.trim() !== '')
  @IsOptional()
  @IsUUID()
  location?: string;

  @ValidateIf((o) => o.company && o.company.trim() !== '')
  @IsOptional()
  @IsUUID()
  company?: string;

  @ValidateIf((o) => o.category && o.category.trim() !== '')
  @IsOptional()
  @IsUUID()
  category?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  skills?: string[];

  @IsOptional()
  @IsUUID()
  benefit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  other_benefit?: string;

  @IsOptional()
  @IsString()
  rejection_reason?: string;

  @IsBoolean()
  @IsOptional()
  offer_letter_provided?: boolean;

  @IsEnum(OpportunityPricingType)
  @IsOptional()
  pricing_type?: OpportunityPricingType;
}
