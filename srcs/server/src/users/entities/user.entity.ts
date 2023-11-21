import { Field } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable} from 'typeorm';
import { Game } from 'src/game/entities/game-entity';

@Entity()
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column({type: 'int', unique: true})
	ftId: number

	@Column({type: 'varchar',length: 20, nullable: true})
	@Field(() => String, {})
	username: string

	@Column({type: 'varchar', nullable: true})
	@Field(() => String, {})
	refreshToken: string

	@Column({type: 'boolean', default: false})
	@Field(() => String, {})
	isRegistered: boolean

	@Column({type : 'int', default : 0, nullable: true})
	winsAmount : number

	@Column({type : 'int', default : 0, nullable: true})
	loosesAmount : number

    @ManyToMany(() => Game)
	@JoinTable()
	playedGames : Game[];
}