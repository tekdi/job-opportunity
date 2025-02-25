import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  Patch,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  // @Post()
  // create(
  //   @Body() createSkillDto: CreateSkillDto,
  //   @Query('userId') userId: string,
  // ) {
  //   return this.skillsService.create({
  //     ...createSkillDto,
  //     created_by: userId,
  //     updated_by: userId,
  //   });
  // }

  // @Get()
  // findAll(@Query() query: any) {
  //   return this.skillsService.findAll(query);
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.skillsService.findOne(id);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Query('userId') userId: string,
  //   @Body() updateSkillDto: UpdateSkillDto,
  // ) {
  //   return this.skillsService.update(id, {
  //     ...updateSkillDto,
  //     updated_by: userId,
  //   });
  // }

  @Post()
  async create(
    @Body() createSkillDto: CreateSkillDto,
    @Query('userId') userId: string,
    @Res() res: any,
  ) {
    return await this.skillsService.create(
      { ...createSkillDto, created_by: userId, updated_by: userId },
      res,
    );
  }

  @Get()
  async findAll(@Query() query: any, @Res() res: any) {
    return await this.skillsService.findAll(query, res);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: any) {
    return await this.skillsService.findOne(id, res);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @Res() res: any,
  ) {
    return await this.skillsService.update(
      id,
      { ...updateSkillDto, updated_by: userId },
      res,
    );
  }
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.skillsService.remove(id);
  // }

  @Delete(':id')
  remove(@Param('id') id: string, @Res() res: any) {
    return this.skillsService.remove(id, res);
  }
}
