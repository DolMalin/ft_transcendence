import { Field } from '@nestjs/graphql'
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { Message } from './message.entity';

@Entity()
export class Room { 
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: String, unique: true, nullable: true})
    @Field(() => String, {})
    name: String;

    //onetomany
    // users: User[]

    @OneToMany(() => Message, message => message.room, {onDelete: 'CASCADE'})
    message: Message[]
}