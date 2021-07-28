import { Entity, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, Column } from 'typeorm';

@Entity()
export class Users{
	@PrimaryGeneratedColumn()
	id: number;
	@Column()
	sender_id: number;
	@Column()
	receiver_id: number;
    @Column()
    content: string;
	@Column()
	time: Date;
}