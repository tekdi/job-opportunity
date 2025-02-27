import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Res,
} from "@nestjs/common";
import { ApplicationStatusesService } from "./application-statuses.service";
import { CreateApplicationStatusDto } from "./dto/create-application-status.dto";
import { UpdateApplicationStatusDto } from "./dto/update-application-status.dto";

@Controller("application-statuses")
export class ApplicationStatusesController {
  constructor(private readonly service: ApplicationStatusesService) {}

  @Post()
  create(@Body() createDto: CreateApplicationStatusDto, @Res() res: any) {
    return this.service.create(createDto, res);
  }

  @Get()
  findAll(@Res() res: any) {
    return this.service.findAll(res);
  }

  @Get(":id")
  findOne(@Param("id") id: string,res: any) {
    return this.service.findOne(id,res);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateDto: UpdateApplicationStatusDto,
    res: any
  ) {
    return this.service.update(id, updateDto,res);
  }

  @Delete(":id")
  remove(@Param("id") id: string,res: any) {
    return this.service.remove(id,res);
  }
}
