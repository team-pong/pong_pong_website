import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Friend{
	@PrimaryGeneratedColumn()
	id: number;
	@Column()
	user_id: string;
	@Column()
	friend_id: string;
}