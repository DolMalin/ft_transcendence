import { Field } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column({type: 'int', unique: true})
	ftId: number

	@Column({type: 'varchar', length: 20, nullable: true})
	@Field(() => String, {})
	username: string
}