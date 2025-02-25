import { PartialType } from "@nestjs/mapped-types";
import { CreateLocationDto } from "./create-location.dto";
import {
  IsDecimal,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class UpdateLocationDto extends PartialType(CreateLocationDto) {
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
  updated_by!: string;
}
