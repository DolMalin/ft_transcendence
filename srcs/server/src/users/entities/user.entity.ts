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

	@JoinColumn({name: 'avatarId'})
	@OneToOne(() => Avatar, {nullable:true})
	avatar: Avatar

	@Column({nullable: true})
	avatarId?: string

	@Column({type : 'text', default : null, array : true, nullable : true})
	gameSockets : string[];
}