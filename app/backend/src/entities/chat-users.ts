import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class ChatUsers{
	@PrimaryColumn()
	user_id: string;
	@Column()
	channel_id: number;
}