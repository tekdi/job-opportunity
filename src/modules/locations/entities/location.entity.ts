import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("locations")
export class Location {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  city!: string;

  @Column({ nullable: true })
  state!: string;

  @Column()
  country!: string;

  @Column({ type: "decimal", nullable: true })
  latitude!: number;

  @Column({ type: "decimal", nullable: true })
  longitude!: number;

  @Column({ type: "uuid", nullable: false })
  created_by!: string;

  @Column({ type: "uuid", nullable: false })
  updated_by!: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at!: Date;
}
