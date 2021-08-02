import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Match{
	@PrimaryGeneratedColumn()
	id: number;
	@Column()
	winner_id: string;
	@Column()
	loser_id: string;
	@Column()
	winner_score: number;
	@Column()
	loser_score: number;	
	@Column()
	type: string;
	@Column()
	map: number;
	@CreateDateColumn()
	createdAt: Date;
}