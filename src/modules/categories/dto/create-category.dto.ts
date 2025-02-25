import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCategoryDto {
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
