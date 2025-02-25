import { Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import APIResponse from 'modules/common/responses/response';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationsRepository: Repository<Location>,
  ) {}

  async create(res: any, createLocationDto: CreateLocationDto, userId: string) {
    try {
      const location = this.locationsRepository.create({
        ...createLocationDto,
        created_by: userId,
        updated_by: userId,
      });

      const savedLocation = await this.locationsRepository.save(location);

      return APIResponse.success(
        res,
        'Location created successfully',
        savedLocation,
        HttpStatus.OK,
        'Location created successfully',
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Failed to create location',
        'ERROR_CREATE_LOCATION',
        'An error occurred while creating the location',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(res: any, query: any) {
    try {
      const page = query.page ? parseInt(query.page, 10) : 1;
      const limit = query.limit ? parseInt(query.limit, 10) : 10;

      let qb: SelectQueryBuilder<Location> =
        this.locationsRepository.createQueryBuilder('location');

      if (query.city) {
        qb = qb.andWhere('LOWER(location.city) LIKE LOWER(:city)', {
          city: `%${query.city}%`,
        });
      }

      if (query.state) {
        qb = qb.andWhere('LOWER(location.state) LIKE LOWER(:state)', {
          state: `%${query.state}%`,
        });
      }

      if (query.country) {
        qb = qb.andWhere('LOWER(location.country) LIKE LOWER(:country)', {
          country: `%${query.country}%`,
        });
      }

      if (query.orderBy) {
        const validFields = [
          'city',
          'state',
          'country',
          'created_by',
          'updated_by',
          'created_at',
          'updated_at',
        ];
        if (validFields.includes(query.orderBy)) {
          qb.orderBy(
            `location.${query.orderBy}`,
            query.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
          );
        }
      } else {
        qb.orderBy('location.created_at', 'DESC');
      }

      qb.skip((page - 1) * limit).take(limit);
      const locations = await qb.getMany();

      return APIResponse.success(
        res,
        'Locations retrieved successfully',
        locations,
        HttpStatus.OK,
        'Locations retrieved successfully',
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Failed to retrieve locations',
        'ERROR_FETCH_LOCATIONS',
        'An error occurred while fetching locations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(res: any, id: string) {
    try {
      const location = await this.locationsRepository.findOne({
        where: { id },
      });

      if (!location) {
        return APIResponse.error(
          res,
          `Location with ID ${id} not found`,
          'ERROR_LOCATION_NOT_FOUND',
          'No location found with the given ID',
          HttpStatus.NOT_FOUND,
        );
      }

      return APIResponse.success(
        res,
        'Location retrieved successfully',
        location,
        HttpStatus.OK,
        'Location retrieved successfully',
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Failed to retrieve location',
        'ERROR_FETCH_LOCATION',
        'An error occurred while fetching the location',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    res: any,
    id: string,
    updateLocationDto: UpdateLocationDto,
    userId: string,
  ) {
    try {
      const location = await this.locationsRepository.findOne({
        where: { id },
      });

      if (!location) {
        return APIResponse.error(
          res,
          `Location with ID ${id} not found`,
          'ERROR_LOCATION_NOT_FOUND',
          'No location found with the given ID',
          HttpStatus.NOT_FOUND,
        );
      }

      Object.assign(location, {
        ...(updateLocationDto.city !== undefined && {
          city: updateLocationDto.city,
        }),
        ...(updateLocationDto.state !== undefined && {
          state: updateLocationDto.state,
        }),
        ...(updateLocationDto.country !== undefined && {
          country: updateLocationDto.country,
        }),
        ...(updateLocationDto.latitude !== undefined && {
          latitude: updateLocationDto.latitude,
        }),
        ...(updateLocationDto.longitude !== undefined && {
          longitude: updateLocationDto.longitude,
        }),
        updated_by: userId,
      });

      const updatedLocation = await this.locationsRepository.save(location);

      return APIResponse.success(
        res,
        'Location updated successfully',
        updatedLocation,
        HttpStatus.OK,
        'Location updated successfully',
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Failed to update location',
        'ERROR_UPDATE_LOCATION',
        'An error occurred while updating the location',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(res: any, id: string) {
    try {
      await this.findOne(res, id);
      await this.locationsRepository.delete(id);

      return APIResponse.success(
        res,
        'Location deleted successfully',
        { id },
        HttpStatus.OK,
        'Location deleted successfully',
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Failed to delete location',
        'ERROR_DELETE_LOCATION',
        'An error occurred while deleting the location',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
