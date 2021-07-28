import { Entity, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, Column } from 'typeorm';

@Entity()
export class Users{
	@PrimaryGeneratedColumn()
	user_id: number;
	@Column()
	nick: string;
	@Column()
	avatar_url: string;
	@Column()
	total_games: number;
	@Column()
	win_games: number;
    @Column()
    loss_games: number;
    @Column()
    ladder_level: number;
	@Column()
	status: string;
}