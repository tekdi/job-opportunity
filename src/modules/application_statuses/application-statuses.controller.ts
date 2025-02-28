import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Res,
} from '@nestjs/common';
import { ApplicationStatusesService } from './application-statuses.service';
import { CreateApplicationStatusDto } from './dto/create-application-status.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Application Statuses')
@Controller('application-statuses')
export class ApplicationStatusesController {
  constructor(private readonly service: ApplicationStatusesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new application status' })
  @ApiResponse({
    status: 201,
    description: 'Application status created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({ type: CreateApplicationStatusDto })
  create(@Body() createDto: CreateApplicationStatusDto, @Res() res: any) {
    return this.service.create(createDto, res);
  }

  @Get()
  @ApiOperation({ summary: 'Get all application statuses' })
  @ApiResponse({ status: 200, description: 'Returns all application statuses' })
  findAll(@Res() res: any) {
    return this.service.findAll(res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific application status by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the requested application status',
  })
  @ApiResponse({ status: 404, description: 'Application status not found' })
  @ApiParam({ name: 'id', description: 'Application status ID' })
  findOne(@Param('id') id: string, res: any) {
    return this.service.findOne(id, res);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an application status by ID' })
  @ApiResponse({
    status: 200,
    description: 'Application status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Application status not found' })
  @ApiParam({ name: 'id', description: 'Application status ID' })
  @ApiBody({ type: UpdateApplicationStatusDto })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateApplicationStatusDto,
    res: any
  ) {
    return this.service.update(id, updateDto, res);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an application status by ID' })
  @ApiResponse({
    status: 200,
    description: 'Application status deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Application status not found' })
  @ApiParam({ name: 'id', description: 'Application status ID' })
  remove(@Param('id') id: string, res: any) {
    return this.service.remove(id, res);
  }
}
