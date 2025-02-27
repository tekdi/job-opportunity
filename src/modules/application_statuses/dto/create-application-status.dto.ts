import { IsNotEmpty, IsString } from "class-validator";

export class CreateApplicationStatusDto {
  @IsNotEmpty()
  @IsString()
  status?: string;
}
