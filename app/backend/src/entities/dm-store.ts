import { Entity, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, Column } from 'typeorm';

@Entity()
export class DmStore{
	@PrimaryGeneratedColumn()
	id: number;
	@Column()
	sender_id: string;
	@Column()
	receiver_id: string;
  @Column()
  content: string;
	@Column()
	time: Date;
}