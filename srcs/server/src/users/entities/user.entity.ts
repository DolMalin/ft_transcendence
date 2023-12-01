import { Field } from '@nestjs/graphql';
import { Room } from 'src/chat/entities/room.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, JoinColumn, OneToOne} from 'typeorm';
import { Game } from 'src/game/entities/game-entity';
import { Avatar } from './avatar.entity';

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
	@Field(() => Boolean, {})
	isRegistered: boolean

	@Column({type: 'varchar', nullable:true})
	@Field(() => String, {})
	twoFactorAuthenticationSecret: string

	@Column({type: 'boolean', default: false})
	@Field(() => Boolean, {})
	isTwoFactorAuthenticationEnabled: boolean

	@Column({type: 'boolean', default: false})
	@Field(() => Boolean, {})
	isTwoFactorAuthenticated: boolean

	@ManyToMany(() => Room, room => room.users)
	room: Room[];

	//rel vers user blocked
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
	playedGames : Game[];

	@JoinColumn({name: 'avatarId'})
	@OneToOne(() => Avatar, {nullable:true})
	avatar: Avatar

	@Column({nullable: true})
	avatarId?: string
}