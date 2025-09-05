import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import { OpportunityApplication } from './entities/opportunity-application.entity';
import { CreateOpportunityApplicationDto } from './dto/create-opportunity-application.dto';
import { UpdateOpportunityApplicationDto } from './dto/update-opportunity-application.dto';
import { Opportunity } from '../opportunities/entities/opportunity.entity';
import { ApplicationStatus } from '../application_statuses/entities/application_status.entity';
import { Skill } from '../skills/entities/skill.entity';
import { Benefit } from '../benefits/entities/benefits.entity';
import { Response } from 'express';
import APIResponse from 'modules/common/responses/response';
import { UserServiceClient } from './user-service.client';

@Injectable()
export class OpportunityApplicationService {
  private readonly logger = new Logger(OpportunityApplicationService.name);

  constructor(
    private readonly entityManager: EntityManager,
    private readonly userServiceClient: UserServiceClient
  ) {}

  async create(
    createDto: CreateOpportunityApplicationDto,
    res: Response
  ): Promise<any> {
    try {
      // Check if user is already mapped to this opportunity
      const existingApplication = await this.entityManager.findOne(
        OpportunityApplication,
        {
          where: {
            user_id: createDto.user_id,
            opportunity_id: createDto.opportunity_id,
          },
        }
      );

      if (existingApplication) {
        return APIResponse.error(
          res,
          'CREATE_OPPORTUNITY_APPLICATION',
          'USER_ALREADY_MAPPED',
          'User is already mapped to this Opportunity',
          HttpStatus.BAD_REQUEST
        );
      }

      // Validate Opportunity
      const opportunity = await this.entityManager.findOne(Opportunity, {
        where: { id: createDto.opportunity_id },
      });
      if (!opportunity) {
        return APIResponse.error(
          res,
          'CREATE_OPPORTUNITY_APPLICATION',
          'INVALID_OPPORTUNITY_ID',
          'Invalid opportunity_id',
          HttpStatus.BAD_REQUEST
        );
      }

      // Validate Status
      const status = await this.entityManager.findOne(ApplicationStatus, {
        where: { id: createDto.status_id },
      });
      if (!status) {
        return APIResponse.error(
          res,
          'CREATE_OPPORTUNITY_APPLICATION',
          'INVALID_STATUS_ID',
          'Invalid status_id',
          HttpStatus.BAD_REQUEST
        );
      }

      // Convert applied_skills to JSON
      if (!Array.isArray(createDto.applied_skills)) {
        return APIResponse.error(
          res,
          'CREATE_OPPORTUNITY_APPLICATION',
          'INVALID_APPLIED_SKILLS',
          'applied_skills must be an array',
          HttpStatus.BAD_REQUEST
        );
      }

      // Ensure `created_by` and `updated_by` are properly set
      if (!createDto.created_by || !createDto.updated_by) {
        return APIResponse.error(
          res,
          'CREATE_OPPORTUNITY_APPLICATION',
          'MISSING_CREATED_BY_UPDATED_BY',
          'Both created_by and updated_by are required.',
          HttpStatus.BAD_REQUEST
        );
      }

      // Create OpportunityApplication
      const opportunityApplication = new OpportunityApplication();
      opportunityApplication.opportunity_id = createDto.opportunity_id;
      opportunityApplication.status_id = createDto.status_id;
      opportunityApplication.user_id = createDto.user_id;
      opportunityApplication.match_score = createDto.match_score;
      opportunityApplication.feedback = createDto.feedback;
      opportunityApplication.youth_feedback = createDto.youth_feedback;
      opportunityApplication.applied_skills = createDto.applied_skills;
      opportunityApplication.created_by = createDto.created_by;
      opportunityApplication.updated_by = createDto.updated_by;

      const savedApplication = await this.entityManager.save(
        OpportunityApplication,
        opportunityApplication
      );

      return APIResponse.success(
        res,
        'CREATE_OPPORTUNITY_APPLICATION',
        { data: savedApplication, total: 1 },
        HttpStatus.OK,
        'Opportunity application created successfully'
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'CREATE_OPPORTUNITY_APPLICATION',
        'CREATE_OPPORTUNITY_APPLICATION_ERROR',
        'Error creating opportunity application',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Get the application details
  async findOne(id: string, res: Response): Promise<any> {
    try {
      const opportunityApplication = await this.entityManager.findOne(
        OpportunityApplication,
        { where: { id } }
      );

      if (!opportunityApplication) {
        return APIResponse.error(
          res,
          'FIND_OPPORTUNITY_APPLICATION',
          'NOT_FOUND',
          `OpportunityApplication with ID ${id} not found`,
          HttpStatus.NOT_FOUND
        );
      }

      // Fetch Opportunity Details (ID + Title)
      const opportunity = await this.entityManager.findOne(Opportunity, {
        where: { id: opportunityApplication.opportunity_id },
        select: ['id', 'title'],
      });

      // Fetch Status Details (ID + Name)
      const status = await this.entityManager.findOne(ApplicationStatus, {
        where: { id: opportunityApplication.status_id },
        select: ['id', 'status'],
      });

      // Fetch Skill Details (Only IDs in `applied_skills`)
      let appliedSkillDetails: { id: string; name: string }[] = [];
      if (
        opportunityApplication.applied_skills &&
        opportunityApplication.applied_skills.length > 0
      ) {
        const skills = await this.entityManager
          .createQueryBuilder('skills', 'skill') // Use entity name as string
          .where('skill.id IN (:...ids)', {
            ids: opportunityApplication.applied_skills,
          })
          .getMany();

        appliedSkillDetails = skills.map((s) => ({ id: s.id, name: s.name })); // Map skill details
      }

      return APIResponse.success(
        res,
        'FIND_OPPORTUNITY_APPLICATION',
        {
          id: opportunityApplication.id,
          opportunity: opportunity || undefined,
          status: status || undefined,
          user_id: opportunityApplication.user_id,
          match_score: opportunityApplication.match_score,
          feedback: opportunityApplication.feedback,
          youth_feedback: opportunityApplication.youth_feedback,
          created_by: opportunityApplication.created_by,
          updated_by: opportunityApplication.updated_by,
          applied_skills: opportunityApplication.applied_skills, // Returns skill IDs
          applied_skills_details: appliedSkillDetails, // Returns skill details separately
        },
        HttpStatus.OK,
        'Opportunity application retrieved successfully'
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'FIND_OPPORTUNITY_APPLICATION',
        'ERROR_FETCHING_APPLICATION',
        'Error fetching opportunity application',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Fetch the application list
  async findAll(query: any, res: Response): Promise<any> {
    try {
      const { offset, limit } = this.getPaginationParams(query);
      const archivedStatus = await this.getArchivedStatus(res);
      if (!archivedStatus) return;

      const qb = this.buildBaseApplicationQuery(archivedStatus.id);
      this.applyFilters(qb, query);

      if (query.orderBy) {
        const orderColumnMap = {
          created_at: 'application.created_at',
          updated_at: 'application.updated_at',
          opportunity_title: 'opportunity.title',
          status_name: 'status.status',
        };

        const orderColumn =
          orderColumnMap[query.orderBy as keyof typeof orderColumnMap] ||
          'application.created_at';
        qb.orderBy(orderColumn, query.order || 'DESC');
      } else {
        qb.orderBy('application.created_at', 'DESC');
      }

      const total = await qb.getCount();
      qb.offset(offset).limit(limit);
      const applications = await qb.getRawMany();

      // Fetch applied skill names for each application
      for (const app of applications) {
        let appliedSkillDetails: { id: string; name: string }[] = [];

        if (app.application_applied_skills) {
          const skillIds = Array.isArray(app.application_applied_skills)
            ? app.application_applied_skills
            : JSON.parse(app.application_applied_skills);

          if (skillIds.length > 0) {
            const skills = await this.entityManager.findBy(Skill, {
              id: In(skillIds),
            });

            appliedSkillDetails = skills.map((s) => ({
              id: s.id,
              name: s.name,
            }));
          }
        }

        (app as any)['applied_skills_details'] = appliedSkillDetails;
      }

      return APIResponse.success(
        res,
        'FIND_ALL_OPPORTUNITY_APPLICATIONS',
        { data: applications, total },
        HttpStatus.OK,
        'Opportunity applications retrieved successfully'
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'FIND_ALL_OPPORTUNITY_APPLICATIONS',
        'ERROR_FETCHING_APPLICATIONS',
        'Error fetching opportunity applications',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(
    id: string,
    updateDto: UpdateOpportunityApplicationDto,
    res: Response // Add Response object as a parameter
  ): Promise<any> {
    try {
      const opportunityApplication = await this.entityManager.findOne(
        OpportunityApplication,
        { where: { id } }
      );

      if (!opportunityApplication) {
        return APIResponse.error(
          res, // Pass response object
          'ERROR_NOT_FOUND',
          'No opportunity application found with the given ID',
          `OpportunityApplication with ID ${id} not found`,
          HttpStatus.NOT_FOUND
        );
      }

      // Ensure valid `opportunity_id` exists
      if (updateDto.opportunity_id) {
        const opportunity = await this.entityManager.findOne(Opportunity, {
          where: { id: updateDto.opportunity_id },
        });

        if (!opportunity) {
          return APIResponse.error(
            res, // Pass response object
            'ERROR_INVALID_OPPORTUNITY_ID',
            'The provided opportunity ID does not exist',
            'Invalid Opportunity_id',
            HttpStatus.BAD_REQUEST
          );
        }
        opportunityApplication.opportunity_id = updateDto.opportunity_id;
      }

      // Ensure valid `status_id` exists
      if (updateDto.status_id) {
        const status = await this.entityManager.findOne(ApplicationStatus, {
          where: { id: updateDto.status_id },
        });

        if (!status) {
          return APIResponse.error(
            res, // Pass response object
            'ERROR_INVALID_STATUS_ID',
            'The provided status ID does not exist',
            'Invalid status_id',
            HttpStatus.BAD_REQUEST
          );
        }
        opportunityApplication.status_id = updateDto.status_id;
      }

      // Preserve existing values if not provided in update request
      opportunityApplication.user_id =
        updateDto.user_id ?? opportunityApplication.user_id;
      opportunityApplication.match_score =
        updateDto.match_score ?? opportunityApplication.match_score;
      opportunityApplication.feedback =
        updateDto.feedback ?? opportunityApplication.feedback;
      opportunityApplication.youth_feedback =
        updateDto.youth_feedback ?? opportunityApplication.youth_feedback;

      // Handle `applied_skills` JSONB field correctly
      if (updateDto.applied_skills) {
        if (!Array.isArray(updateDto.applied_skills)) {
          return APIResponse.error(
            res, // Pass response object
            'ERROR_INVALID_SKILLS',
            'Applied skills should be in array format',
            'Applied_skills must be an array',
            HttpStatus.BAD_REQUEST
          );
        }
        opportunityApplication.applied_skills = updateDto.applied_skills;
      }

      // Preserve `created_by` if not updated
      opportunityApplication.created_by =
        updateDto.created_by ?? opportunityApplication.created_by;

      // Ensure `updated_by` is provided in update requests
      if (!updateDto.updated_by) {
        return APIResponse.error(
          res, // Pass response object
          'ERROR_MISSING_UPDATED_BY',
          'Updated_by field is mandatory for updating the application',
          'Updated_by is required',
          HttpStatus.BAD_REQUEST
        );
      }
      opportunityApplication.updated_by = updateDto.updated_by;

      const updatedApplication = await this.entityManager.save(
        OpportunityApplication,
        opportunityApplication
      );

      return APIResponse.success(
        res, // Pass response object
        'Opportunity Application updated successfully',
        updatedApplication,
        HttpStatus.OK,
        'Opportunity application update successful'
      );
    } catch (error) {
      return APIResponse.error(
        res, // Pass response object
        'ERROR_UPDATE_FAILED',
        'An error occurred while updating the opportunity application',
        'Failed to update OpportunityApplication',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Instead of deleting, mark the application as "archived"
   */

  async archive(res: any, id: string, userId: string): Promise<any> {
    try {
      // Validate the provided userId
      if (!userId) {
        return APIResponse.error(
          res,
          'UserId is required.',
          'ERROR_MISSING_USER_ID',
          'User ID is required to archive the application',
          HttpStatus.BAD_REQUEST
        );
      }

      // Fetch archived status UUID from `application_statuses` table
      const archivedStatus = await this.entityManager.findOne(
        ApplicationStatus,
        {
          where: { status: 'archived' },
        }
      );

      if (!archivedStatus) {
        return APIResponse.error(
          res,
          'Archived status not found',
          'ERROR_ARCHIVED_STATUS_NOT_FOUND',
          'Archived status does not exist in the application_statuses table',
          HttpStatus.NOT_FOUND
        );
      }

      // Check if the opportunity application exists
      const opportunityApplication = await this.entityManager.findOne(
        OpportunityApplication,
        { where: { id } }
      );

      if (!opportunityApplication) {
        return APIResponse.error(
          res,
          `Opportunity application with ID ${id} not found`,
          'ERROR_APPLICATION_NOT_FOUND',
          'No opportunity application found with the given ID',
          HttpStatus.NOT_FOUND
        );
      }

      // Update the status, updated_at, and updated_by fields
      opportunityApplication.status_id = archivedStatus.id;
      opportunityApplication.updated_at = new Date();
      opportunityApplication.updated_by = userId;

      await this.entityManager.save(
        OpportunityApplication,
        opportunityApplication
      );

      return APIResponse.success(
        res,
        'Opportunity application archived successfully',
        { id, status: 'archived' },
        HttpStatus.OK,
        `Opportunity application ${id} archived successfully.`
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Failed to archive opportunity application',
        'ERROR_ARCHIVE_FAILED',
        'An error occurred while archiving the opportunity application',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getMappedApplication(query: any, res: Response): Promise<any> {
    try {
      const { offset, limit } = this.getPaginationParams(query);
      const archivedStatus = await this.getArchivedStatus(res);
      if (!archivedStatus) return;

      const qb = this.buildBaseApplicationQuery(archivedStatus.id);
      this.applyFilters(qb, query);

      if (query.orderBy) {
        const orderColumnMap = {
          created_at: 'application.created_at',
          updated_at: 'application.updated_at',
          opportunity_title: 'opportunity.title',
          status_name: 'status.status',
        };

        const orderColumn =
          orderColumnMap[query.orderBy as keyof typeof orderColumnMap] ||
          'application.created_at';
        qb.orderBy(orderColumn, query.order || 'DESC');
      } else {
        qb.orderBy('application.created_at', 'DESC');
      }

      // const total = await qb.clone().getCount();

      qb.offset(offset).limit(limit);
      const applications = await qb.getRawMany();

      // Group applications by opportunity_id
      const groupedApplications = new Map();

      for (const app of applications) {
        let appliedSkillDetails: { id: string; name: string }[] = [];

        if (app.application_applied_skills) {
          const skillIds = Array.isArray(app.application_applied_skills)
            ? app.application_applied_skills
            : JSON.parse(app.application_applied_skills);

          if (skillIds.length > 0) {
            const skills = await this.entityManager.findBy(Skill, {
              id: In(skillIds),
            });

            appliedSkillDetails = skills.map((s) => ({
              id: s.id,
              name: s.name,
            }));
          }
        }

        (app as any)['applied_skills_details'] = appliedSkillDetails;

        if (!groupedApplications.has(app.opportunity_id)) {
          groupedApplications.set(app.opportunity_id, {
            opportunity_id: app.opportunity_id,
            opportunity_title: app.opportunity_title,
            opportunity_description: app.opportunity_description,
            opportunity_work_nature: app.opportunity_work_nature,
            opportunity_opportunity_type: app.opportunity_opportunity_type,
            opportunity_experience_level: app.opportunity_experience_level,
            opportunity_min_experience: app.opportunity_min_experience,
            opportunity_min_salary: app.opportunity_min_salary,
            opportunity_max_salary: app.opportunity_max_salary,
            opportunity_status: app.opportunity_status,
            opportunity_created_by: app.opportunity_created_by,
            opportunity_updated_by: app.opportunity_updated_by,
            location: {
              location_id: app.location_id,
              city: app.location_city,
              state: app.location_state,
              country: app.location_country,
            },
            category: {
              category_id: app.category_id,
              name: app.category_name,
            },
            company: {
              company_id: app.company_id,
              name: app.company_name,
            },
            applications: [],
          });
        }

        groupedApplications.get(app.opportunity_id).applications.push({
          application_id: app.application_id,
          application_status_id: {
            status_id: app.status_id,
            status_name: app.status_name,
          },
          application_user_id: app.application_user_id,
          application_match_score: app.application_match_score,
          application_feedback: app.application_feedback,
          application_youth_feedback: app.application_youth_feedback,
          application_applied_skills: appliedSkillDetails,
          application_created_at: app.application_created_at,
          application_updated_at: app.application_updated_at,
          application_created_by: app.application_created_by,
          application_updated_by: app.application_updated_by,
        });
      }

      // Get total unique opportunities count
      const total = groupedApplications.size;

      return APIResponse.success(
        res,
        'FIND_ALL_OPPORTUNITY_APPLICATIONS',
        { data: Array.from(groupedApplications.values()), total },
        HttpStatus.OK,
        'Opportunity applications retrieved successfully'
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'FIND_ALL_OPPORTUNITY_APPLICATIONS',
        'ERROR_FETCHING_APPLICATIONS',
        'Error fetching opportunity applications',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getApplicationReport(res: Response, headers: any, limit?: number, offset?: number): Promise<any> {
    try {
      // Get total count first
      const totalCount = await this.entityManager.count(OpportunityApplication);
      
      // Get opportunity applications with pagination
      const queryBuilder = this.entityManager
        .createQueryBuilder(OpportunityApplication, 'application')
        .leftJoinAndSelect('application.opportunity', 'opportunity')
        .leftJoinAndSelect('opportunity.location', 'location')
        .leftJoinAndSelect('opportunity.company', 'company')
        .leftJoinAndSelect('opportunity.category', 'category')
        .leftJoinAndSelect('application.status', 'status');

      // Apply pagination if provided
      if (limit !== undefined && limit > 0) {
        queryBuilder.limit(limit);
      }
      if (offset !== undefined && offset >= 0) {
        queryBuilder.offset(offset);
      }

      const applications = await queryBuilder.getMany();

      if (!applications || applications.length === 0) {
        return APIResponse.success(
          res,
          'GET_APPLICATION_REPORT',
          { 
            data: [], 
            total: totalCount,
            limit: limit || null,
            offset: offset || 0,
            hasMore: false
          },
          HttpStatus.OK,
          'No applications found'
        );
      }

      // Fetch youth users list to get user details
      const authHeaders = headers?.authorization ? { authorization: headers.authorization } : {};
      const youthUsers = await this.userServiceClient.getYouthUsers(authHeaders).catch(err => {
        this.logger.warn(`getYouthUsers failed: ${err?.message ?? err}`);
        return [];
      });
      
      // Fetch all skills for mapping
      const allSkills = await this.entityManager.find(Skill, { select: ['id', 'name'] });
      
      // Fetch all benefits for mapping
      const allBenefits = await this.entityManager.find(Benefit, { select: ['id', 'name'] });
      
      // Build report data for all applications
      const youthIndex = new Map(youthUsers.map(u => [u.userId, u]));
      const reportData = applications.map(application => {
        const userData = application.user_id ? youthIndex.get(application.user_id) : undefined;
        return this.buildReportData(application, userData, allSkills, allBenefits);
      });

      // Calculate pagination metadata
      const currentOffset = offset || 0;
      const currentLimit = limit || totalCount;
      const hasMore = currentOffset + reportData.length < totalCount;

      return APIResponse.success(
        res,
        'GET_APPLICATION_REPORT',
        { 
          data: reportData, 
          total: totalCount,
          limit: currentLimit,
          offset: currentOffset,
          hasMore: hasMore
        },
        HttpStatus.OK,
        `All opportunity application report data retrieved successfully for ${reportData.length} applications (${currentOffset + 1}-${currentOffset + reportData.length} of ${totalCount})`
      );
    } catch (error) {
      this.logger.error('Error in getApplicationReport:', error);
      return APIResponse.error(
        res,
        'GET_APPLICATION_REPORT',
        'INTERNAL_SERVER_ERROR',
        'An error occurred while fetching the report',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }



  private buildReportData(application: any, userData: any, allSkills: any[], allBenefits: any[]): any {
    
    const opportunity = application.opportunity;
    const location = opportunity?.location;
    const company = opportunity?.company;
    const category = opportunity?.category;

    // Helper function to get custom field value
    const getCustomFieldValue = (label: string): string => {
      if (!userData?.customFields) return 'Not specified';
      const field = userData.customFields.find((f: any) => f.label.toLowerCase().includes(label.toLowerCase()));
      return field ? field.value : 'Not specified';
    };

    // Helper function to map skill IDs to skill names
    const mapSkillIdsToNames = (skillIds: string): string[] => {
      if (!skillIds || !allSkills || allSkills.length === 0) return [];
      
      try {
        // Split comma-separated skill IDs
        const ids = skillIds.split(',').map(id => id.trim());
        
        // Map each ID to skill name
        const skillNames = ids.map(id => {
          const skill = allSkills.find(s => s.id === id);
          return skill ? skill.name : id; // Return ID if skill not found
        });
        
        return skillNames;
      } catch (error) {
        return [];
      }
    };

    // Helper function to map benefit IDs to benefit names
    const mapBenefitIdsToNames = (benefitIds: string[]): string[] => {
      if (!benefitIds || !Array.isArray(benefitIds) || !allBenefits || allBenefits.length === 0) return [];
      
      try {
        // Map each ID to benefit name
        const benefitNames = benefitIds.map(id => {
          const benefit = allBenefits.find(b => b.id === id);
          return benefit ? benefit.name : id; // Return ID if benefit not found
        });
        
        return benefitNames;
      } catch (error) {
        return [];
      }
    };

    // Calculate age from date of birth or custom field
    let age = null;
    if (userData?.dob) {
      try {
        age = this.calculateAge(new Date(userData.dob));
      } catch (error) {
        age = null;
      }
    }
    
    // If age calculation failed, try to get from custom field AGE
    if (age === null || isNaN(age)) {
      const customAge = getCustomFieldValue('AGE');
      if (customAge !== 'Not specified') {
        try {
          age = parseInt(customAge, 10);
        } catch (error) {
          age = null;
        }
      }
    }
    
    // If still no age, try to get from custom field with different labels
    if (age === null || isNaN(age)) {
      const ageLabels = ['age', 'AGE', 'Age'];
      for (const label of ageLabels) {
        const customAge = getCustomFieldValue(label);
        if (customAge !== 'Not specified') {
          try {
            age = parseInt(customAge, 10);
            break;
          } catch (error) {
            // Continue to next label
          }
        }
      }
    }
    
    // Ensure age is a valid number or null
    if (age !== null && typeof age === 'number' && (age < 0 || age > 120)) {
      age = null;
    }
    
    return {
      // User details mapped from user service
      firstName: userData?.firstName || 'Unknown',
      middleName: userData?.middleName || '',
      lastName: userData?.lastName || 'User',
      emailId: userData?.email || 'No email available',
      phoneNumber: userData?.mobile || 'No phone available',
      age: age,
      gender: getCustomFieldValue('GENDER') !== 'Not specified' ? getCustomFieldValue('GENDER') : 
              userData?.gender || 'Not specified',
      
      // Location information from custom fields or opportunity
      country: getCustomFieldValue('COUNTRY') !== 'Not specified' ? getCustomFieldValue('COUNTRY') : 
               location?.country || 'Not specified',
      county: getCustomFieldValue('STATES') !== 'Not specified' ? getCustomFieldValue('STATES') : 
              location?.state || 'Not specified',
      subCounty: getCustomFieldValue('CITY') !== 'Not specified' ? getCustomFieldValue('CITY') : 
                 location?.city || 'Not specified',
      
      // Education & Training from custom fields
      highestEducationQualification: getCustomFieldValue('highest education qualification'),
      centerName: getCustomFieldValue('CITY') !== 'Not specified' ? getCustomFieldValue('CITY') : 
                 (location?.city || 'Not specified'),
      tvetsEnrollmentNumber: getCustomFieldValue('TVETS'),
      courses: getCustomFieldValue('COURSES') !== 'Not specified' ? 
               getCustomFieldValue('COURSES').split(', ') : 
               application.applied_skills || [],
      skills: getCustomFieldValue('SKILL') !== 'Not specified' ? 
              mapSkillIdsToNames(getCustomFieldValue('SKILL')) : 
              [],
      passYear: new Date().getFullYear(),
      
      // Opportunity details
      companyName: company?.name || 'Not specified',
      title: opportunity?.title || 'Not specified',
      description: opportunity?.description || 'Not specified',
      opportunityType: opportunity?.opportunity_type || 'Not specified',
      experienceLevel: opportunity?.experience_level || 'Not specified',
      salary: opportunity?.min_salary || opportunity?.max_salary || 0,
      industryName: category?.name || 'Not specified',
      industryLocation: location ? `${location.city || ''}, ${location.state || ''}, ${location.country || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, '') : 'Not specified',
      
      // Application status
      status: application.status?.status || 'Not specified',
      doj: application.created_at || null,
      startDateForAttachment: application.created_at || null,
      endDateForAttachment: application.updated_at || null,
      
      // Benefits & Work details
      benefits: opportunity?.benefits ? mapBenefitIdsToNames(opportunity.benefits) : [],
      otherBenefits: opportunity?.other_benefit || '',
      workMode: opportunity?.work_nature || 'Not specified',
      offerLetterProvided: opportunity?.offer_letter_provided || false,
      rejectionReason: opportunity?.rejection_reason || '',
      
      // Additional application details
      applicationId: application.id,
      userId: application.user_id,
      matchScore: application.match_score,
      feedback: application.feedback,
      youthFeedback: application.youth_feedback,
      appliedSkills: application.applied_skills ? mapSkillIdsToNames(application.applied_skills.join(',')) : [],
      createdAt: application.created_at,
      updatedAt: application.updated_at,
    };
  }

  private calculateAge(dateOfBirth: Date | string): number {
    try {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      
      // Check if the date is valid
      if (isNaN(birthDate.getTime())) {
        throw new Error('Invalid date format');
      }
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      // Ensure age is reasonable (between 0 and 120)
      if (age < 0 || age > 120) {
        throw new Error('Age out of reasonable range');
      }
      
      return age;
    } catch (error) {
      throw error;
    }
  }

  // Helper method for pagination
  private getPaginationParams(query: any): {
    offset: number;
    limit: number;
    page: number;
  } {
    const page =
      query.page && !isNaN(query.page)
        ? Math.max(parseInt(query.page, 10), 1)
        : 1;
    let limit =
      query.limit && !isNaN(query.limit)
        ? Math.max(parseInt(query.limit, 10), 1)
        : 10;
    limit = Math.min(limit, 100); // Prevent too large limits
    const offset = (page - 1) * limit;
    return { offset, limit, page };
  }

  // Helper method for getting archived status
  private async getArchivedStatus(
    res: Response
  ): Promise<ApplicationStatus | null> {
    const archivedStatus = await this.entityManager.findOne(ApplicationStatus, {
      where: { status: 'archived' },
    });

    if (!archivedStatus) {
      APIResponse.error(
        res,
        'FIND_ALL_OPPORTUNITY_APPLICATIONS',
        'ARCHIVED_STATUS_NOT_FOUND',
        'Archived status not found in application_statuses table.',
        HttpStatus.NOT_FOUND
      );
      return null;
    }
    return archivedStatus;
  }

  // Helper method for building base query
  private buildBaseApplicationQuery(archivedStatusId: string | undefined) {
    return this.entityManager
      .createQueryBuilder(OpportunityApplication, 'application')
      .leftJoinAndSelect('application.opportunity', 'opportunity')
      .leftJoinAndSelect('application.status', 'status')
      .leftJoinAndSelect('opportunity.location', 'location')
      .leftJoinAndSelect('opportunity.company', 'company')
      .leftJoinAndSelect('opportunity.category', 'category')
      .select([
        'application.id AS application_id',
        'application.opportunity_id AS application_opportunity_id',
        'application.status_id AS application_status_id',
        'application.user_id AS application_user_id',
        'application.match_score AS application_match_score',
        'application.feedback AS application_feedback',
        'application.youth_feedback AS application_youth_feedback',
        'application.created_by AS application_created_by',
        'application.updated_by AS application_updated_by',
        'application.applied_skills AS application_applied_skills',
        'application.created_at AS application_created_at',
        'application.updated_at AS application_updated_at',
        'status.id AS status_id',
        'status.status AS status_name',
        // Opportunity details
        'opportunity.id AS opportunity_id',
        'opportunity.title AS opportunity_title',
        'opportunity.description AS opportunity_description',
        'opportunity.work_nature AS opportunity_work_nature',
        'opportunity.opportunity_type AS opportunity_opportunity_type',
        'opportunity.experience_level AS opportunity_experience_level',
        'opportunity.min_experience AS opportunity_min_experience',
        'opportunity.min_salary AS opportunity_min_salary',
        'opportunity.max_salary AS opportunity_max_salary',
        'opportunity.status AS opportunity_status',
        'opportunity.created_by AS opportunity_created_by',
        'opportunity.updated_by AS opportunity_updated_by',
        // Location details
        'location.id AS location_id',
        'location.city AS location_city',
        'location.state AS location_state',
        'location.country AS location_country',
        // Category details
        'category.id AS category_id',
        'category.name AS category_name',
        // Company details
        'company.id AS company_id',
        'company.name AS company_name',
      ])
      .where('application.status_id != :archivedStatusId', {
        archivedStatusId,
      });
  }

  // Helper method for applying filters
  private applyFilters(qb: any, query: any) {
    if (query.opportunity_id) {
      qb.andWhere('application.opportunity_id = :opportunity_id', {
        opportunity_id: query.opportunity_id,
      });
    }
    if (query.status_id) {
      qb.andWhere('application.status_id = :status_id', {
        status_id: query.status_id,
      });
    }
    if (query.applied_skills) {
      const skillsArray = query.applied_skills.split(',');
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(application.applied_skills) skill_id 
          WHERE skill_id = ANY(:skillsArray)
        )`,
        { skillsArray }
      );
    }
    if (query.search) {
      qb.andWhere(
        `(opportunity.title ILIKE :search OR status.status ILIKE :search)`,
        { search: `%${query.search}%` }
      );
    }
  }
}
