import { Entity, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, Column } from 'typeorm';

@Entity()
export class Users{
	@PrimaryColumn()
	user_id: string;
	@Column({unique: true})
	nick: string;
	@Column()
	avatar_url: string;
	@Column({default: 0})
	total_games: number;
	@Column({default: 0})
	win_games: number;
  @Column({default: 0})
  loss_games: number;
  @Column({default: 1000})
  ladder_level: number;
	@Column({default: 'on'})
	status: string;
}