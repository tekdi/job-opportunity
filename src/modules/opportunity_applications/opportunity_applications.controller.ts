import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Patch,
  NotFoundException,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { OpportunityApplicationService } from './opportunity_applications.service';
import { CreateOpportunityApplicationDto } from './dto/create-opportunity-application.dto';
import { UpdateOpportunityApplicationDto } from './dto/update-opportunity-application.dto';
import APIResponse from 'modules/common/responses/response';

@Controller('opportunity-applications')
export class OpportunityApplicationController {
  constructor(
    private readonly opportunityApplicationService: OpportunityApplicationService,
  ) {}

  @Post()
  create(
    @Body() createOpportunityApplicationDto: CreateOpportunityApplicationDto,
    @Query('userId') userId: string,
    @Res() res: any, // Ensure res is properly typed
  ) {
    // Validate userId
    if (!userId) {
      return APIResponse.error(
        res,
        'CREATE_OPPORTUNITY_APPLICATION',
        'MISSING_USER_ID',
        'UserId is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.opportunityApplicationService.create(
      {
        ...createOpportunityApplicationDto,
        created_by: userId,
        updated_by: userId,
      }, // DTO as the first argument
      res, // Response as the second argument
    );
  }

  @Get()
  findAll(@Query() query: any, @Res() res: any) {
    return this.opportunityApplicationService.findAll(query, res);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Res() res: any) {
    return this.opportunityApplicationService.findOne(id, res);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() updateOpportunityApplicationDto: UpdateOpportunityApplicationDto,
    @Res() res: any,
  ) {
    if (!userId) {
      return APIResponse.error(
        res,
        'UserId is required.',
        'ERROR_MISSING_USER_ID',
        'User ID is required for updating the application',
        HttpStatus.BAD_REQUEST,
      );
    }

    // ✅ Assign userId to updated_by inside DTO before passing it to service
    updateOpportunityApplicationDto.updated_by = userId;

    return this.opportunityApplicationService.update(
      id,
      updateOpportunityApplicationDto,
      res,
    );
  }

  @Patch(':id/archive')
  async archive(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Res() res: any,
  ) {
    return this.opportunityApplicationService.archive(res, id, userId);
  }
}
