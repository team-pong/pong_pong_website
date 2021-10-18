import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class AuthCode{
	@PrimaryColumn()
	user_id: string;
	@Column({default: ''})
	email_code: string;
}