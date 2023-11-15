import { Field } from '@nestjs/graphql'
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { Message } from './message.entity';

@Entity()
export class Room { 
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: String, unique: true})
    @Field(() => String, {})
    name: String;

    @OneToMany(() => Message, message => message.room, {onDelete: 'CASCADE'})
    message: Message[]
}