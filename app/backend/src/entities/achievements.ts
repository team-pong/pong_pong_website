import { Entity, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, Column } from 'typeorm';

@Entity()
export class Achievements{
	@PrimaryGeneratedColumn()
	id: number;
	@Column()
	user_id: string;
	@Column()
	achievement: string;
}