import {
  IsUUID,
  IsOptional,
  IsNumber,
  IsString,
  IsNotEmpty,
  IsArray,
} from 'class-validator';

export class CreateOpportunityApplicationDto {
  @IsUUID()
  @IsNotEmpty()
  opportunity_id?: string;

  @IsUUID()
  @IsNotEmpty()
  user_id?: string;

  @IsNumber()
  @IsOptional()
  match_score?: number;

  @IsString()
  @IsOptional()
  feedback?: string;

  @IsString()
  @IsOptional()
  youth_feedback?: string;

  @IsUUID()
  @IsNotEmpty()
  created_by!: string;

  @IsUUID()
  @IsNotEmpty()
  updated_by!: string;

  @IsUUID()
  @IsNotEmpty()
  status_id?: string;

  @IsArray()
  @IsNotEmpty()
  applied_skills?: string[];
}
