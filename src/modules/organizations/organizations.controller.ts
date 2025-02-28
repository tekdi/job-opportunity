import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
  Patch,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import APIResponse from 'modules/common/responses/response';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({
    status: 201,
    description: 'Organization created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiQuery({
    name: 'userId',
    description: 'User ID creating the organization',
    required: true,
  })
  @ApiBody({ type: CreateOrganizationDto })
  create(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @Query('userId') userId: string,
    @Res() res: any
  ) {
    createOrganizationDto.created_by = userId;
    createOrganizationDto.updated_by = userId;
    return this.organizationsService.create(createOrganizationDto, res);
  }

  @Get()
  @ApiOperation({ summary: 'Get a list of all organizations' })
  @ApiResponse({
    status: 200,
    description: 'Organizations retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  findAll(@Query() query: any, @Res() res: any) {
    return this.organizationsService.findAll(query, res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific organization' })
  @ApiResponse({ status: 200, description: 'Organization found' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  findOne(@Param('id') id: string, @Res() res: any) {
    return this.organizationsService.findOne(id, res);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an organization by ID' })
  @ApiResponse({
    status: 200,
    description: 'Organization updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiQuery({
    name: 'userId',
    description: 'User ID updating the organization',
    required: true,
  })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiBody({ type: UpdateOrganizationDto })
  update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @Res() res: any
  ) {
    updateOrganizationDto.updated_by = userId;
    return this.organizationsService.update(id, updateOrganizationDto, res);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an organization by ID' })
  @ApiResponse({
    status: 200,
    description: 'Organization deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  remove(@Param('id') id: string, @Res() res: any) {
    return this.organizationsService.remove(id, res);
  }
}
