import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { BenefitsService } from './benefits.service';
import { CreateBenefitsDto, UpdateBenefitsDto } from './dto/benefits.dto';

@Controller('benefits')
export class BenefitsController {
  constructor(private readonly benefitsService: BenefitsService) {}

  @Post()
  create(@Body() createBenefitsDto: CreateBenefitsDto, @Res() res: any) {
    return this.benefitsService.create(createBenefitsDto, res);
  }

  @Get()
  findAll(@Res() res: any) {
    return this.benefitsService.findAll(res);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Res() res: any) {
    return this.benefitsService.findOne(id, res);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBenefitsDto: UpdateBenefitsDto,
    @Res() res: any,
  ) {
    return this.benefitsService.update(id, updateBenefitsDto, res);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Res() res: any) {
    return this.benefitsService.remove(id, res);
  }
}
