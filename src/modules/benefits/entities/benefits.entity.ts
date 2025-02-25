import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Opportunity } from "../../opportunities/entities/opportunity.entity";

@Entity("benefits")
export class Benefit {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  name?: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at?: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at?: Date;

  // Relationship with Opportunity
  @OneToMany(() => Opportunity, (opportunity) => opportunity.benefit)
  opportunities?: Opportunity[];
}
