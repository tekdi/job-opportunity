import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { Location } from "./entities/location.entity";
import { CreateLocationDto } from "./dto/create-location.dto";
import { UpdateLocationDto } from "./dto/update-location.dto";

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationsRepository: Repository<Location>
  ) {}

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    const location = this.locationsRepository.create(createLocationDto);
    return await this.locationsRepository.save(location);
  }

  async findAll(query: any): Promise<Location[]> {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 10;

    let qb: SelectQueryBuilder<Location> =
      this.locationsRepository.createQueryBuilder("location");

    if (query.city) {
      qb = qb.where("location.city ILIKE :city", { city: `%${query.city}%` });
    }

    if (query.country) {
      qb = qb.andWhere("location.country ILIKE :country", {
        country: `%${query.country}%`,
      });
    }

    qb.skip((page - 1) * limit).take(limit);

    return await qb.getMany();
  }

  async findOne(id: string): Promise<Location> {
    const location = await this.locationsRepository.findOne({ where: { id } });
    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }
    return location;
  }

  async update(
    id: string,
    updateLocationDto: UpdateLocationDto
  ): Promise<Location> {
    await this.findOne(id);
    await this.locationsRepository.update(id, updateLocationDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.locationsRepository.delete(id);
  }
}
