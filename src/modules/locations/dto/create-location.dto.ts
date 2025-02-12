import { IsString, IsOptional, IsDecimal } from "class-validator";

export class CreateLocationDto {
  @IsString()
  city!: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  country!: string;

  @IsDecimal()
  @IsOptional()
  latitude?: number;

  @IsDecimal()
  @IsOptional()
  longitude?: number;
}
