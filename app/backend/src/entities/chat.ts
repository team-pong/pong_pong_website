import { Entity, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, Column } from 'typeorm';

@Entity()
export class Chat{
	@PrimaryGeneratedColumn()
	channel_id: number;
	@Column()
	title: string;
	@Column()
	owner_id: number;
	@Column()
	type: string;
	@Column()
	passwd: string;
}