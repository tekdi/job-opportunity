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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Opportunity Applications')
@Controller('opportunity-applications')
export class OpportunityApplicationController {
  constructor(
    private readonly opportunityApplicationService: OpportunityApplicationService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new opportunity application' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Opportunity application created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiBody({ type: CreateOpportunityApplicationDto })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'ID of the user creating the application',
  })
  create(
    @Body() createOpportunityApplicationDto: CreateOpportunityApplicationDto,
    @Query('userId') userId: string,
    @Res() res: any // Ensure res is properly typed
  ) {
    // Validate userId
    if (!userId) {
      return APIResponse.error(
        res,
        'CREATE_OPPORTUNITY_APPLICATION',
        'MISSING_USER_ID',
        'UserId is required',
        HttpStatus.BAD_REQUEST
      );
    }

    return this.opportunityApplicationService.create(
      {
        ...createOpportunityApplicationDto,
        created_by: userId,
        updated_by: userId,
      }, // DTO as the first argument
      res // Response as the second argument
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all opportunity applications' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of opportunity applications retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query parameters',
  })
  findAll(@Query() query: any, @Res() res: any) {
    return this.opportunityApplicationService.findAll(query, res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an opportunity application by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Opportunity application retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Opportunity application not found',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the opportunity application',
  })
  findOne(@Param('id') id: string, @Res() res: any) {
    return this.opportunityApplicationService.findOne(id, res);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an opportunity application' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Opportunity application updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the opportunity application',
  })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'ID of the user updating the application',
  })
  @ApiBody({ type: UpdateOpportunityApplicationDto })
  update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() updateOpportunityApplicationDto: UpdateOpportunityApplicationDto,
    @Res() res: any
  ) {
    if (!userId) {
      return APIResponse.error(
        res,
        'UserId is required.',
        'ERROR_MISSING_USER_ID',
        'User ID is required for updating the application',
        HttpStatus.BAD_REQUEST
      );
    }

    // Assign userId to updated_by inside DTO before passing it to service
    updateOpportunityApplicationDto.updated_by = userId;

    return this.opportunityApplicationService.update(
      id,
      updateOpportunityApplicationDto,
      res
    );
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive an opportunity application' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Opportunity application archived successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Opportunity application not found',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the opportunity application',
  })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'ID of the user archiving the application',
  })
  async archive(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Res() res: any
  ) {
    return this.opportunityApplicationService.archive(res, id, userId);
  }
}
