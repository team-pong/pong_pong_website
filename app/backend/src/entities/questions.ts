import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
}