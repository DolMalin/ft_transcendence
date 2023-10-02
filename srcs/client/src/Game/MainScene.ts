import { Sleeping } from 'matter';
import Phaser from 'phaser'
import io from 'socket.io-client'
import Player from './Player'
import Ball from './Ball';

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
    cursor1 : Phaser.Types.Input.Keyboard.CursorKeys;
    player1 : Player;
    player2 : Player;
    newGameButton : Phaser.GameObjects.Image;

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
        let {width, height} = this.sys.game.canvas;

        this.player1 = new Player(this.physics.add.sprite(width / 2, 0, 'paddle').setDepth(1), this, 1);
        this.player2 = new Player(this.physics.add.sprite(width / 2, height, 'paddle').setDepth(1), this, 2);

        this.ball = new Ball(this.player1, this.player2, this.physics.add.sprite(width / 2, height / 2, 'ball'), 3, {width, height}, {x : width / 2, y : height / 2}, 'vanilla')

        this.cursor1 = this.input.keyboard.createCursorKeys();
        this.cameras.main.setBackgroundColor(0xbababa);

        let sock = io();
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
        if (playerId === 2 && playerScore <= 10)
        {
            if (playerScore > 1)
                this.scores2.destroy(true);

            this.scores2 = this.add.image(width / 2, (height - (height / 4)), keys[playerScore - 1]);
        }
    }

    update(time: number, delta: number): void {
        this.physics.add.collider(this.player1.paddle, this.ball.obj)
        this.physics.add.collider(this.player2.paddle, this.ball.obj)

        this.player1.update(time, delta);
        this.player2.update(time, delta);

        switch (this.ball.update(time, delta))
        {
            case 0 :
                break;
            case 1 :
                this.player1.score ++;
                this.displayScore(1, this.player1.score);
                this.player1.resetPos()
                this.player2.resetPos()
                break;
            case 2 :
                this.player2.score ++;
                this.displayScore(2, this.player2.score);
                this.player1.resetPos()
                this.player2.resetPos()
                break;
            default:
                break;
        }
        if (this.player1.score >= this.scoreToReach || this.player2.score >= this.scoreToReach)
        {
            this.ball.obj.destroy();
            this.player1.resetPos();
            this.player2.resetPos();

            this.newGameButton = this.add.image(this.sys.game.canvas.width / 2, this.sys.game.canvas.height / 2, 'play').setDepth(2);
            this.newGameButton.setInteractive({userHandCursor : true});
            this.newGameButton.on('pointerdown', () => {this.scene.restart()});
        }
    }
}

export {Pos, Dim, MainScene}