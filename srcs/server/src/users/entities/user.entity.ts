import { Field } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable, JoinColumn, OneToOne} from 'typeorm';
import { Game } from 'src/game/entities/game-entity';
import { Avatar } from './avatar.entity';

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

	@Column({type : 'bool', default: false})
	isInQueue : boolean

	@Column({type : 'bool', default: false})
	isInGame : boolean
	
	@ManyToMany(() => Game)
    @JoinTable()
	playedGames: Game[];

	@JoinColumn({name: 'avatarId'})
	@OneToOne(() => Avatar, {nullable:true})
	avatar: Avatar

	@Column({nullable: true})
	avatarId?: string
}