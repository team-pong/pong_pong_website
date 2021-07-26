import { Entity, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, Column } from 'typeorm';

@Entity()
export class Friend{
	@PrimaryGeneratedColumn()
	id: number;
	@Column()
	user_id: number;
	@Column()
	friend_id: number;
	@Column()
	status: boolean;
}