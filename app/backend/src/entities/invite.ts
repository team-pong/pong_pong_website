import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Invite{
	@PrimaryGeneratedColumn()
	id: number;
	@Column()
	from: string;
	@Column()
	to: string;
  @Column()
  channel_id: number;
}