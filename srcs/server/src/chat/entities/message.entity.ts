import { Field } from '@nestjs/graphql'
import { Entity, CreateDateColumn, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm'
import { Room } from './room.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Message { 
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: true})
    content : String;

    @OneToOne(() => User, user => user.id, {createForeignKeyConstraints: false})
    @JoinColumn()
    author : User

    @CreateDateColumn({ type: 'timestamptz'})
	sendAt: string | Date;

    @ManyToOne(() => Room, room => room.message)
    room: Room;
}