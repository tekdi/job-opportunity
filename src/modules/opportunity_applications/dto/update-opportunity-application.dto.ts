import { PartialType } from '@nestjs/mapped-types';
import { IsUUID, IsOptional, IsNotEmpty, ValidateIf } from 'class-validator';

export class UpdateOpportunityApplicationDto {
  @IsOptional()
  @IsUUID()
  opportunity_id?: string;

  @IsOptional()
  @IsUUID()
  status_id?: string;

  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  match_score?: number;

  @IsOptional()
  feedback?: string;

  @IsOptional()
  youth_feedback?: string;

  @IsOptional()
  applied_skills?: string[];

  @ValidateIf((o) => o.created_by !== undefined)
  @IsUUID()
  @IsNotEmpty()
  created_by?: string;

  @ValidateIf((o) => o.updated_by !== undefined)
  @IsUUID()
  @IsNotEmpty()
  updated_by?: string;
}
