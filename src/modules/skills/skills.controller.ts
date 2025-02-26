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
} from "@nestjs/common";
import { SkillsService } from "./skills.service";
import { CreateSkillDto } from "./dto/create-skill.dto";
import { UpdateSkillDto } from "./dto/update-skill.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
  ApiParam,
} from "@nestjs/swagger";

@ApiTags("Skills") // Group all endpoints under "Skills" in Swagger
@Controller("skills")
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new skill" })
  @ApiResponse({ status: 201, description: "Skill created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiBody({ type: CreateSkillDto })
  @ApiQuery({
    name: "userId",
    type: String,
    required: true,
    description: "User ID of creator",
  })
  async create(
    @Body() createSkillDto: CreateSkillDto,
    @Query("userId") userId: string,
    @Res() res: any
  ) {
    return await this.skillsService.create(
      { ...createSkillDto, created_by: userId, updated_by: userId },
      res
    );
  }

  @Get()
  @ApiOperation({ summary: "Get all skills" })
  @ApiResponse({ status: 200, description: "Skills retrieved successfully" })
  @ApiQuery({
    name: "filter",
    required: false,
    description: "Optional filter criteria",
  })
  async findAll(@Query() query: any, @Res() res: any) {
    return await this.skillsService.findAll(query, res);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a skill by ID" })
  @ApiResponse({ status: 200, description: "Skill retrieved successfully" })
  @ApiResponse({ status: 404, description: "Skill not found" })
  @ApiParam({ name: "id", type: String, description: "Skill ID" })
  async findOne(@Param("id") id: string, @Res() res: any) {
    return await this.skillsService.findOne(id, res);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a skill" })
  @ApiResponse({ status: 200, description: "Skill updated successfully" })
  @ApiResponse({ status: 404, description: "Skill not found" })
  @ApiBody({ type: UpdateSkillDto })
  @ApiQuery({
    name: "userId",
    type: String,
    required: true,
    description: "User ID of updater",
  })
  @ApiParam({ name: "id", type: String, description: "Skill ID" })
  async update(
    @Param("id") id: string,
    @Query("userId") userId: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @Res() res: any
  ) {
    return await this.skillsService.update(
      id,
      { ...updateSkillDto, updated_by: userId },
      res
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a skill" })
  @ApiResponse({ status: 200, description: "Skill deleted successfully" })
  @ApiResponse({ status: 404, description: "Skill not found" })
  @ApiParam({ name: "id", type: String, description: "Skill ID" })
  remove(@Param("id") id: string, @Res() res: any) {
    return this.skillsService.remove(id, res);
  }
}
