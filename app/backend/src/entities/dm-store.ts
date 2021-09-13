import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

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
	@CreateDateColumn()
	createdAt: Date;
}