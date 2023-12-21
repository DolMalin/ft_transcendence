import { Field } from '@nestjs/graphql';
import { Room } from 'src/chat/entities/room.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, JoinColumn, OneToOne, OneToMany} from 'typeorm';
import { Game } from 'src/game/entities/game-entity';
import { Avatar } from './avatar.entity';
import { FriendRequest } from './friendRequest.entity';

@Entity()
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column({type: 'int', unique: true})
	ftId: number

	@Column({type: 'varchar', length: 20, nullable: true, unique: true})
	username: string

	@Column({type: 'varchar', nullable: true})
	refreshToken: string

	@Column({type: 'boolean', default: false})
	@Field(() => Boolean, {})
	isRegistered: boolean

	@Column({type: 'boolean', default: false})
	@Field(() => Boolean, {})
	isLogged: boolean

	@Column({type: 'varchar', nullable:true})
	@Field(() => String, {})
	twoFactorAuthenticationSecret: string

	@Column({type: 'boolean', default: false})
	@Field(() => Boolean, {})
	isTwoFactorAuthenticationEnabled: boolean

	@Column({type: 'boolean', default: false})
	@Field(() => Boolean, {})
	isTwoFactorAuthenticated: boolean

	isFriend: boolean

	@ManyToMany(() => Room, room => room.users)
	room: Room[];

	@ManyToMany(() => User)
	@JoinTable({ name: 'blocked_users' })
	blocked: User[];

	@Column({type : 'int', default : 0, nullable: true})
	winsAmount : number

	@Column({type : 'int', default : 0, nullable: true})
	loosesAmount : number

	@Column({type : 'bool', default: true})
	isAvailable : boolean
	
	@ManyToMany(() => Game)
    @JoinTable({
		name: 'user_history',
		joinColumn : {
			name: 'user_id',
			referencedColumnName : 'id'
		},
		inverseJoinColumn: {
			name: 'game_id',
			referencedColumnName: 'id'
		}
	})
	playedGames?: Game[];

	@OneToMany(() => FriendRequest, (friendRequest: FriendRequest) => friendRequest.creator, {onDelete: 'CASCADE'})
	sentFriendRequests: FriendRequest[]

	@OneToMany(() => FriendRequest, (friendRequest: FriendRequest) => friendRequest.receiver, {onDelete: 'CASCADE'})
	receivedFriendRequests: FriendRequest[]

	@JoinColumn({name: 'avatarId'})
	@OneToOne(() => Avatar, {nullable:true})
	avatar: Avatar
	
	@Column({nullable: true})
	avatarId?: string

	@Column({type : 'text', default : null, array : true, nullable : true})
	gameSockets : string[];
}
