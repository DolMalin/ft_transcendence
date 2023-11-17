import { Field } from '@nestjs/graphql'
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm'
import { Message } from './message.entity';

@Entity()
export class Room { 
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: String, nullable: true})
    @Field(() => String, {})
    name: string

    @Column({type: String, nullable: true})
    @Field(() => String, {})
    password: string

    @ManyToOne(() => User, user => user.room)
    user: User

    @OneToMany(() => Message, message => message.room, {onDelete:'CASCADE'})
    message: Message[]


}