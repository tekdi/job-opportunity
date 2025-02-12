import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

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
}
