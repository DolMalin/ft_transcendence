import { Field } from '@nestjs/graphql';
import { Room } from 'src/chat/entities/room.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany } from 'typeorm';

@Entity()
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column({type: 'int', unique: true})
	ftId: number

	@Column({type: 'varchar', length: 20, nullable: true})
	username: string

	@Column({type: 'varchar', nullable: true})
	refreshToken: string

	@Column({type: 'boolean', default: false})
	isRegistered: boolean

	@ManyToMany(() => Room, room => room.users)
	room: Room[];

	//rel vers user blocked
}