import { Sleeping } from 'matter';
import Phaser from 'phaser'
import io from 'socket.io-client'
import Player from './Player'
import Ball from './Ball';
import { Socket } from 'socket.io';


/**
 * @description a wdith and a height
 */
type Dim = {
    width : number,
    height : number
};

/**
 * @description a x and a y
 */
type Pos = {
    x : number,
    y : number
};

/**
 * @description class containing :
 * - paddle image
 * - power ups
 * - score
 */

class MainScene extends Phaser.Scene {
    constructor() {
        super ('MainScene')
    }

    ball :  Ball;
    scores1 : Phaser.GameObjects.Image;
    scores2 : Phaser.GameObjects.Image;
    scoreToReach : number = 10;
    player : Player;
    adversaryPaddle : Phaser.GameObjects.Image;
    id : number;
    newGameButton : Phaser.GameObjects.Image;
    sock : any;

    preload() {
        this.load.image('ball', 'game-assets/ball.png');
        this.load.image('paddle', 'game-assets/testPaddle.png');
        this.load.image('play', 'game-assets/play.png');
        this.load.image('1', 'game-assets/1.png');
        this.load.image('2', 'game-assets/2.png');
        this.load.image('3', 'game-assets/3.png');
        this.load.image('4', 'game-assets/4.png');
        this.load.image('5', 'game-assets/5.png');
        this.load.image('6', 'game-assets/6.png');
        this.load.image('7', 'game-assets/7.png');
        this.load.image('8', 'game-assets/8.png');
        this.load.image('9', 'game-assets/9.png');
        this.load.image('10', 'game-assets/win.png');
    }
    create ()
    {
        this.sock =  io('http://localhost:4545');

        let {width, height} = this.sys.game.canvas;

        this.sock.once('playerId', (playerId : number) => {
            this.id = playerId;
            console.log('player id: ' + this.id)
            if (this.id === 1)
            {
                console.log('test 1');
                this.player = new Player(this.physics.add.sprite(width / 2, 0, 'paddle').setDepth(1), this, 1);
                this.adversaryPaddle = this.physics.add.sprite(width / 2, height - this.player.paddle.height / 2, 'paddle')
            }
            else if (this.id === 2)
            {
                console.log('test 2');

                this.player = new Player(this.physics.add.sprite(width / 2, height, 'paddle').setDepth(1), this, 2);
                this.adversaryPaddle = this.physics.add.sprite(width / 2, 0, 'paddle')
            }
        });

        this.ball = new Ball(this.sock, this.physics.add.sprite(width / 2, height / 2, 'ball'), 3, {width, height}, {x : width / 2, y : height / 2}, 'vanilla')

        this.cameras.main.setBackgroundColor(0xbababa);
    }
    /**
     * @description :
     * display score to screen and destroy old score display
     */
    displayScore(playerId : number, playerScore : number) {
        const keys = this.textures.getTextureKeys().filter((key) => !Number.isNaN(key));

        let {width, height} = this.sys.game.canvas;

        if (playerId === 1 && playerScore <= 10)
        {
            if (playerScore > 1)
                this.scores1.destroy(true);

            this.scores1 = this.add.image(width / 2, height / 4, keys[playerScore - 1]);
        }
        else if (playerId === 2 && playerScore <= 10)
        {
            if (playerScore > 1)
                this.scores2.destroy(true);

            this.scores2 = this.add.image(width / 2, (height - (height / 4)), keys[playerScore - 1]);
        }
    }

    update(time: number, delta: number): void {
        if (this.id === undefined)
            return;

        this.physics.add.collider(this.player.paddle, this.ball.obj)
        this.physics.add.collider(this.adversaryPaddle, this.ball.obj)

        this.player.update(time, delta);
        this.sock.emit('playerMove', {x : this.player.paddle.x, y : this.player.paddle.y, playerId : this.id})
        this.sock.on('playerMove', (data : any) => {
            // console.log('x: ' +data.x, 'y: ' +data.y)
            if(this.id === 1 && data.playerId === 2)
                this.adversaryPaddle.setPosition(data.x, data.y)
            else if (this.id === 2 && data.playerId === 1)
                this.adversaryPaddle.setPosition(data.x, data.y)
            
        })
        this.sock.emit('ballMove', {x : this.ball.obj.x, y : this.ball.obj.y, playerId : this.id});
        this.sock.on('ballMove', (data : any) => {
        if(this.id === 1 && data.playerId === 2)    
            this.ball.obj.setPosition(data.x, data.y);
        else if (this.id === 2 && data.playerId === 1)
            this.ball.obj.setPosition(data.x, data.y);
        })

        switch (this.ball.update(time, delta))
        {
            case 0 :
                break;
            case 1 :
                this.player.score ++;
                this.displayScore(1, this.player.score);
                // this.player.resetPos()
                break;
            default:
                break;
        }
        if (this.player.score >= this.scoreToReach)
        {
            this.ball.obj.destroy();
            // this.player.resetPos();

            this.newGameButton = this.add.image(this.sys.game.canvas.width / 2, this.sys.game.canvas.height / 2, 'play').setDepth(2);
            this.newGameButton.setInteractive({userHandCursor : true});
            this.newGameButton.on('pointerdown', () => {this.scene.restart()});
        }
    }
}

export {Pos, Dim, MainScene}