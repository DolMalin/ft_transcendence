import { Field } from '@nestjs/graphql'
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { Message } from './message-list.entity';

@Entity()
export class Room { 
    @PrimaryGeneratedColumn('uuid')
    id: number

    @Column({type: String})
    @Field(() => String, {})
    roomName: String;

    @OneToMany(() => Message, message => message.room)
    message: Message[]
}