import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { Organization } from "./entities/organization.entity";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationsRepository: Repository<Organization>
  ) {}

  async create(
    createOrganizationDto: CreateOrganizationDto
  ): Promise<Organization> {
    const organization = this.organizationsRepository.create(
      createOrganizationDto
    );
    return await this.organizationsRepository.save(organization);
  }

  async findAll(query: any): Promise<Organization[]> {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 10;

    let qb: SelectQueryBuilder<Organization> =
      this.organizationsRepository.createQueryBuilder("organization");

    if (query.name) {
      qb = qb.where("organization.name ILIKE :name", {
        name: `%${query.name}%`,
      });
    }

    qb.skip((page - 1) * limit).take(limit);

    return await qb.getMany();
  }

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationsRepository.findOne({
      where: { id },
    });
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return organization;
  }

  async update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto
  ): Promise<Organization> {
    await this.findOne(id);
    await this.organizationsRepository.update(id, updateOrganizationDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.organizationsRepository.delete(id);
  }
}
