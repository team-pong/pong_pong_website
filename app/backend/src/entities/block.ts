import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Block{
	@PrimaryGeneratedColumn()
  id: number;
  @Column()
	user_id: string;
	@Column()
	block_id: string;
}