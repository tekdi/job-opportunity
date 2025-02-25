import {
  IsString,
  IsOptional,
  IsDecimal,
  IsNotEmpty,
  IsUUID,
} from "class-validator";

export class CreateLocationDto {
  @IsNotEmpty()
  @IsString()
  city!: string;

  @IsNotEmpty()
  @IsString()
  state?: string;

  @IsNotEmpty()
  @IsString()
  country!: string;

  @IsDecimal()
  @IsOptional()
  latitude?: number;

  @IsDecimal()
  @IsOptional()
  longitude?: number;

  @IsNotEmpty()
  @IsUUID()
  created_by!: string;

  @IsNotEmpty()
  @IsUUID()
  updated_by!: string;
}
