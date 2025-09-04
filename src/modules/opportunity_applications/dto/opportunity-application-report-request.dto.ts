import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class OpportunityApplicationReportRequestDto {
  @ApiProperty({ 
    description: 'ID of the opportunity',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  opportunityId!: string;

  @ApiProperty({ 
    description: 'ID of the user',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;
}
