import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Game {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'varchar', nullable: true})
    date : string;

    @Column({type: 'varchar', nullable: true})
    winnerId : string;

    @Column({type: 'varchar', nullable: true})
    looserId : string;

    @Column({type: 'int', nullable: true})
    winnerScore : number;

    @Column({type: 'int', nullable: true})
    looserScore : number;

    @ManyToMany(() => User)
    @JoinTable()
    players : User[];
}