import { Field } from '@nestjs/graphql'
import { Entity, CreateDateColumn, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { Room } from './room.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Message { 
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @Field(() => String, {})
    content : String;

    // @Column()
    // author : User

    @CreateDateColumn({ type: 'timestamptz' })
	send_at: Date;

    @ManyToOne(() => Room, room => room.message)
    room: Room;
}