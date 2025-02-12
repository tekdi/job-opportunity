import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("organizations")
export class Organization {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({ nullable: true })
  website!: string;
}
