import { Entity, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, Column } from 'typeorm';

@Entity()
export class ChatUsers{
	@PrimaryColumn()
	user_id: string;
	@Column()
	channel_id: number;
}