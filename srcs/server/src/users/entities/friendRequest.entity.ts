import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { FriendRequestStatus } from "./friendRequestStatus.type";

@Entity('')
export class FriendRequest {
	@PrimaryGeneratedColumn()
	id: number

	@ManyToOne( () => User, (user) => user.sentFriendRequests)
	creator: User

	@ManyToOne(() => User, (user) => user.receivedFriendRequests)
	receiver: User

	@Column()
	status: FriendRequestStatus
}