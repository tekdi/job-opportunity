import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Location } from '../../locations/entities/location.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { Category } from '../../categories/entities/category.entity';
import { OpportunityApplication } from '../../opportunity_applications/entities/opportunity-application.entity';
import { Benefit } from 'modules/benefits/entities/benefits.entity';

export enum OpportunityPricingType {
  FREE = 'free',
  PAID = 'paid',
}

@Entity('opportunities')
export class Opportunity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string = '';

  @Column({ type: 'text', nullable: true })
  description?: string = '';

  @Column({
    type: 'enum',
    enum: ['Remote', 'On-site', 'Hybrid', 'Work from Office'],
    default: 'Remote',
  })
  work_nature: string = 'Remote';

  @Column({
    type: 'enum',
    enum: ['full-time', 'mid', 'contract', 'internship'],
    nullable: true,
  })
  opportunity_type: string = 'full-time';

  @Column({ type: 'enum', enum: ['entry', 'part-time'], default: 'entry' })
  experience_level: string = 'entry';

  @Column({ type: 'int', nullable: true })
  min_experience: number = 0;

  @Column({ type: 'decimal', nullable: true })
  min_salary: number = 0;

  @Column({ type: 'decimal', nullable: true })
  max_salary: number = 0;

  @Column({ type: 'int', nullable: false })
  no_of_candidates: number = 1;

  @Column({
    type: 'enum',
    enum: ['open', 'closed', 'archived', 'pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: string = 'pending';

  @Column({ type: 'text', nullable: true })
  rejection_reason?: string | null;

  @Column({ type: 'jsonb', nullable: false, default: [] })
  skills?: string[];

  @Column({ type: 'uuid', nullable: false })
  created_by: string = '';

  @Column({ type: 'uuid', nullable: false })
  updated_by: string = '';

  @ManyToOne(() => Location, { nullable: true })
  @JoinColumn({ name: 'location_id' })
  location?: Location | null = null;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company?: Organization | null = null;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category?: Category | null = null;

  @OneToMany(
    () => OpportunityApplication,
    (application) => application.opportunity
  )
  applications?: OpportunityApplication[];

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;

  @ManyToOne(() => Benefit, (benefit) => benefit.opportunities, {
    nullable: true,
  })
  @JoinColumn({ name: 'benefit_id' })
  benefit?: Benefit;

  @Column({ type: 'varchar', length: 255, nullable: true })
  other_benefit?: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  created_at!: Date;

  @Column({ type: 'boolean', default: false }) // Default false
  offer_letter_provided?: boolean;

  @Column({
    type: 'enum',
    enum: OpportunityPricingType,
    default: OpportunityPricingType.FREE, // Default free
  })
  pricing_type?: OpportunityPricingType;
}
