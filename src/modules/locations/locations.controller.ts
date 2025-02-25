import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
  Patch,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import APIResponse from 'modules/common/responses/response';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  create(
    @Res() res: any,
    @Body() createLocationDto: CreateLocationDto,
    @Query('userId') userId: string,
  ) {
    return this.locationsService.create(res, createLocationDto, userId);
  }

  @Get()
  findAll(@Res() res: any, @Query() query: any) {
    return this.locationsService.findAll(res, query);
  }

  @Get(':id')
  findOne(@Res() res: any, @Param('id') id: string) {
    return this.locationsService.findOne(res, id);
  }

  @Patch(':id')
  update(
    @Res() res: any,
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.locationsService.update(res, id, updateLocationDto, userId);
  }

  @Delete(':id')
  remove(@Res() res: any, @Param('id') id: string) {
    return this.locationsService.remove(res, id);
  }
}
