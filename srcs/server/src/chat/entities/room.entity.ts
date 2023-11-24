import { Field } from '@nestjs/graphql'
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, ManyToMany, JoinTable, OneToOne } from 'typeorm'
import { Message } from './message.entity';

@Entity()
export class Room { 
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: String, unique: true, nullable: true})
    name: string

    @Column({type: String, nullable: true})
    password: string

    @Column({type: Boolean, nullable: true})
    privChan: boolean

    @ManyToOne(() => User, user => user.id)
    owner: User

    @ManyToMany(() => User, user => user.id)
    @JoinTable()
    administrator: User[]

    @ManyToMany(() => User, user => user.room)
    @JoinTable()
    users: User

    @OneToMany(() => Message, message => message.room/* , {onDelete:'CASCADE'} */)
    message: Message[]
}