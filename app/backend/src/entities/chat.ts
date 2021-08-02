import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Chat{
	@PrimaryGeneratedColumn()
	channel_id: number;
	@Column()
	owner_id: string;
	@Column()
	title: string;
	@Column()
	type: string;
	@Column()
	passwd: string;
	@Column()
	max_people: number;
}