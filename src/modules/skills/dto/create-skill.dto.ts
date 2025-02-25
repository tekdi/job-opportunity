import { IsNotEmpty, IsUUID, IsString } from 'class-validator';

export class CreateSkillDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsUUID()
  created_by!: string;

  @IsNotEmpty()
  @IsUUID()
  updated_by!: string;
}
