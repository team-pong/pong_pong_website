import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Achievements{
	@PrimaryGeneratedColumn()
	id: number;
	@Column()
	user_id: string;
	@Column()
	achievement: string;
}