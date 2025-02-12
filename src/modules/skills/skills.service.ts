import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { Skill } from "./entities/skill.entity";
import { CreateSkillDto } from "./dto/create-skill.dto";
import { UpdateSkillDto } from "./dto/update-skill.dto";

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>
  ) {}

  async create(createSkillDto: CreateSkillDto): Promise<Skill> {
    const skill = this.skillsRepository.create(createSkillDto);
    return await this.skillsRepository.save(skill);
  }

  async findAll(query: any): Promise<Skill[]> {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 10;

    let qb: SelectQueryBuilder<Skill> =
      this.skillsRepository.createQueryBuilder("skill");

    if (query.name) {
      qb = qb.where("skill.name ILIKE :name", { name: `%${query.name}%` });
    }

    qb.skip((page - 1) * limit).take(limit);

    return await qb.getMany();
  }

  async findOne(id: string): Promise<Skill> {
    const skill = await this.skillsRepository.findOne({ where: { id } });
    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found`);
    }
    return skill;
  }

  async update(id: string, updateSkillDto: UpdateSkillDto): Promise<Skill> {
    await this.findOne(id); // Ensures entity exists
    await this.skillsRepository.update(id, updateSkillDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Ensures entity exists before deletion
    await this.skillsRepository.delete(id);
  }
}
