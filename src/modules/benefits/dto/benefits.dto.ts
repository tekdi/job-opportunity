import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBenefitsDto {
  @IsNotEmpty()
  @IsString()
  name!: string;
}

export class UpdateBenefitsDto {
  @IsOptional()
  @IsString()
  name?: string;
}
