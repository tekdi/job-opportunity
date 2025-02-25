import { Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Benefit } from './entities/benefits.entity';
import { CreateBenefitsDto, UpdateBenefitsDto } from './dto/benefits.dto';
import APIResponse from 'modules/common/responses/response';

@Injectable()
export class BenefitsService {
  constructor(
    @InjectRepository(Benefit)
    private readonly benefitsRepository: Repository<Benefit>,
  ) {}

  async create(createBenefitsDto: CreateBenefitsDto, res: any): Promise<any> {
    try {
      const benefits = this.benefitsRepository.create(createBenefitsDto);
      const savedBenefits = await this.benefitsRepository.save(benefits);

      return APIResponse.success(
        res,
        'Benefits created successfully',
        savedBenefits,
        HttpStatus.OK,
        'New benefits entry added',
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Failed to create benefits',
        'ERROR_CREATE_BENEFITS',
        'Error creating benefits',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Get All Benefits
  async findAll(res: any): Promise<any> {
    try {
      const benefits = await this.benefitsRepository.find();
      return APIResponse.success(
        res,
        'Benefits retrieved successfully',
        benefits,
        HttpStatus.OK,
        'List of all benefits',
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Failed to retrieve benefits',
        'ERROR_FETCH_BENEFITS',
        'Error fetching benefits',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Get Benefits by ID
  async findOne(id: string, res: any): Promise<any> {
    try {
      const benefits = await this.benefitsRepository.findOne({ where: { id } });

      if (!benefits) {
        return APIResponse.error(
          res,
          `Benefits with ID ${id} not found`,
          'ERROR_BENEFIT_NOT_FOUND',
          'No benefits found with the given ID',
          HttpStatus.NOT_FOUND,
        );
      }

      return APIResponse.success(
        res,
        'Benefit retrieved successfully',
        benefits,
        HttpStatus.OK,
        'Details of the requested benefit',
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Failed to retrieve benefits',
        'ERROR_FETCH_BENEFIT',
        'Error fetching benefits',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Update Benefits
  async update(
    id: string,
    updateBenefitsDto: UpdateBenefitsDto,
    res: any,
  ): Promise<any> {
    try {
      await this.findOne(id, res); // Check if exists
      await this.benefitsRepository.update(id, updateBenefitsDto);
      const updatedBenefit = await this.findOne(id, res);

      return APIResponse.success(
        res,
        'Benefits updated successfully',
        updatedBenefit,
        HttpStatus.OK,
        'Updated benefit details',
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Failed to update benefits',
        'ERROR_UPDATE_BENEFITS',
        'Error updating benefits',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Delete Benefits
  async remove(id: string, res: any): Promise<any> {
    try {
      const benefits = await this.findOne(id, res);
      await this.benefitsRepository.remove(benefits);

      return APIResponse.success(
        res,
        'Benefits deleted successfully',
        null,
        HttpStatus.OK,
        'The specified benefit has been removed',
      );
    } catch (error) {
      return APIResponse.error(
        res,
        'Failed to delete benefits',
        'ERROR_DELETE_BENEFITS',
        'Error deleting benefits',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
