import { IsString, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsNotEmpty()
  @IsUUID()
  created_by!: string;

  @IsNotEmpty()
  @IsUUID()
  updated_by!: string;
}
