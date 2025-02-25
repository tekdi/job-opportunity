import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { OpportunityApplication } from '../../opportunity_applications/entities/opportunity-application.entity';

@Entity('application_statuses')
export class ApplicationStatus {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  status?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at?: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at?: Date;

  // Relationship with OpportunityApplication
  @OneToMany(() => OpportunityApplication, (application) => application.status)
  applications?: OpportunityApplication[];
}
