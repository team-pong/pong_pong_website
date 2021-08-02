import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Ban{
	@PrimaryGeneratedColumn()
	id: number;
	@Column()
	channel_id: number;
	@Column()
	user_id: string;
	@CreateDateColumn()
	createdAt: Date;
}