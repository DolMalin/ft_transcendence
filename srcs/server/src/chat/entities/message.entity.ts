import { Field } from '@nestjs/graphql'
import { Entity, CreateDateColumn, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { Room } from './room.entity';

@Entity()
export class Message { 
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @Field(() => String, {})
    content : string;

    @Column()
    @Field(() => String, {})
    author : string

    @CreateDateColumn({ type: 'timestamptz' })
	send_at: Date;

    @ManyToOne(() => Room, room => room.message)
    room: Room;
}