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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiQuery({
    name: 'userId',
    description: 'User ID creating the category',
    required: true,
  })
  @ApiBody({ type: CreateCategoryDto })
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Query('userId') userId: string,
    @Res() res: any
  ) {
    return this.categoriesService.create(createCategoryDto, userId, res);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Returns all categories' })
  @ApiQuery({
    name: 'query',
    description: 'Optional query filters',
    required: false,
  })
  findAll(@Query() query: any, @Res() res: any) {
    return this.categoriesService.findAll(query, res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific category by ID' })
  @ApiResponse({ status: 200, description: 'Returns the requested category' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  findOne(@Param('id') id: string, @Res() res: any) {
    return this.categoriesService.findOne(id, res);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category by ID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiQuery({
    name: 'userId',
    description: 'User ID performing the update',
    required: true,
  })
  @ApiBody({ type: UpdateCategoryDto })
  update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Res() res: any
  ) {
    return this.categoriesService.update(id, updateCategoryDto, userId, res);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  remove(@Param('id') id: string, @Res() res: any) {
    return this.categoriesService.remove(id, res);
  }
}
