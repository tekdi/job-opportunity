import { Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import APIResponse from 'modules/common/responses/response';
import { isUUID } from 'class-validator';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
    private readonly categoriesService: CategoriesService
  ) {}

  // Check skill and caetgories id
  async validateSkill(name: string, categories_id?: string): Promise<boolean> {
    if (!name || name.trim().length === 0) {
      throw new Error('Skill name cannot be empty');
    }

    const existingSkill = await this.skillRepository.findOne({
      where: {
        name: ILike(name.trim()),
        ...(categories_id ? { categories_id } : {}), // Check category only if provided
      },
    });

    return !!existingSkill; // Returns true if skill exists, otherwise false
  }

  //create skills
  async create(
    createSkillDto: CreateSkillDto,
    res: any,
    created_by: string, // Add created_by
    updated_by: string
  ): Promise<any> {
    try {
      let { name, categories_id } = createSkillDto;
      name = name.trim();
      categories_id = categories_id?.trim() ?? null;
      // Validate categories_id if provided
      if (categories_id) {
        if (!isUUID(categories_id)) {
          return APIResponse.error(
            res,
            'Invalid category ID format',
            'ERROR_INVALID_CATEGORY_ID',
            'Provided categories_id is not a valid UUID',
            HttpStatus.BAD_REQUEST
          );
        }
      }
      // Check if the skill with same name & categories_id exists
      if (categories_id) {
        // Check if the skill with the same name & categories_id exists
        const existingSkillWithCategory = await this.skillRepository.findOne({
          where: {
            name: ILike(name),
            categories_id: categories_id, // Only check category if provided
          },
        });

        if (existingSkillWithCategory) {
          return APIResponse.error(
            res,
            'Skill with the same name and category already exists',
            'ERROR_CREATE_SKILL_DUPLICATE',
            'Skill with the same name and category already exists',
            HttpStatus.CONFLICT
          );
        }
      } else {
        // If categories_id is not provided, check only for the name
        const existingSkillWithoutCategory = await this.skillRepository.findOne(
          {
            where: { name: ILike(name) },
          }
        );

        if (existingSkillWithoutCategory) {
          return APIResponse.error(
            res,
            'Skill name already exists',
            'ERROR_CREATE_SKILL_DUPLICATE_NAME',
            'Skill with the same name already exists',
            HttpStatus.CONFLICT
          );
        }
      }

      // Create and save the skill
      const skill = this.skillRepository.create({
        name: name.trim(),
        categories_id, // Assign undefined instead of null
        created_by: created_by, // Add created_by
        updated_by: updated_by, // Add updated_by // Add updated_by
      });

      const savedSkill = await this.skillRepository.save(skill);

      return APIResponse.success(
        res,
        'Skill created successfully',
        savedSkill,
        HttpStatus.CREATED,
        'Skill created successfully'
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Failed to create skill',
        'ERROR_CREATE_SKILL',
        'Error Creating Skill',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // Fetch all skills

  async findAll(query: any, res: any): Promise<any> {
    try {
      const page = query.page ? parseInt(query.page, 10) : 1;
      const limit = query.limit ? parseInt(query.limit, 10) : null;

      const qb = this.skillRepository.createQueryBuilder('skill');

      if (query.name) {
        qb.andWhere('skill.name ILIKE :name', { name: `%${query.name}%` });
      }

      if (query.orderBy) {
        const order = query.order === 'DESC' ? 'DESC' : 'ASC';
        qb.orderBy(`skill.${query.orderBy}`, order);
      } else {
        qb.orderBy('skill.created_at', 'DESC');
      }

      if (limit) {
        qb.skip((page - 1) * limit).take(limit);
      }
      const skills = await qb.getMany();

      return APIResponse.success(
        res,
        'Skills retrieved successfully',
        skills,
        HttpStatus.OK,
        'Skills retrieved successfully'
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Failed to fetch skills',
        'ERROR_FETCH_SKILLS',
        'Error Fetching Skills',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // Get skill details
  async findOne(id: string, res: any): Promise<any> {
    try {
      const skill = await this.skillRepository.findOne({ where: { id } });

      if (!skill) {
        return APIResponse.error(
          res,
          `Skill with ID ${id} not found`,
          'ERROR_SKILL_NOT_FOUND',
          'Skill not found',
          HttpStatus.NOT_FOUND
        );
      }

      return APIResponse.success(
        res,
        'Skill retrieved successfully',
        skill,
        HttpStatus.OK,
        'Skill retrieved successfully'
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Failed to fetch skill',
        'ERROR_FETCH_SKILL',
        'Error Fetching Skill',
        HttpStatus.NOT_FOUND
      );
    }
  }

  // Update skill
  async update(
    id: string,
    updateSkillDto: UpdateSkillDto,
    res: any
  ): Promise<any> {
    try {
      // Fetch skill directly
      const skill = await this.skillRepository.findOne({ where: { id } });

      if (!skill) {
        return APIResponse.error(
          res,
          'Skill not found',
          'ERROR_UPDATE_SKILL_NOT_FOUND',
          'Error Updating Skill Not Found',
          HttpStatus.NOT_FOUND
        );
      }

      // Check if a different skill with the same name (case-insensitive) already exists
      if (updateSkillDto.name) {
        const existingSkill = await this.skillRepository.findOne({
          where: {
            name: ILike(updateSkillDto.name.trim()),
            id: Not(id), // Ensure it's not the same skill being updated
          },
        });

        if (existingSkill) {
          return APIResponse.error(
            res,
            'Skill name already exists',
            'ERROR_UPDATE_SKILL_DUPLICATE',
            'Skill with the same name already exists',
            HttpStatus.CONFLICT
          );
        }
      }

      // Ensure ID is retained to prevent creating a new entry
      Object.assign(skill, updateSkillDto, { id });

      // Save updates
      const updatedSkill = await this.skillRepository.save(skill);

      return APIResponse.success(
        res,
        'Skill updated successfully',
        updatedSkill,
        HttpStatus.OK,
        'Skill updated successfully'
      );
    } catch (error) {
      console.error('Update Error:', error);
      return APIResponse.error(
        res,
        'Failed to update skill',
        'ERROR_UPDATE_SKILL',
        'Error Updating Skill',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // Delete skill
  async remove(id: string, res: any): Promise<any> {
    try {
      // Fetch skill directly instead of using findOne(id, res)
      const skill = await this.skillRepository.findOne({ where: { id } });

      if (!skill) {
        return APIResponse.error(
          res,
          'Skill not found',
          'ERROR_SKILL_NOT_FOUND',
          'Error Skill Not Found',
          HttpStatus.NOT_FOUND
        );
      }

      // Delete the skill from the database
      await this.skillRepository.delete(id);

      return APIResponse.success(
        res,
        'Skill deleted successfully',
        null,
        HttpStatus.OK,
        'Skill deleted successfully'
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Failed to delete skill',
        'ERROR_DELETE_SKILL',
        'Error Deleting Skill',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
