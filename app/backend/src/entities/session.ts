import { Entity, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, Column } from 'typeorm';

@Entity()
export class Session{
	@PrimaryColumn()
	sid: string;
	@Column()
	session: string;
    @Column()
    expire: Date;
}