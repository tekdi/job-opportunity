import { IsString, IsOptional } from "class-validator";

export class CreateOrganizationDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  website?: string;
}
