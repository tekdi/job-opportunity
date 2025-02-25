import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Query,
  Delete,
  Patch,
  Res,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Query('userId') userId: string,
    @Res() res: any,
  ) {
    return this.categoriesService.create(createCategoryDto, userId, res);
  }

  @Get()
  findAll(@Query() query: any, @Res() res: any) {
    return this.categoriesService.findAll(query, res);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Res() res: any) {
    return this.categoriesService.findOne(id, res);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Res() res: any,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, userId, res);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Res() res: any) {
    return this.categoriesService.remove(id, res);
  }
}
