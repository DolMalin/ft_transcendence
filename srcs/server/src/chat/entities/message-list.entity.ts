import { Field } from '@nestjs/graphql'
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { Room } from './room.entity'

@Entity()
export class Message { 
    @PrimaryGeneratedColumn('uuid')
    id: number

    @Column()
    message: string[]

    @ManyToOne(() => Room, room => room.message, {onDelete: 'CASCADE'})
    room: Room
}