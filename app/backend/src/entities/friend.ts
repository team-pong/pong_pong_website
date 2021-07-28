import { Entity, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, Column } from 'typeorm';

@Entity()
export class Friend{
	@PrimaryGeneratedColumn()
	id: number;
	@Column()
	user_id: string;
	@Column()
	friend_id: string;
}