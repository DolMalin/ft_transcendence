import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, JoinTable, ManyToMany } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Game {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'varchar', nullable: true})
    winnerId : string;

    @Column({type: 'varchar', nullable: true})
    winnerUsername : string;

    @Column({type: 'varchar', nullable: true})
    looserId : string;

    @Column({type: 'varchar', nullable: true})
    looserUsername : string;

    @Column({type: 'int', nullable: true})
    winnerScore : number;

    @Column({type: 'int', nullable: true})
    looserScore : number;
}