import { Field } from '@nestjs/graphql'
import { Entity, CreateDateColumn, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne } from 'typeorm'
import { Room } from './room.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Message { 
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @Field(() => String, {})
    content : String;

    @OneToOne(() => User, user => user.username)
    author : User

    @CreateDateColumn({ type: 'timestamptz'})
	send_at: string;

    @ManyToOne(() => Room, room => room.message)
    room: Room;
}