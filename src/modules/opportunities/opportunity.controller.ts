import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  NotFoundException,
  Patch,
  Res,
} from '@nestjs/common';
import { OpportunityService } from './opportunity.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';

@Controller('opportunities')
export class OpportunityController {
  constructor(private readonly opportunityService: OpportunityService) {}

  @Post()
  create(
    @Body() createOpportunityDto: CreateOpportunityDto,
    @Query('userId') userId: string,
    @Res() res: any,
  ) {
    // ✅ Pass `res` separately
    return this.opportunityService.create(res, {
      ...createOpportunityDto,
      created_by: userId,
      updated_by: userId, // Set the same userId for initial creation
    });
  }

  @Get()
  findAll(@Query() query: any, @Res() res: any): Promise<any> {
    return this.opportunityService.findAll(query, res);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Res() res: any) {
    return this.opportunityService.findOne(id, res);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() updateOpportunityDto: UpdateOpportunityDto,
    @Res() res: any, // Explicitly set Response type
  ) {
    // ✅ Assign userId to updated_by inside DTO before passing it to service
    updateOpportunityDto.updated_by = userId;

    // ✅ Pass `res` correctly to the service function
    return this.opportunityService.update(res, id, updateOpportunityDto);
  }

  @Patch(':id/archive')
  async archive(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Res() res: any,
  ) {
    if (!userId) {
      throw new NotFoundException('UserId is required.');
    }
    return this.opportunityService.archive(id, userId, res);
  }
}
