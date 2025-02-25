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

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
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
  findAll(@Query() query: any, @Res() res: any) {
    return this.organizationsService.findAll(query, res);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Res() res: any) {
    return this.organizationsService.findOne(id, res);
  }

  @Patch(':id')
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
  remove(@Param('id') id: string, @Res() res: any) {
    return this.organizationsService.remove(id, res);
  }
}
