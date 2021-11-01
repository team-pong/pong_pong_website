import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity()
export class Questions{
	@PrimaryGeneratedColumn()
	question_id: number;
	@Column()
	user_id: string;
	@Column()
	title: string;
	@Column()
	email: string;
	@Column()
	content: string;
	@Column()
	answer: string;
	@CreateDateColumn()
	question_time: Date;
	@CreateDateColumn()
	answer_time: Date;
}