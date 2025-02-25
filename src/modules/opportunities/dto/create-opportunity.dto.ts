import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsNumber,
  ValidateIf,
  IsArray,
  IsInt,
  Min,
  MaxLength,
} from "class-validator";

export class CreateOpportunityDto {
  @IsNotEmpty()
  @IsString()
  title: string = "";

  @IsOptional()
  @IsString()
  description?: string = "";

  @IsBoolean()
  is_remote: boolean = false;

  @IsNotEmpty()
  @IsEnum(["full-time", "mid", "contract", "internship"])
  opportunity_type: string = "full-time";

  @IsNotEmpty()
  @IsEnum(["entry", "part-time", ""])
  experience_level: string = "entry";

  @IsOptional()
  @IsNumber()
  min_experience?: number = 0;

  @IsOptional()
  @IsNumber()
  min_salary?: number = 0;

  @IsOptional()
  @IsNumber()
  max_salary?: number = 0;

  @IsNotEmpty()
  @IsNumber()
  no_of_candidates: number = 1;

  @IsNotEmpty()
  @IsEnum(["open", "closed", "archived", "pending", "approved", "rejected"])
  status: string = "pending";

  @IsOptional()
  @IsString()
  rejection_reason?: string;

  @IsArray()
  @IsUUID("4", { each: true })
  skills?: string[];

  @ValidateIf((o) => o.created_by && o.created_by.trim() !== "")
  @IsUUID()
  created_by?: string;

  @ValidateIf((o) => o.updated_by && o.updated_by.trim() !== "")
  @IsUUID()
  updated_by?: string;

  @ValidateIf((o) => o.location && o.location.trim() !== "")
  @IsUUID()
  location?: string;

  @ValidateIf((o) => o.company && o.company.trim() !== "")
  @IsUUID()
  company?: string;

  @ValidateIf((o) => o.category && o.category.trim() !== "")
  @IsUUID()
  category?: string;

  @IsOptional()
  @IsUUID()
  benefit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  other_benefit?: string;
}
