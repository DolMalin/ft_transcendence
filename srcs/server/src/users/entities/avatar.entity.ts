import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Avatar {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column({type: 'varchar'})
	filename: string

	@Column({type: 'bytea'})
	data: Uint8Array
}