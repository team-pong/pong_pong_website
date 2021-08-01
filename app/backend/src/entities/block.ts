import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Block{
	@PrimaryColumn()
  id: number;
  @Column()
	user_id: string;
	@Column()
	block_id: number;
}