import { Entity, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, Column } from 'typeorm';

@Entity()
export class Stat{
	@PrimaryGeneratedColumn()
	id: number;
    @Column()
    user_id: number;
	@Column()
	games: number;
	@Column()
	win_game: number;
    @Column()
    loss_game: number;
    @Column()
    ladder_level: number;
}