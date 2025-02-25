import { Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import APIResponse from 'modules/common/responses/response';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  // async create(
  //   createCategoryDto: CreateCategoryDto,
  //   userId: string
  // ): Promise<Category> {
  //   const category = new Category();
  //   category.name = createCategoryDto.name;
  //   category.created_by = userId;
  //   category.updated_by = userId;

  //   return this.entityManager.save(Category, category);
  // }

  async create(
    createCategoryDto: CreateCategoryDto,
    userId: string,
    res: any,
  ): Promise<any> {
    try {
      const category = new Category();
      category.name = createCategoryDto.name;
      category.created_by = userId;
      category.updated_by = userId;

      const savedCategory = await this.entityManager.save(Category, category);

      return APIResponse.success(
        res,
        'Category created successfully',
        savedCategory,
        HttpStatus.OK,
        'Category created successfully',
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Failed to create category',
        'ERROR_CREATE_CATEGORY',
        'Error Creating Category',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // async findAll(query: any): Promise<Category[]> {
  //   const page = query.page ? parseInt(query.page, 10) : 1;
  //   const limit = query.limit ? parseInt(query.limit, 10) : 10;

  //   const qb = this.entityManager.createQueryBuilder(Category, 'category');

  //   // ✅ Search by name
  //   if (query.search) {
  //     qb.andWhere('category.name ILIKE :search', {
  //       search: `%${query.search}%`,
  //     });
  //   }

  //   // ✅ Sorting (Order By)
  //   if (query.orderBy) {
  //     const validFields = [
  //       'name',
  //       'created_by',
  //       'updated_by',
  //       'created_at',
  //       'updated_at',
  //     ];
  //     if (validFields.includes(query.orderBy)) {
  //       qb.orderBy(
  //         `category.${query.orderBy}`,
  //         query.order && query.order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
  //       );
  //     }
  //   } else {
  //     // Default order by created_at if no orderBy field is provided
  //     qb.orderBy('category.created_at', 'DESC');
  //   }

  //   qb.skip((page - 1) * limit).take(limit);

  //   return qb.getMany();
  // }

  // async findOne(id: string): Promise<Category> {
  //   const category = await this.entityManager.findOne(Category, {
  //     where: { id },
  //   });
  //   if (!category) {
  //     throw new NotFoundException(`Category with ID ${id} not found`);
  //   }
  //   return category;
  // }
  async findAll(query: any, res: any): Promise<any> {
    try {
      const page = query.page ? parseInt(query.page, 10) : 1;
      const limit = query.limit ? parseInt(query.limit, 10) : 10;

      const qb = this.entityManager.createQueryBuilder(Category, 'category');

      if (query.search) {
        qb.andWhere('category.name ILIKE :search', {
          search: `%${query.search}%`,
        });
      }

      if (query.orderBy) {
        const validFields = [
          'name',
          'created_by',
          'updated_by',
          'created_at',
          'updated_at',
        ];
        if (validFields.includes(query.orderBy)) {
          qb.orderBy(
            `category.${query.orderBy}`,
            query.order && query.order.toUpperCase() === 'DESC'
              ? 'DESC'
              : 'ASC',
          );
        }
      } else {
        qb.orderBy('category.created_at', 'DESC');
      }

      qb.skip((page - 1) * limit).take(limit);
      const categories = await qb.getMany();

      return APIResponse.success(
        res,
        'Categories retrieved successfully',
        categories,
        HttpStatus.OK,
        'Categories retrieved successfully',
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Failed to fetch categories',
        'ERROR_FETCH_CATEGORIES',
        'Error Fetching Categories',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async findOne(id: string, res: any): Promise<any> {
    try {
      const category = await this.entityManager.findOne(Category, {
        where: { id },
      });
      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      return APIResponse.success(
        res,
        'Category retrieved successfully',
        category,
        HttpStatus.OK,
        'Category retrieved successfully',
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Failed to fetch category',
        'ERROR_FETCH_CATEGORY',
        'Error Fetching Category',
        HttpStatus.NOT_FOUND,
      );
    }
  }
  // async update(
  //   id: string,
  //   updateCategoryDto: UpdateCategoryDto,
  //   userId: string,
  // ): Promise<Category> {
  //   const category = await this.entityManager.findOne(Category, {
  //     where: { id },
  //   });

  //   if (!category) {
  //     throw new NotFoundException(`Category with ID ${id} not found`);
  //   }

  //   Object.assign(category, {
  //     ...(updateCategoryDto.name !== undefined && {
  //       name: updateCategoryDto.name,
  //     }),
  //     updated_by: userId,
  //   });

  //   return this.entityManager.save(Category, category);
  // }

  // async findOne(id: string, res: any): Promise<any> {
  //   try {
  //     const category = await this.entityManager.findOne(Category, {
  //       where: { id },
  //     });
  //     if (!category) {
  //       throw new NotFoundException(`Category with ID ${id} not found`);
  //     }

  //     return APIResponse.success(
  //       res,
  //       'Category retrieved successfully',
  //       category,
  //       HttpStatus.OK,
  //       'Category retrieved successfully',
  //     );
  //   } catch (error) {
  //     return APIResponse.error(
  //       res,
  //       'Failed to fetch category',
  //       'ERROR_FETCH_CATEGORY',
  //       'Error Fetching Category',
  //       HttpStatus.NOT_FOUND,
  //     );
  //   }
  // }
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    userId: string,
    res: any,
  ): Promise<any> {
    try {
      const category = await this.entityManager.findOne(Category, {
        where: { id },
      });
      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      Object.assign(category, {
        ...(updateCategoryDto.name !== undefined && {
          name: updateCategoryDto.name,
        }),
        updated_by: userId,
      });

      const updatedCategory = await this.entityManager.save(Category, category);

      return APIResponse.success(
        res,
        'Category updated successfully',
        updatedCategory,
        HttpStatus.OK,
        'Category updated successfully',
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Failed to update category',
        'ERROR_UPDATE_CATEGORY',
        'Error Updating Category',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  // async remove(id: string): Promise<void> {
  //   const category = await this.entityManager.findOne(Category, {
  //     where: { id },
  //   });
  //   if (!category) {
  //     throw new NotFoundException(`Category with ID ${id} not found`);
  //   }
  //   await this.entityManager.delete(Category, id);
  // }

  async remove(id: string, res: any): Promise<any> {
    try {
      const category = await this.entityManager.findOne(Category, {
        where: { id },
      });
      if (!category) {
        return APIResponse.error(
          res,
          `Category with ID ${id} not found`,
          'ERROR_DELETE_CATEGORY',
          'Error Deleting Category',
          HttpStatus.NOT_FOUND,
        );
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      await this.entityManager.delete(Category, id);

      return APIResponse.success(
        res,
        'Category deleted successfully',
        null,
        HttpStatus.OK,
        'Category deleted successfully',
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Failed to delete category',
        'ERROR_DELETE_CATEGORY',
        'Error Deleting Category',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
