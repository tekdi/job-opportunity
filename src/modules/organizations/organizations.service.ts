import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import APIResponse from 'modules/common/responses/response';

@Injectable()
export class OrganizationsService {
  constructor(private readonly entityManager: EntityManager) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
    res: any
  ): Promise<any> {
    if (!createOrganizationDto.name?.trim()) {
      return APIResponse.error(
        res,
        'Organization name is required and cannot be empty.',
        'ERROR_CREATE_ORGANIZATION',
        'Organization name is required and cannot be empty.',
        HttpStatus.BAD_REQUEST
      );
    }

    const organization = new Organization();
    organization.name = createOrganizationDto.name.trim();
    organization.description = createOrganizationDto.description ?? '';
    organization.website = createOrganizationDto.website ?? '';
    organization.created_by = createOrganizationDto.created_by;
    organization.updated_by = createOrganizationDto.updated_by;

    try {
      const savedOrganization = await this.entityManager.save(
        Organization,
        organization
      );
      return APIResponse.success(
        res,
        'Organization created successfully',
        savedOrganization,
        HttpStatus.OK,
        'Organization created successfully'
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Error creating organization',
        'ERROR_FETCH_ORGANIZATION',
        'Error creating organization',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll(query: any, res: any): Promise<any> {
    try {
      const page = query.page ? parseInt(query.page, 10) : 1;
      const limit = query.limit ? parseInt(query.limit, 10) : 10;

      const qb = this.entityManager
        .createQueryBuilder(Organization, 'organization')
        .select([
          'organization.id',
          'organization.name',
          'organization.description',
          'organization.website',
          'organization.created_by',
          'organization.updated_by',
          'organization.created_at',
          'organization.updated_at',
        ]);

      // Apply search filter for name
      if (query.name) {
        qb.andWhere('organization.name ILIKE :name', {
          name: `%${query.name}%`,
        });
      }

      // Ensure orderBy works for specific fields
      const validOrderByFields = [
        'name',
        'created_by',
        'updated_by',
        'created_at',
        'updated_at',
      ];

      if (query.orderBy && validOrderByFields.includes(query.orderBy)) {
        qb.orderBy(
          `organization.${query.orderBy}`,
          query.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
        );
      } else {
        qb.orderBy('organization.created_at', 'DESC'); // Default ordering
      }

      qb.skip((page - 1) * limit).take(limit);

      const organizations = await qb.getMany();

      return APIResponse.success(
        res,
        'Organizations retrieved successfully',
        organizations,
        HttpStatus.OK,
        'Organizations retrieved successfully'
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Error fetching organizations',
        'ERROR_FETCH_ORGANIZATIONS',
        'Error fetching organizations',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: string, res: any): Promise<any> {
    try {
      const organization = await this.entityManager.findOne(Organization, {
        where: { id },
      });

      if (!organization) {
        throw new NotFoundException(`Organization with ID ${id} not found`);
      }

      return APIResponse.success(
        res,
        'Organization retrieved successfully',
        organization,
        HttpStatus.OK,
        'Organization retrieved successfully'
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Error fetching organization',
        'ERROR_FETCH_ORGANIZATION',
        'Error fetching organization',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
    res: any
  ): Promise<any> {
    try {
      const organization = await this.entityManager.findOne(Organization, {
        where: { id },
      });

      if (!organization) {
        return APIResponse.error(
          res,
          `Organization with ID ${id} not found`,
          'ERROR_UPDATE_ORGANIZATION',
          'Error updating organization',
          HttpStatus.NOT_FOUND
        );
      }

      Object.assign(organization, {
        ...(updateOrganizationDto.name !== undefined && {
          name: updateOrganizationDto.name.trim(),
        }),
        ...(updateOrganizationDto.description !== undefined && {
          description: updateOrganizationDto.description,
        }),
        ...(updateOrganizationDto.website !== undefined && {
          website: updateOrganizationDto.website,
        }),
        ...(updateOrganizationDto.updated_by !== undefined && {
          updated_by: updateOrganizationDto.updated_by,
        }),
      });

      const updatedOrganization = await this.entityManager.save(
        Organization,
        organization
      );

      return APIResponse.success(
        res,
        'Organization updated successfully',
        updatedOrganization,
        HttpStatus.OK,
        'Organization updated successfully'
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Error updating organization',
        'ERROR_UPDATE_ORGANIZATION',
        'Error updating organization',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async remove(id: string, res: any): Promise<any> {
    try {
      const organization = await this.entityManager.findOne(Organization, {
        where: { id },
      });

      if (!organization) {
        throw new NotFoundException(`Organization with ID ${id} not found`);
      }

      await this.entityManager.delete(Organization, id);

      return APIResponse.success(
        res,
        'Organization deleted successfully',
        null,
        HttpStatus.OK,
        'Organization deleted successfully'
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Error deleting organization',
        'ERROR_DELETE_ORGANIZATION',
        'Error deleting organization',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
