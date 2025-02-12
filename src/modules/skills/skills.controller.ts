import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
  Patch,
} from "@nestjs/common";
import { SkillsService } from "./skills.service";
import { CreateSkillDto } from "./dto/create-skill.dto";
import { UpdateSkillDto } from "./dto/update-skill.dto";

@Controller("skills")
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.create(createSkillDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.skillsService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.skillsService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillsService.update(id, updateSkillDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.skillsService.remove(id);
  }
}
