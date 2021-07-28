import { Entity, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Match{
	@PrimaryGeneratedColumn()
	id: number;
	@Column()
	winner_id: number;
	@Column()
	loser_id: number;
	@Column()
	type: string;
    @CreateDateColumn()
    createdAt: Date;
	@Column()
	winner_score: number;
	@Column()
	loser_score: number;	
	@Column()
	time: Date;
}