import { Entity, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, Column } from 'typeorm';

@Entity()
export class Admin{
	@PrimaryColumn()
	user_id: string;
	@Column({default: 0})
	channel_id: number;
}