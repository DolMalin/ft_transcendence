import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { FriendRequestStatus } from "./friendRequestStatus.type";

@Entity('')
export class FriendRequest {
	@PrimaryGeneratedColumn()
	id: number

	@ManyToOne( () => User, (user) => user.sentFriendRequests, {onDelete: 'CASCADE'})
	creator: User

	@ManyToOne(() => User, (user) => user.receivedFriendRequests, {onDelete: 'CASCADE'})
	receiver: User

	@Column()
	status: FriendRequestStatus
}