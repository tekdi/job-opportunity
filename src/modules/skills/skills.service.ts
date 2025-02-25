import { Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import APIResponse from 'modules/common/responses/response';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>
  ) {}

  async create(createSkillDto: CreateSkillDto, res: any): Promise<any> {
    try {
      const skill = this.skillRepository.create(createSkillDto);
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

  async findAll(query: any, res: any): Promise<any> {
    try {
      const page = query.page ? parseInt(query.page, 10) : 1;
      const limit = query.limit ? parseInt(query.limit, 10) : 10;

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

      qb.skip((page - 1) * limit).take(limit);
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
