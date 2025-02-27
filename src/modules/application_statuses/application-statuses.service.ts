import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationStatus } from './entities/application_status.entity';
import { CreateApplicationStatusDto } from './dto/create-application-status.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import APIResponse from 'modules/common/responses/response';

@Injectable()
export class ApplicationStatusesService {
  constructor(
    @InjectRepository(ApplicationStatus)
    private readonly applicationStatusRepository: Repository<ApplicationStatus>
  ) {}

  async create(createDto: CreateApplicationStatusDto, res: any): Promise<any> {
    try {
      const newStatus = this.applicationStatusRepository.create(createDto);
      const savedStatus = await this.applicationStatusRepository.save(
        newStatus
      );
      return APIResponse.success(
        res,
        'Application Status created successfully',
        savedStatus,
        HttpStatus.OK,
        'New Application Status Added'
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Failed to create Application Status',
        'ERROR_CREATE_APPLICATION_STATUS',
        'Error Creating Application Status',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll(res: any): Promise<any> {
    try {
      const savedStatus = await this.applicationStatusRepository.find();
      return APIResponse.success(
        res,
        'Application Status created successfully',
        savedStatus,
        HttpStatus.OK,
        'New Application Status Added'
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Failed to retrieve Application Statuses',
        'ERROR_FETCH_APPLICATION_STATUSES',
        'Error Fetching Application Statuses',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: string, res: any): Promise<any> {
    try {
      const status = await this.applicationStatusRepository.findOne({
        where: { id },
      });
      if (!status) {
        return APIResponse.error(
          res,
          `Application status with ID ${id} not found`,
          'ERROR_FETCH_APPLICATION_STATUS',
          'Error Fetching Application Status',
          HttpStatus.NOT_FOUND
        );
      }

      return APIResponse.success(
        res,
        'Application Status created successfully',
        status,
        HttpStatus.OK,
        'New Application Status Added'
      );
    } catch (error) {
      return APIResponse.error(
        res,
        `Application status with ID ${id} not found`,
        'ERROR_FETCH_APPLICATION_STATUS',
        'Error Fetching Application Status',
        HttpStatus.NOT_FOUND
      );
    }
  }

  async update(
    id: string,
    updateDto: UpdateApplicationStatusDto,
    res: any
  ): Promise<any> {
    try {
      const existingStatus = await this.findOne(id, res); // Check if exists

      if (!existingStatus) {
        return APIResponse.error(
          res,
          `Application status with ID ${id} not found`,
          'ERROR_UPDATE_APPLICATION_STATUS',
          'Error Updating Application Status',
          HttpStatus.NOT_FOUND
        );
      }

      await this.applicationStatusRepository.update(id, updateDto);
      const updatedStatus = await this.findOne(id, res); // Fetch updated record

      return APIResponse.success(
        res,
        'Application Status updated successfully',
        updatedStatus,
        HttpStatus.OK,
        'Application Status Updated'
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'An error occurred while updating application status',
        'ERROR_UPDATE_APPLICATION_STATUS',
        'Error Updating Application Status',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async remove(id: string, res: any): Promise<any> {
    try {
      const existingStatus = await this.findOne(id, res); // Check if it exists

      if (!existingStatus) {
        return APIResponse.error(
          res,
          `Application status with ID ${id} not found`,
          'ERROR_DELETE_APPLICATION_STATUS',
          'Error Deleting Application Status',
          HttpStatus.NOT_FOUND
        );
      }

      await this.applicationStatusRepository.delete(id);

      return APIResponse.success(
        res,
        'Application Status deleted successfully',
        null,
        HttpStatus.OK,
        'Application Status Deleted'
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'An error occurred while deleting application status',
        'ERROR_DELETE_APPLICATION_STATUS',
        'Error Deleting Application Status',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
