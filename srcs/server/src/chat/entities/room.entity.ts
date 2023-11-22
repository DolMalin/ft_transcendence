import { Field } from '@nestjs/graphql'
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm'
import { Message } from './message.entity';

@Entity()
export class Room { 
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: String, unique: true, nullable: true})
    @Field(() => String, {})
    name: string

    @Column({type: String, nullable: true})
    @Field(() => String, {})
    password: string

    @Column({type: Boolean, nullable: true})
    @Field(() => Boolean, {})
    privChan: boolean

    @Column({type: Boolean, nullable: true})
    @Field(() => Boolean, {})
    owner: boolean

    @Column({type: Boolean, nullable: true})
    @Field(() => Boolean, {})
    administrator: boolean

    @ManyToOne(() => User, user => user.room)
    user: User

    @OneToMany(() => Message, message => message.room, {onDelete:'CASCADE'})
    message: Message[]
}