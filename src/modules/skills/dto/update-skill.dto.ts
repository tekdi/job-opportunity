import { IsOptional, IsUUID, IsString, IsNotEmpty } from "class-validator";

export class UpdateSkillDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsUUID()
  updated_by!: string;
}
