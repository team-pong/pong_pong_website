import { Entity, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, Column } from 'typeorm';

@Entity()
export class Users{
	@PrimaryGeneratedColumn()
	user_id: number;
	@Column()
	nick: string;
	@Column()
	avatar_url: string;

}