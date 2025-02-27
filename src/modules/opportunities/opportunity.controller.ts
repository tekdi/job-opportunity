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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
@ApiTags('Opportunities')
@Controller('opportunities')
export class OpportunityController {
  constructor(private readonly opportunityService: OpportunityService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new opportunity' })
  @ApiResponse({ status: 201, description: 'Opportunity created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiQuery({
    name: 'userId',
    description: 'User ID creating the opportunity',
    required: true,
  })
  @ApiBody({ type: CreateOpportunityDto })
  create(
    @Body() createOpportunityDto: CreateOpportunityDto,
    @Query('userId') userId: string,
    @Res() res: any
  ) {
    // Pass `res` separately
    return this.opportunityService.create(res, {
      ...createOpportunityDto,
      created_by: userId,
      updated_by: userId, // Set the same userId for initial creation
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all opportunities' })
  @ApiResponse({ status: 200, description: 'Returns all opportunities' })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'title',
    required: false,
    description: 'Filter by opportunity title',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location UUID',
  })
  @ApiQuery({
    name: 'work_nature',
    required: false,
    description: 'Filter by work nature status (true/false)',
  })
  @ApiQuery({
    name: 'min_salary',
    required: false,
    description: 'Filter by minimum salary',
  })
  @ApiQuery({
    name: 'max_salary',
    required: false,
    description: 'Filter by maximum salary',
  })
  findAll(@Query() query: any, @Res() res: any): Promise<any> {
    return this.opportunityService.findAll(query, res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific opportunity by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the requested opportunity',
  })
  @ApiResponse({ status: 404, description: 'Opportunity not found' })
  @ApiParam({ name: 'id', description: 'Opportunity ID' })
  findOne(@Param('id') id: string, @Res() res: any) {
    return this.opportunityService.findOne(id, res);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an opportunity by ID' })
  @ApiResponse({ status: 200, description: 'Opportunity updated successfully' })
  @ApiResponse({ status: 404, description: 'Opportunity not found' })
  @ApiParam({ name: 'id', description: 'Opportunity ID' })
  @ApiQuery({
    name: 'userId',
    description: 'User ID performing the update',
    required: true,
  })
  @ApiBody({ type: UpdateOpportunityDto })
  update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() updateOpportunityDto: UpdateOpportunityDto,
    @Res() res: any // Explicitly set Response type
  ) {
    // Assign userId to updated_by inside DTO before passing it to service
    updateOpportunityDto.updated_by = userId;

    // Pass `res` correctly to the service function
    return this.opportunityService.update(res, id, updateOpportunityDto);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive an opportunity by ID' })
  @ApiResponse({
    status: 200,
    description: 'Opportunity archived successfully',
  })
  @ApiResponse({ status: 404, description: 'Opportunity not found' })
  @ApiParam({ name: 'id', description: 'Opportunity ID' })
  @ApiQuery({
    name: 'userId',
    description: 'User ID performing the archive',
    required: true,
  })
  async archive(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Res() res: any
  ) {
    if (!userId) {
      throw new NotFoundException('UserId is required.');
    }
    return this.opportunityService.archive(id, userId, res);
  }
}
