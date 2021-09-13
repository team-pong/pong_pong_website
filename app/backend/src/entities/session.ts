import { Entity, PrimaryColumn, Column, } from 'typeorm';

@Entity()
export class session{
	@PrimaryColumn()
	sid: string;
	@Column()
	sess: string;
  @Column({type: "timestamp", precision: 6})
	expire: Date;
}