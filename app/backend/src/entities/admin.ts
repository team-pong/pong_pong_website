import { Entity, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, Column } from 'typeorm';

@Entity()
export class Admin{
	@PrimaryGeneratedColumn()
	id: number;
	@Column()
	channel_id: number;
	@Column()
	user_id: number;
}