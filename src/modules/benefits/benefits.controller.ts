import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from "@nestjs/common";
import { BenefitsService } from "./benefits.service";
import { CreateBenefitsDto, UpdateBenefitsDto } from "./dto/benefits.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("benefits")
@Controller("benefits")
export class BenefitsController {
  constructor(private readonly benefitsService: BenefitsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new benefit" })
  @ApiResponse({
    status: 201,
    description: "The benefit has been successfully created.",
  })
  @ApiResponse({ status: 403, description: "Forbidden." })
  create(@Body() createBenefitsDto: CreateBenefitsDto, @Res() res: any) {
    return this.benefitsService.create(createBenefitsDto, res);
  }

  @Get()
  @ApiOperation({ summary: "Get all benefits" })
  @ApiResponse({ status: 200, description: "Return all benefits." })
  findAll(@Res() res: any) {
    return this.benefitsService.findAll(res);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a benefit by ID" })
  @ApiResponse({ status: 200, description: "Return the benefit." })
  @ApiResponse({ status: 404, description: "Benefit not found." })
  findOne(@Param("id") id: string, @Res() res: any) {
    return this.benefitsService.findOne(id, res);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a benefit by ID" })
  @ApiResponse({
    status: 200,
    description: "The benefit has been successfully updated.",
  })
  @ApiResponse({ status: 404, description: "Benefit not found." })
  update(
    @Param("id") id: string,
    @Body() updateBenefitsDto: UpdateBenefitsDto,
    @Res() res: any
  ) {
    return this.benefitsService.update(id, updateBenefitsDto, res);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a benefit by ID" })
  @ApiResponse({
    status: 200,
    description: "The benefit has been successfully deleted.",
  })
  @ApiResponse({ status: 404, description: "Benefit not found." })
  remove(@Param("id") id: string, @Res() res: any) {
    return this.benefitsService.remove(id, res);
  }
}
