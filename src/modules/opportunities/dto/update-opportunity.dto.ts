import { PartialType } from "@nestjs/mapped-types";
import { CreateOpportunityDto } from "./create-opportunity.dto";
import {
  IsUUID,
  IsOptional,
  ValidateIf,
  IsArray,
  IsInt,
  Min,
  MaxLength,
  IsString,
} from "class-validator";

export class UpdateOpportunityDto extends PartialType(CreateOpportunityDto) {
  @ValidateIf((o) => o.updated_by && o.updated_by.trim() !== "")
  @IsOptional()
  @IsUUID()
  updated_by?: string;

  @ValidateIf((o) => o.location && o.location.trim() !== "")
  @IsOptional()
  @IsUUID()
  location?: string;

  @ValidateIf((o) => o.company && o.company.trim() !== "")
  @IsOptional()
  @IsUUID()
  company?: string;

  @ValidateIf((o) => o.category && o.category.trim() !== "")
  @IsOptional()
  @IsUUID()
  category?: string;

  @IsArray()
  @IsUUID("4", { each: true })
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
}
