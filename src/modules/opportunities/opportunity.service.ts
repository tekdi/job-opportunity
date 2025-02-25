import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager, ObjectType, FindOneOptions } from 'typeorm';
import { Opportunity } from './entities/opportunity.entity';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { Location } from '../locations/entities/location.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Category } from '../categories/entities/category.entity';
import { Benefit } from 'modules/benefits/entities/benefits.entity';
import { OpportunityResponseDto } from './dto/opportunity-response.dto';
import { Skill } from '../skills/entities/skill.entity';
import APIResponse from 'modules/common/responses/response';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
@Injectable()
export class OpportunityService {
  constructor(private readonly entityManager: EntityManager) {}

  // Create an opportunity
  async create(
    res: Response, // Pass res as first parameter
    createOpportunityDto: CreateOpportunityDto
  ): Promise<any> {
    try {
      if (!createOpportunityDto.title?.trim()) {
        throw new BadRequestException('Title is required and cannot be empty.');
      }

      if (!createOpportunityDto.created_by) {
        throw new BadRequestException('Created_by is required.');
      }

      if (!createOpportunityDto.updated_by) {
        throw new BadRequestException('Updated_by is required.');
      }

      // Validate and fetch related entities
      const location = createOpportunityDto.location
        ? await this.entityManager.findOne(Location, {
            where: { id: createOpportunityDto.location },
          })
        : null;

      const company = createOpportunityDto.company
        ? await this.entityManager.findOne(Organization, {
            where: { id: createOpportunityDto.company },
          })
        : null;

      const category = createOpportunityDto.category
        ? await this.entityManager.findOne(Category, {
            where: { id: createOpportunityDto.category },
          })
        : null;

      const benefit = createOpportunityDto.benefit
        ? await this.entityManager.findOne(Benefit, {
            where: { id: createOpportunityDto.benefit },
          })
        : null;

      // Throw error if any required entity is missing
      if (!location) {
        throw new BadRequestException(
          `Location with ID ${createOpportunityDto.location} not found.`
        );
      }
      if (!company) {
        throw new BadRequestException(
          `Company with ID ${createOpportunityDto.company} not found.`
        );
      }
      if (!category) {
        throw new BadRequestException(
          `Category with ID ${createOpportunityDto.category} not found.`
        );
      }

      if (
        createOpportunityDto.benefit &&
        !benefit &&
        createOpportunityDto.other_benefit
      ) {
        throw new BadRequestException(
          "Other Benefit can only be provided if 'Other' is selected as a benefit."
        );
      }

      // Ensure skills is an array
      const skills = Array.isArray(createOpportunityDto.skills)
        ? createOpportunityDto.skills
        : [];

      // Create and map Opportunity object
      const opportunity = new Opportunity();
      opportunity.title = createOpportunityDto.title.trim();
      opportunity.description = createOpportunityDto.description ?? '';
      opportunity.is_remote = createOpportunityDto.is_remote ?? false;
      opportunity.opportunity_type =
        createOpportunityDto.opportunity_type ?? 'Full-time';
      opportunity.experience_level =
        createOpportunityDto.experience_level ?? 'entry';
      opportunity.min_experience = createOpportunityDto.min_experience ?? 0;
      opportunity.min_salary = createOpportunityDto.min_salary ?? 0;
      opportunity.max_salary = createOpportunityDto.max_salary ?? 0;
      opportunity.no_of_candidates = createOpportunityDto.no_of_candidates;
      opportunity.status = createOpportunityDto.status;
      opportunity.skills = skills;
      opportunity.created_by = createOpportunityDto.created_by.trim();
      opportunity.updated_by = createOpportunityDto.updated_by.trim();
      opportunity.benefit = benefit ?? undefined;
      opportunity.other_benefit =
        benefit && benefit.name === 'Other'
          ? createOpportunityDto.other_benefit ?? undefined
          : undefined;

      // Assign relationships properly
      opportunity.location = location;
      opportunity.company = company;
      opportunity.category = category;

      // Save the opportunity in the database
      await this.entityManager.save(Opportunity, opportunity);

      // Return APIResponse.success with correct structure
      return APIResponse.success(
        res,
        'CREATE_OPPORTUNITY', // API ID (replace if needed)
        { data: opportunity, total: 1 },
        HttpStatus.OK,
        'Opportunity successfully created'
      );
    } catch (error) {
      // Return APIResponse.error in case of failure
      return APIResponse.error(
        res,
        'CREATE_OPPORTUNITY', // API ID (replace if needed)
        'CREATE_OPPORTUNITY_ERROR',
        'No opportunities Created',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Update an opportunity
  async update(
    res: Response, // Added res parameter
    id: string,
    updateOpportunityDto: UpdateOpportunityDto
  ): Promise<any> {
    try {
      const opportunity = await this.entityManager.findOne(Opportunity, {
        where: { id },
      });

      if (!opportunity) {
        throw new NotFoundException(`Opportunity with ID ${id} not found`);
      }

      // Utility function to fetch and validate related entities
      const validateAndFetch = async <T>(
        entityClass: ObjectType<T>,
        entityId?: string
      ): Promise<T | null> => {
        if (!entityId) return null;

        const entity = await this.entityManager.findOne(entityClass, {
          where: { id: entityId } as unknown as FindOneOptions<T>,
        });

        if (!entity) {
          throw new BadRequestException(
            `${(entityClass as any).name} with ID ${entityId} not found`
          );
        }

        return entity as T;
      };

      // Fetch related entities only if provided
      const location =
        updateOpportunityDto.location !== undefined
          ? await validateAndFetch(Location, updateOpportunityDto.location)
          : opportunity.location;

      const company =
        updateOpportunityDto.company !== undefined
          ? await validateAndFetch(Organization, updateOpportunityDto.company)
          : opportunity.company;

      const category =
        updateOpportunityDto.category !== undefined
          ? await validateAndFetch(Category, updateOpportunityDto.category)
          : opportunity.category;

      const benefit =
        updateOpportunityDto.benefit !== undefined
          ? await validateAndFetch(Benefit, updateOpportunityDto.benefit)
          : opportunity.benefit;

      // Handle skills array
      let skills: string[] = opportunity.skills ?? [];
      if (updateOpportunityDto.skills !== undefined) {
        skills = Array.isArray(updateOpportunityDto.skills)
          ? updateOpportunityDto.skills
          : opportunity.skills ?? [];
      }

      // Validate rejection reason
      if (
        updateOpportunityDto.status === 'rejected' &&
        (!updateOpportunityDto.rejection_reason ||
          updateOpportunityDto.rejection_reason.trim() === '')
      ) {
        throw new BadRequestException(
          "Rejection reason is required when setting status to 'rejected'."
        );
      }

      // Update fields only if provided
      Object.assign(opportunity, {
        ...(updateOpportunityDto.title !== undefined && {
          title: updateOpportunityDto.title.trim(),
        }),
        ...(updateOpportunityDto.description !== undefined && {
          description: updateOpportunityDto.description,
        }),
        ...(updateOpportunityDto.is_remote !== undefined && {
          is_remote: updateOpportunityDto.is_remote,
        }),
        ...(updateOpportunityDto.opportunity_type !== undefined && {
          opportunity_type: updateOpportunityDto.opportunity_type,
        }),
        ...(updateOpportunityDto.experience_level !== undefined && {
          experience_level: updateOpportunityDto.experience_level,
        }),
        ...(updateOpportunityDto.min_experience !== undefined && {
          min_experience: updateOpportunityDto.min_experience,
        }),
        ...(updateOpportunityDto.min_salary !== undefined && {
          min_salary: updateOpportunityDto.min_salary,
        }),
        ...(updateOpportunityDto.max_salary !== undefined && {
          max_salary: updateOpportunityDto.max_salary,
        }),
        ...(updateOpportunityDto.no_of_candidates !== undefined && {
          no_of_candidates: updateOpportunityDto.no_of_candidates,
        }),
        ...(updateOpportunityDto.status !== undefined && {
          status: updateOpportunityDto.status,
        }),
        ...(updateOpportunityDto.rejection_reason !== undefined && {
          rejection_reason:
            updateOpportunityDto.status === 'rejected'
              ? updateOpportunityDto.rejection_reason
              : null, // Reset if not rejected
        }),
        ...(updateOpportunityDto.updated_by !== undefined && {
          updated_by: updateOpportunityDto.updated_by.trim(),
        }),
        ...(updateOpportunityDto.skills !== undefined && { skills }),
        benefit: benefit ?? undefined,
        other_benefit:
          benefit && benefit.name === 'Other'
            ? updateOpportunityDto.other_benefit ?? undefined
            : undefined,
      });

      // Assign validated entities
      opportunity.location = location;
      opportunity.company = company;
      opportunity.category = category;

      // Save the updated opportunity
      const updatedOpportunity = await this.entityManager.save(
        Opportunity,
        opportunity
      );

      // Return success response using APIResponse
      return APIResponse.success(
        res,
        'UPDATE_OPPORTUNITY', // Replace with actual API ID if available
        { data: updatedOpportunity, total: 1 },
        HttpStatus.OK,
        'Opportunity updated successfully'
      );
    } catch (error) {
      console.error('Error updating opportunity:', error);

      // Return error response
      return APIResponse.error(
        res,
        'update',
        'NOT_FOUND',
        'No opportunities found',
        HttpStatus.NOT_FOUND
      );
    }
  }

  // Fetch all opportunities
  async findAll(query: any, res: Response): Promise<any> {
    try {
      const page = query.page ? parseInt(query.page, 10) : 1;
      const limit = query.limit ? parseInt(query.limit, 10) : 10;

      const qb = this.entityManager
        .createQueryBuilder(Opportunity, 'opportunity')
        .leftJoinAndSelect('opportunity.location', 'location')
        .leftJoinAndSelect('opportunity.company', 'company')
        .leftJoinAndSelect('opportunity.category', 'category')
        .where('opportunity.status != :status', { status: 'archived' });

      let skillRecords: Skill[] = [];

      if (query.skill_name) {
        const skillNames = query.skill_name
          .split(',')
          .map((s: string) => s.trim());
        skillRecords = await this.entityManager
          .createQueryBuilder(Skill, 'skill')
          .where('skill.name IN (:...skillNames)', { skillNames })
          .select(['skill.id', 'skill.name'])
          .getMany();

        const skillIdArray = skillRecords.map((s: Skill) => s.id);

        if (skillIdArray.length > 0) {
          qb.andWhere('opportunity.skills::jsonb @> :skillIds::jsonb', {
            skillIds: JSON.stringify(skillIdArray),
          });
        } else {
          return APIResponse.error(
            res,
            query.apiId,
            'NOT_FOUND',
            'No opportunitiessss found',
            HttpStatus.NOT_FOUND
          );
        }
      }
      // 🔹 Location Name, State, and Country Filter
      if (query.location_name || query.state || query.country) {
        const locationQuery = this.entityManager.createQueryBuilder(
          Location,
          'location'
        );

        if (query.city) {
          const locationNames = query.city
            .split(',')
            .map((name: string) => name.trim());
          locationQuery.andWhere('location.city IN (:...locationNames)', {
            locationNames,
          });
        }
        if (query.state) {
          const stateNames = query.state
            .split(',')
            .map((s: string) => s.trim());
          locationQuery.andWhere('location.state IN (:...stateNames)', {
            stateNames,
          });
        }

        if (query.country) {
          const countryNames = query.country
            .split(',')
            .map((c: string) => c.trim());
          locationQuery.andWhere('location.country IN (:...countryNames)', {
            countryNames,
          });
        }

        const locationRecords = await locationQuery
          .select([
            'location.id',
            'location.city',
            'location.state',
            'location.country',
          ])
          .getMany();

        const locationIdArray = locationRecords.map((loc: Location) => loc.id);

        if (locationIdArray.length > 0) {
          qb.andWhere('opportunity.location_id IN (:...locationIds)', {
            locationIds: locationIdArray,
          });
        } else {
          return APIResponse.error(
            res,
            query.apiId,
            'NOT_FOUND',
            'No opportunities found',
            HttpStatus.NOT_FOUND
          );
        }
      }

      if (query.search) {
        qb.andWhere('opportunity.title ILIKE :search', {
          search: `%${query.search}%`,
        });
      }
      if (query.is_remote !== undefined) {
        qb.andWhere('opportunity.is_remote = :is_remote', {
          is_remote: query.is_remote,
        });
      }
      if (query.min_salary) {
        qb.andWhere('opportunity.min_salary >= :min_salary', {
          min_salary: query.min_salary,
        });
      }
      if (query.max_salary) {
        qb.andWhere('opportunity.max_salary <= :max_salary', {
          max_salary: query.max_salary,
        });
      }
      if (query.created_at) {
        qb.andWhere('opportunity.created_at >= :created_at', {
          created_at: query.created_at,
        });
      }

      if (query.order || query.order === 'asc' || query.order === 'desc') {
        qb.orderBy('opportunity.created_at', query.order.toUpperCase());
      } else {
        qb.orderBy('opportunity.created_at', 'ASC');
      }

      const total = await qb.getCount();
      const opportunities = await qb
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      const response: OpportunityResponseDto[] = [];

      for (const opportunity of opportunities) {
        let skillDetails: { id: string; name: string }[] = [];

        if (opportunity.skills && opportunity.skills.length > 0) {
          skillDetails = skillRecords
            .filter((s: Skill) => opportunity.skills?.includes(s.id))
            .map((s: Skill) => ({ id: s.id, name: s.name }));
        }

        response.push(
          Object.assign(new OpportunityResponseDto(), opportunity, {
            skillDetails,
          })
        );
      }

      return APIResponse.success(
        res,
        query.apiId,
        { data: response, total },
        200,
        'Opportunities retrieved successfully'
      );
    } catch (error) {
      return APIResponse.error(
        res,
        query.apiId,
        'Error fetching opportunities',
        error instanceof Error ? error.message : 'Unknown error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  //Fetch Opportunity by ID
  async findOne(id: string, res: Response): Promise<any> {
    try {
      const opportunity = await this.entityManager.findOne(Opportunity, {
        where: { id },
        relations: ['location', 'company', 'category'], // Load related entities
      });

      if (!opportunity) {
        return APIResponse.error(
          res,
          'GET_OPPORTUNITY', // Replace with actual API ID if available
          'OPPORTUNITY_NOT_FOUND',
          `Opportunity with ID ${id} not found`,
          HttpStatus.NOT_FOUND
        );
      }

      // Fetch skill names based on skill IDs using `Skill` entity
      let skillDetails: { id: string; name: string }[] = [];
      if (opportunity.skills && opportunity.skills.length > 0) {
        skillDetails = await this.entityManager
          .createQueryBuilder(Skill, 'skill')
          .where('skill.id IN (:...ids)', { ids: opportunity.skills })
          .select(['skill.id', 'skill.name'])
          .getRawMany();
      }

      return APIResponse.success(
        res,
        'GET_OPPORTUNITY', // Replace with actual API ID if available
        { data: { ...opportunity, skillDetails }, total: 1 },
        HttpStatus.OK,
        'Opportunity successfully retrieved'
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'GET_OPPORTUNITY', // Replace with actual API ID if available
        'GET_OPPORTUNITY_ERROR',
        'Error fetching opportunity',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  //Delete/Archive Opportunity
  async archive(id: string, userId: string, res: Response): Promise<any> {
    try {
      // Validate userId
      if (!userId) {
        return APIResponse.error(
          res,
          'ARCHIVE_OPPORTUNITY',
          'USER_ID_REQUIRED',
          'UserId is required.',
          HttpStatus.BAD_REQUEST
        );
      }

      // Fetch the opportunity
      const opportunity = await this.entityManager.findOne(Opportunity, {
        where: { id },
        relations: ['location', 'company', 'category'],
      });

      if (!opportunity) {
        return APIResponse.error(
          res,
          'ARCHIVE_OPPORTUNITY',
          'OPPORTUNITY_NOT_FOUND',
          `Opportunity with ID ${id} not found.`,
          HttpStatus.NOT_FOUND
        );
      }

      // Update status, updated_at, and updated_by
      opportunity.status = 'archived';
      opportunity.updated_at = new Date();
      opportunity.updated_by = userId;

      await this.entityManager.save(Opportunity, opportunity);

      return APIResponse.success(
        res,
        'ARCHIVE_OPPORTUNITY',
        { message: `Opportunity ${id} archived successfully.` },
        HttpStatus.OK,
        'Opportunity archived successfully'
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'ARCHIVE_OPPORTUNITY',
        'ARCHIVE_OPPORTUNITY_ERROR',
        'Error archiving opportunity',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
