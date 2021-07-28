import { Entity, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, Column } from 'typeorm';

@Entity()
export class Ban{
	@PrimaryGeneratedColumn()
	id: number;
	@Column()
	user_id: string;
	@Column()
	channel_id: number;
}