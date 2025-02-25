import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { EntityManager, In } from "typeorm";
import { OpportunityApplication } from "./entities/opportunity-application.entity";
import { CreateOpportunityApplicationDto } from "./dto/create-opportunity-application.dto";
import { UpdateOpportunityApplicationDto } from "./dto/update-opportunity-application.dto";
import { Opportunity } from "../opportunities/entities/opportunity.entity";
import { ApplicationStatus } from "../application_statuses/entities/application_status.entity";
import { Skill } from "../skills/entities/skill.entity";
import { HttpStatus } from "@nestjs/common";
import { Response } from "express";
import APIResponse from "modules/common/responses/response";
import { skip } from "rxjs";

@Injectable()
export class OpportunityApplicationService {
  constructor(private readonly entityManager: EntityManager) {}

  async create(
    createDto: CreateOpportunityApplicationDto,
    res: Response
  ): Promise<any> {
    try {
      // Validate Opportunity
      const opportunity = await this.entityManager.findOne(Opportunity, {
        where: { id: createDto.opportunity_id },
      });
      if (!opportunity) {
        return APIResponse.error(
          res,
          "CREATE_OPPORTUNITY_APPLICATION",
          "INVALID_OPPORTUNITY_ID",
          "Invalid opportunity_id",
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
          "CREATE_OPPORTUNITY_APPLICATION",
          "INVALID_STATUS_ID",
          "Invalid status_id",
          HttpStatus.BAD_REQUEST
        );
      }

      // Convert applied_skills to JSON
      if (!Array.isArray(createDto.applied_skills)) {
        return APIResponse.error(
          res,
          "CREATE_OPPORTUNITY_APPLICATION",
          "INVALID_APPLIED_SKILLS",
          "applied_skills must be an array",
          HttpStatus.BAD_REQUEST
        );
      }

      // Ensure `created_by` and `updated_by` are properly set
      if (!createDto.created_by || !createDto.updated_by) {
        return APIResponse.error(
          res,
          "CREATE_OPPORTUNITY_APPLICATION",
          "MISSING_CREATED_BY_UPDATED_BY",
          "Both created_by and updated_by are required.",
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
        "CREATE_OPPORTUNITY_APPLICATION",
        { data: savedApplication, total: 1 },
        HttpStatus.OK,
        "Opportunity application created successfully"
      );
    } catch (error) {
      return APIResponse.error(
        res,
        "CREATE_OPPORTUNITY_APPLICATION",
        "CREATE_OPPORTUNITY_APPLICATION_ERROR",
        "Error creating opportunity application",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: string, res: Response): Promise<any> {
    try {
      const opportunityApplication = await this.entityManager.findOne(
        OpportunityApplication,
        { where: { id } }
      );

      if (!opportunityApplication) {
        return APIResponse.error(
          res,
          "FIND_OPPORTUNITY_APPLICATION",
          "NOT_FOUND",
          `OpportunityApplication with ID ${id} not found`,
          HttpStatus.NOT_FOUND
        );
      }

      // Fetch Opportunity Details (ID + Title)
      const opportunity = await this.entityManager.findOne(Opportunity, {
        where: { id: opportunityApplication.opportunity_id },
        select: ["id", "title"],
      });

      // Fetch Status Details (ID + Name)
      const status = await this.entityManager.findOne(ApplicationStatus, {
        where: { id: opportunityApplication.status_id },
        select: ["id", "status"],
      });

      // Fetch Skill Details (Only IDs in `applied_skills`)
      let appliedSkillDetails: { id: string; name: string }[] = [];
      if (
        opportunityApplication.applied_skills &&
        opportunityApplication.applied_skills.length > 0
      ) {
        const skills = await this.entityManager
          .createQueryBuilder("skills", "skill") // Use entity name as string
          .where("skill.id IN (:...ids)", {
            ids: opportunityApplication.applied_skills,
          })
          .getMany();

        appliedSkillDetails = skills.map((s) => ({ id: s.id, name: s.name })); // Map skill details
      }

      return APIResponse.success(
        res,
        "FIND_OPPORTUNITY_APPLICATION",
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
        "Opportunity application retrieved successfully"
      );
    } catch (error) {
      return APIResponse.error(
        res,
        "FIND_OPPORTUNITY_APPLICATION",
        "ERROR_FETCHING_APPLICATION",
        "Error fetching opportunity application",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Function to fetch all applications with filters, search and pagination
  async findAll(query: any, res: Response): Promise<any> {
    try {
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

      // 🔹 Get the "archived" status UUID dynamically
      const archivedStatus = await this.entityManager.findOne(
        ApplicationStatus,
        {
          where: { status: "archived" },
        }
      );

      if (!archivedStatus) {
        return APIResponse.error(
          res,
          "FIND_ALL_OPPORTUNITY_APPLICATIONS",
          "ARCHIVED_STATUS_NOT_FOUND",
          "Archived status not found in application_statuses table.",
          HttpStatus.NOT_FOUND
        );
      }

      const qb = this.entityManager
        .createQueryBuilder(OpportunityApplication, "application")
        .leftJoinAndSelect("application.opportunity", "opportunity")
        .leftJoinAndSelect("application.status", "status")
        .select([
          "application.id AS application_id",
          "application.opportunity_id AS application_opportunity_id",
          "application.status_id AS application_status_id",
          "application.user_id AS application_user_id",
          "application.match_score AS application_match_score",
          "application.feedback AS application_feedback",
          "application.youth_feedback AS application_youth_feedback",
          "application.created_by AS application_created_by",
          "application.updated_by AS application_updated_by",
          "application.applied_skills AS application_applied_skills",
          "application.created_at AS application_created_at",
          "application.updated_at AS application_updated_at",
          "opportunity.id AS opportunity_id",
          "opportunity.title AS opportunity_title",
          "status.id AS status_id",
          "status.status AS status_name",
        ])
        .where("application.status_id != :archivedStatusId", {
          archivedStatusId: archivedStatus.id,
        });

      // Apply Filters
      if (query.opportunity_id) {
        qb.andWhere("application.opportunity_id = :opportunity_id", {
          opportunity_id: query.opportunity_id,
        });
      }

      if (query.status_id) {
        qb.andWhere("application.status_id = :status_id", {
          status_id: query.status_id,
        });
      }

      if (query.applied_skills) {
        const skillsArray = query.applied_skills.split(",");
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

      if (query.orderBy) {
        const orderColumnMap = {
          created_at: "application.created_at",
          updated_at: "application.updated_at",
          opportunity_title: "opportunity.title",
          status_name: "status.status",
        };

        const orderColumn =
          orderColumnMap[query.orderBy as keyof typeof orderColumnMap] ||
          "application.created_at";
        qb.orderBy(orderColumn, query.order || "DESC");
      } else {
        qb.orderBy("application.created_at", "DESC");
      }

      qb.skip(offset).take(limit);
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

        (app as any)["applied_skills_details"] = appliedSkillDetails;
      }

      return APIResponse.success(
        res,
        "FIND_ALL_OPPORTUNITY_APPLICATIONS",
        applications,
        HttpStatus.OK,
        "Opportunity applications retrieved successfully"
      );
    } catch (error) {
      return APIResponse.error(
        res,
        "FIND_ALL_OPPORTUNITY_APPLICATIONS",
        "ERROR_FETCHING_APPLICATIONS",
        "Error fetching opportunity applications",
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
          "ERROR_NOT_FOUND",
          "No opportunity application found with the given ID",
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
            "ERROR_INVALID_OPPORTUNITY_ID",
            "The provided opportunity ID does not exist",
            "Invalid Opportunity_id",
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
            "ERROR_INVALID_STATUS_ID",
            "The provided status ID does not exist",
            "Invalid status_id",
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
            "ERROR_INVALID_SKILLS",
            "Applied skills should be in array format",
            "Applied_skills must be an array",
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
          "ERROR_MISSING_UPDATED_BY",
          "Updated_by field is mandatory for updating the application",
          "Updated_by is required",
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
        "OpportunityApplication updated successfully",
        updatedApplication,
        HttpStatus.OK,
        "Opportunity application update successful"
      );
    } catch (error) {
      return APIResponse.error(
        res, // Pass response object
        "ERROR_UPDATE_FAILED",
        "An error occurred while updating the opportunity application",
        "Failed to update OpportunityApplication",
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
          "UserId is required.",
          "ERROR_MISSING_USER_ID",
          "User ID is required to archive the application",
          HttpStatus.BAD_REQUEST
        );
      }

      // Fetch archived status UUID from `application_statuses` table
      const archivedStatus = await this.entityManager.findOne(
        ApplicationStatus,
        {
          where: { status: "archived" },
        }
      );

      if (!archivedStatus) {
        return APIResponse.error(
          res,
          "Archived status not found",
          "ERROR_ARCHIVED_STATUS_NOT_FOUND",
          "Archived status does not exist in the application_statuses table",
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
          "ERROR_APPLICATION_NOT_FOUND",
          "No opportunity application found with the given ID",
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
        "Opportunity application archived successfully",
        { id, status: "archived" },
        HttpStatus.OK,
        `Opportunity application ${id} archived successfully.`
      );
    } catch (error) {
      return APIResponse.error(
        res,
        "Failed to archive opportunity application",
        "ERROR_ARCHIVE_FAILED",
        "An error occurred while archiving the opportunity application",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
