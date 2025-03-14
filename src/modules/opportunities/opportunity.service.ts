import { Injectable, BadRequestException, HttpStatus } from '@nestjs/common';
import { EntityManager, ObjectType, FindOneOptions } from 'typeorm';
import {
  Opportunity,
  OpportunityPricingType,
} from './entities/opportunity.entity';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { Location } from '../locations/entities/location.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Category } from '../categories/entities/category.entity';
import { Benefit } from 'modules/benefits/entities/benefits.entity';
import { OpportunityResponseDto } from './dto/opportunity-response.dto';
import { Skill } from '../skills/entities/skill.entity';
import APIResponse from 'modules/common/responses/response';
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
        return APIResponse.error(
          res,
          'CREATE_OPPORTUNITY', // API ID (replace if needed)
          'CREATE_OPPORTUNITY_ERROR',
          'Title is required and cannot be empty.',
          HttpStatus.BAD_REQUEST
        );
      }

      if (!createOpportunityDto.created_by) {
        return APIResponse.error(
          res,
          'CREATE_OPPORTUNITY', // API ID (replace if needed)
          'CREATE_OPPORTUNITY_ERROR',
          'Created_by is required.',
          HttpStatus.BAD_REQUEST
        );
      }

      if (!createOpportunityDto.updated_by) {
        return APIResponse.error(
          res,
          'CREATE_OPPORTUNITY', // API ID (replace if needed)
          'CREATE_OPPORTUNITY_ERROR',
          'Updated_by is required.',
          HttpStatus.BAD_REQUEST
        );
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
        return APIResponse.error(
          res,
          'CREATE_OPPORTUNITY', // API ID (replace if needed)
          'CREATE_OPPORTUNITY_ERROR',
          `Location with ID ${createOpportunityDto.location} not found.`,
          HttpStatus.BAD_REQUEST
        );
      }
      if (!company) {
        return APIResponse.error(
          res,
          'CREATE_OPPORTUNITY', // API ID (replace if needed)
          'CREATE_OPPORTUNITY_ERROR',
          `Company with ID ${createOpportunityDto.company} not found.`,
          HttpStatus.BAD_REQUEST
        );
      }
      if (!category) {
        return APIResponse.error(
          res,
          'CREATE_OPPORTUNITY', // API ID (replace if needed)
          'CREATE_OPPORTUNITY_ERROR',
          `Category with ID ${createOpportunityDto.category} not found.`,
          HttpStatus.BAD_REQUEST
        );
      }

      if (
        createOpportunityDto.benefit &&
        !benefit &&
        createOpportunityDto.other_benefit
      ) {
        return APIResponse.error(
          res,
          'CREATE_OPPORTUNITY', // API ID (replace if needed)
          'CREATE_OPPORTUNITY_ERROR',
          'Other Benefit can only be provided if Other is selected as a benefit.',
          HttpStatus.BAD_REQUEST
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
      opportunity.work_nature = createOpportunityDto.work_nature ?? false;
      opportunity.opportunity_type =
        createOpportunityDto.opportunity_type ?? 'job';
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

      opportunity.offer_letter_provided =
        createOpportunityDto.offer_letter_provided ?? false; // Default false
      opportunity.pricing_type =
        createOpportunityDto.pricing_type ?? OpportunityPricingType.FREE; // Default free

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
    res: Response,
    id: string,
    updateOpportunityDto: UpdateOpportunityDto
  ): Promise<any> {
    try {
      const opportunity = await this.entityManager.findOne(Opportunity, {
        where: { id },
      });

      if (!opportunity) {
        return APIResponse.error(
          res,
          'UPDATE_OPPORTUNITY',
          'UPDATE_OPPORTUNITY_ERROR',
          `Opportunity with ID ${id} not found`,
          HttpStatus.BAD_REQUEST
        );
      }

      // :white_check_mark: Only update the fields explicitly present in updateOpportunityDto
      const updateData: Partial<Opportunity> = {};

      if (updateOpportunityDto.title !== undefined) {
        updateData.title = updateOpportunityDto.title.trim();
      }
      if (updateOpportunityDto.description !== undefined) {
        updateData.description = updateOpportunityDto.description;
      }
      if (updateOpportunityDto.work_nature !== undefined) {
        updateData.work_nature = updateOpportunityDto.work_nature;
      }
      if (updateOpportunityDto.opportunity_type !== undefined) {
        updateData.opportunity_type = updateOpportunityDto.opportunity_type;
      }
      if (updateOpportunityDto.experience_level !== undefined) {
        updateData.experience_level = updateOpportunityDto.experience_level;
      }
      if (updateOpportunityDto.min_experience !== undefined) {
        updateData.min_experience = updateOpportunityDto.min_experience;
      }
      if (updateOpportunityDto.min_salary !== undefined) {
        updateData.min_salary = updateOpportunityDto.min_salary;
      }
      if (updateOpportunityDto.max_salary !== undefined) {
        updateData.max_salary = updateOpportunityDto.max_salary;
      }
      if (updateOpportunityDto.no_of_candidates !== undefined) {
        updateData.no_of_candidates = updateOpportunityDto.no_of_candidates;
      }
      if (updateOpportunityDto.status !== undefined) {
        updateData.status = updateOpportunityDto.status;
      }
      if (
        updateOpportunityDto.status === 'rejected' &&
        (!updateOpportunityDto.rejection_reason ||
          updateOpportunityDto.rejection_reason.trim() === '')
      ) {
        return APIResponse.error(
          res,
          'UPDATE_OPPORTUNITY',
          'UPDATE_OPPORTUNITY_ERROR',
          'Rejection reason is required when setting status to rejected.',
          HttpStatus.BAD_REQUEST
        );
      }
      // white_check_mark: Only update rejection reason if status is rejected
      if (updateOpportunityDto.rejection_reason !== undefined) {
        updateData.rejection_reason =
          updateOpportunityDto.status === 'rejected'
            ? updateOpportunityDto.rejection_reason
            : null; // Reset if not rejected
      }
      if (updateOpportunityDto.updated_by !== undefined) {
        updateData.updated_by = updateOpportunityDto.updated_by.trim();
      }

      if (updateOpportunityDto.skills !== undefined) {
        updateData.skills = Array.isArray(updateOpportunityDto.skills)
          ? updateOpportunityDto.skills
          : opportunity.skills ?? [];
      }
      if (updateOpportunityDto.offer_letter_provided !== undefined) {
        updateData.offer_letter_provided =
          updateOpportunityDto.offer_letter_provided;
      }
      if (updateOpportunityDto.pricing_type !== undefined) {
        updateData.pricing_type = updateOpportunityDto.pricing_type;
      }

      // :white_check_mark: Only update relationships if explicitly provided in request
      if (updateOpportunityDto.location !== undefined) {
        const location = await this.entityManager.findOne(Location, {
          where: { id: updateOpportunityDto.location },
        });
        if (!location) {
          return APIResponse.error(
            res,
            'UPDATE_OPPORTUNITY',
            'UPDATE_OPPORTUNITY_ERROR',
            `Location with ID ${updateOpportunityDto.location} not found.`,
            HttpStatus.BAD_REQUEST
          );
        }
        updateData.location = location;
      }
      if (updateOpportunityDto.company !== undefined) {
        const company = await this.entityManager.findOne(Organization, {
          where: { id: updateOpportunityDto.company },
        });
        if (!company) {
          return APIResponse.error(
            res,
            'UPDATE_OPPORTUNITY',
            'UPDATE_OPPORTUNITY_ERROR',
            `Company with ID ${updateOpportunityDto.company} not found.`,
            HttpStatus.BAD_REQUEST
          );
        }
        updateData.company = company;
      }
      if (updateOpportunityDto.category !== undefined) {
        const category = await this.entityManager.findOne(Category, {
          where: { id: updateOpportunityDto.category },
        });
        if (!category) {
          return APIResponse.error(
            res,
            'UPDATE_OPPORTUNITY',
            'UPDATE_OPPORTUNITY_ERROR',
            `Category with ID ${updateOpportunityDto.category} not found.`,
            HttpStatus.BAD_REQUEST
          );
        }
        updateData.category = category;
      }
      if (updateOpportunityDto.benefit !== undefined) {
        const benefit = await this.entityManager.findOne(Benefit, {
          where: { id: updateOpportunityDto.benefit },
        });
        if (!benefit) {
          return APIResponse.error(
            res,
            'UPDATE_OPPORTUNITY',
            'UPDATE_OPPORTUNITY_ERROR',
            `Benefit with ID ${updateOpportunityDto.benefit} not found.`,
            HttpStatus.BAD_REQUEST
          );
        }
        updateData.benefit = benefit;
        updateData.other_benefit =
          benefit.name === 'Other'
            ? updateOpportunityDto.other_benefit ?? undefined
            : undefined;
      }

      // :white_check_mark: Apply updates only to the provided fields
      await this.entityManager.update(Opportunity, id, updateData);

      return APIResponse.success(
        res,
        'UPDATE_OPPORTUNITY',
        { data: { id, ...updateData }, total: 1 },
        HttpStatus.OK,
        'Opportunity updated successfully'
      );
    } catch (error) {
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

      // Skills Filter
      let skillRecords: Skill[] = [];

      if (query.skills) {
        const skillIds = query.skills.split(',').map((s: string) => s.trim());

        skillRecords = await this.entityManager
          .createQueryBuilder(Skill, 'skill')
          .where('skill.id IN (:...skillIds)', { skillIds })
          .select(['skill.id', 'skill.name'])
          .getMany();

        if (skillRecords.length > 0) {
          qb.andWhere(
            `EXISTS (
              SELECT 1 FROM jsonb_array_elements_text(opportunity.skills) skill_id
              WHERE skill_id IN (:...skillIds)
            )`,
            { skillIds }
          );
        } else {
          return APIResponse.success(
            res,
            query.apiId,
            'NOT_FOUND',
            HttpStatus.NOT_FOUND,
            'No opportunities found for given skills'
          );
        }
      }

      // Location Name, State, and Country Filter
      if (query.city || query.state || query.country) {
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
            HttpStatus.OK
          );
        }
      }

      // Category Filter
      if (query.category) {
        const categories = query.category
          .split(',')
          .map((name: string) => name.trim());

        const categoryRecords = await this.entityManager
          .createQueryBuilder(Category, 'category')
          .where('category.id IN (:...categories)', { categories })
          .select(['category.id', 'category.name'])
          .getMany();

        const categoryIdArray = categoryRecords.map((cat: Category) => cat.id);

        if (categoryIdArray.length > 0) {
          qb.andWhere('opportunity.category_id IN (:...categoryIds)', {
            categoryIds: categoryIdArray,
          });
        } else {
          return APIResponse.error(
            res,
            query.apiId,
            'NOT_FOUND',
            'No opportunities found',
            HttpStatus.OK
          );
        }
      }

      if (query.search) {
        qb.andWhere('opportunity.title ILIKE :search', {
          search: `%${query.search}%`,
        });
      }
      if (query.work_nature !== undefined) {
        qb.andWhere('opportunity.work_nature = :work_nature', {
          work_nature: query.work_nature,
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

      // Add created_by filter
      if (query.created_by) {
        qb.andWhere('opportunity.created_by = :created_by', {
          created_by: query.created_by,
        });
      }

      // Add opportunity role (type) filter
      if (query.opportunity_type) {
        qb.andWhere('opportunity.opportunity_type = :opportunity_type', {
          opportunity_type: query.opportunity_type,
        });
      }

      // Add status filter
      if (query.status) {
        const statuses = query.status.split(',').map((s: string) => s.trim());
        qb.andWhere('opportunity.status IN (:...statuses)', { statuses });
      }

      // Filter by `offer_letter_provided`
      if (query.offer_letter_provided !== undefined) {
        qb.andWhere(
          'opportunity.offer_letter_provided = :offer_letter_provided',
          {
            offer_letter_provided: query.offer_letter_provided === 'true',
          }
        );
      }

      // Filter by `pricing_type`
      if (query.pricing_type) {
        const pricingTypes = query.pricing_type
          .split(',')
          .map((p: string) => p.trim());
        qb.andWhere('opportunity.pricing_type IN (:...pricingTypes)', {
          pricingTypes,
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

      const opportunityIds = opportunities.map((opp) => opp.id);

      if (!opportunityIds || opportunityIds.length === 0) {
        return APIResponse.success(
          res,
          query.apiId,
          { data: response, total },
          HttpStatus.OK,
          'No Opportunities found'
        ); // Return an empty array if there are no opportunity IDs
      }
      // Add opportunity application stats (mapped, shortlisted, accepted, rejected, withdrawn, hired)
      const allStats = await this.entityManager
        .createQueryBuilder('opportunity_applications', 'app')
        .select([
          'app.opportunity_id AS opportunity_id',
          'COUNT(*) AS mapped',
          `COUNT(*) FILTER (WHERE status.status = 'shortlisted') AS shortlisted`,
          `COUNT(*) FILTER (WHERE status.status = 'accepted') AS accepted`,
          `COUNT(*) FILTER (WHERE status.status = 'rejected') AS rejected`,
          `COUNT(*) FILTER (WHERE status.status = 'withdrawn') AS withdrawn`,
          `COUNT(*) FILTER (WHERE status.status = 'hired') AS hired`,
        ])
        .leftJoin('application_statuses', 'status', 'app.status_id = status.id')
        .where('app.opportunity_id IN (:...opportunityIds)', {
          opportunityIds,
        })
        .groupBy('app.opportunity_id')
        .getRawMany();

      // Create a map for easy lookup
      const statsMap = new Map(
        allStats.map((stat) => [stat.opportunity_id, stat])
      );
      for (const opportunity of opportunities) {
        // Map opportunity application stats (mapped, shortlisted, accepted, rejected, withdrawn, hired)
        const stats = statsMap.get(opportunity.id) || {
          mapped: 0,
          shortlisted: 0,
          accepted: 0,
          rejected: 0,
          withdrawn: 0,
          hired: 0,
        };
        let skillDetails: { id: string; name: string }[] = [];

        if (opportunity.skills && opportunity.skills.length > 0) {
          skillDetails = skillRecords
            .filter((s: Skill) => opportunity.skills?.includes(s.id))
            .map((s: Skill) => ({ id: s.id, name: s.name }));
        }

        response.push(
          Object.assign(new OpportunityResponseDto(), opportunity, {
            skillDetails,
            stats: {
              mapped: Number(stats?.mapped) || 0,
              shortlisted: Number(stats?.shortlisted) || 0,
              accepted: Number(stats?.accepted) || 0,
              rejected: Number(stats?.rejected) || 0,
              withdrawn: Number(stats?.withdrawn) || 0,
              hired: Number(stats?.hired) || 0,
            },
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
