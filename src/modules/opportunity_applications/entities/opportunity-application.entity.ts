import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Opportunity } from '../../opportunities/entities/opportunity.entity';
import { ApplicationStatus } from '../../application_statuses/entities/application_status.entity';

@Entity('opportunity_applications')
export class OpportunityApplication {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'uuid', nullable: false })
  opportunity_id?: string;

  @Column({ type: 'uuid', nullable: false })
  status_id?: string;

  @ManyToOne(() => Opportunity, (opportunity) => opportunity.applications, {
    nullable: false,
  })
  @JoinColumn({ name: 'opportunity_id' })
  opportunity?: Opportunity;

  @Column({ type: 'uuid', nullable: false })
  user_id?: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  match_score?: number;

  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @Column({ type: 'text', nullable: true })
  youth_feedback?: string;

  @Column({ type: 'uuid', nullable: false })
  created_by!: string;

  @Column({ type: 'uuid', nullable: false })
  updated_by!: string;

  @ManyToOne(() => ApplicationStatus, (status) => status.applications, {
    nullable: false,
  })
  @JoinColumn({ name: 'status_id' })
  status?: ApplicationStatus;

  @Column({ type: 'jsonb', nullable: false })
  applied_skills?: string[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;
}
