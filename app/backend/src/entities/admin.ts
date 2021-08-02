import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Admin{
	@PrimaryColumn()
	user_id: string;
	@Column()
	channel_id: number;
}