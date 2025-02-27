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
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new location' })
  @ApiResponse({ status: 201, description: 'Location created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiQuery({
    name: 'userId',
    description: 'User ID creating the location',
    required: true,
  })
  @ApiBody({ type: CreateLocationDto })
  create(
    @Res() res: any,
    @Body() createLocationDto: CreateLocationDto,
    @Query('userId') userId: string
  ) {
    return this.locationsService.create(res, createLocationDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all locations' })
  @ApiResponse({ status: 200, description: 'Returns all locations' })
  @ApiQuery({
    name: 'query',
    description: 'Optional query filters',
    required: false,
  })
  findAll(@Res() res: any, @Query() query: any) {
    return this.locationsService.findAll(res, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific location by ID' })
  @ApiResponse({ status: 200, description: 'Returns the requested location' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  findOne(@Res() res: any, @Param('id') id: string) {
    return this.locationsService.findOne(res, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a location by ID' })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiQuery({
    name: 'userId',
    description: 'User ID performing the update',
    required: true,
  })
  @ApiBody({ type: UpdateLocationDto })
  update(
    @Res() res: any,
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() updateLocationDto: UpdateLocationDto
  ) {
    return this.locationsService.update(res, id, updateLocationDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a location by ID' })
  @ApiResponse({ status: 200, description: 'Location deleted successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  remove(@Res() res: any, @Param('id') id: string) {
    return this.locationsService.remove(res, id);
  }

  //get locations by country and state
  @Post('list')
  @ApiOperation({ summary: 'Get locations by country and state' })
  @ApiResponse({ status: 200, description: 'Locations retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiQuery({ name: 'country', description: 'Country name', required: false })
  @ApiQuery({ name: 'state', description: 'State name', required: false })
  findLocations(
    @Res() res: any,
    @Query('country') country?: string,
    @Query('state') state?: string
  ) {
    return this.locationsService.findLocations(res, country, state);
  }
}
