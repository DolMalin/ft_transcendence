import { Sleeping } from 'matter';
import Phaser from 'phaser'

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
class Player {
    paddle  : Phaser.Physics.Arcade.Image
    PowerUp : [{}]
    id : number
    score   : number
    playerInput : Phaser.Input.Keyboard.Key []

    private scene : Phaser.Scene
    private cursor : Phaser.Types.Input.Keyboard.CursorKeys;

    constructor(paddleImage : Phaser.Physics.Arcade.Image, sceneRef : Phaser.Scene, identifier : number
        ) {
        this.paddle = paddleImage;
        this.PowerUp = [{}];
        this.score = 0;
        this.scene = sceneRef;
        this.id = identifier;

        this.paddle.setCollideWorldBounds(true);

        this.cursor = sceneRef.input.keyboard.createCursorKeys();
        if (this.id === 2)
        {
            this.playerInput = [sceneRef.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                sceneRef.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                sceneRef.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                sceneRef.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
            ]
        }
        if (this.id === 1)
        {
            this.playerInput = [sceneRef.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
                sceneRef.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
                sceneRef.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
                sceneRef.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
            ]
        }
    }
    update(time: number, delta: number): void {
        if (this.id === 1 && this.paddle.getBottomCenter().y > this.scene.sys.game.canvas.height / 2 - (this.paddle.height / 2) && !this.playerInput[0].isDown)
            this.paddle.setVelocityY(0)
        else if (this.id === 2 && this.paddle.getTopCenter().y < this.scene.sys.game.canvas.height / 2 + (this.paddle.height / 2) && !this.playerInput[2].isDown)
            this.paddle.setVelocityY(0)
        else if (this.playerInput[2].isDown && !this.playerInput[0].isDown)
        {
            this.paddle.setVelocityY(300)
        }
        else if (this.playerInput[0].isDown && !this.playerInput[2].isDown)
            this.paddle.setVelocityY(-300)
        else if (this.playerInput[0].isUp && this.playerInput[2].isUp)
            this.paddle.setVelocityY(0)

        if (this.playerInput[1].isDown)
            this.paddle.setVelocityX(-(this.scene.sys.game.canvas.width / 1.4))
        else if (this.playerInput[3].isDown)
            this.paddle.setVelocityX((this.scene.sys.game.canvas.width / 1.4))
        else if (this.playerInput[1].isUp && this.playerInput[3].isUp)
            this.paddle.setVelocityX(0)
    }
    resetPos() {
        if (this.id === 1)
        {
            let dirX = this.paddle.x - this.scene.sys.game.canvas.width;
            let dirY = 0 - this.paddle.y;
            this.paddle.setVelocity(dirX, dirY)
        }
        if (this.id === 2)
            this.paddle.setPosition(this.scene.sys.game.canvas.width / 2, this.scene.sys.game.canvas.height - (this.paddle.height / 2))
    }
}

class Ball extends Phaser.Scene {
    obj: Phaser.Physics.Arcade.Sprite
    startingPos: Pos
    type: string
    dim : Dim
    
    private sceneRef : Phaser.Scene
    private randomX : number
    private randomY : number

    constructor(scene : Phaser.Scene, ballSprite : Phaser.Physics.Arcade.Sprite, bounce : number, sceneDim : Dim, startPos : Pos, ballType : string) {
        super();
        this.sceneRef = scene;
        this.type = ballType;
        this.startingPos = startPos;
        this.obj = ballSprite;
        this.dim = sceneDim;
        this.randomX = 0;
        
        // let {width, height} = this.sys.game.canvas;

        this.obj.setMaxVelocity(sceneDim.width, sceneDim.height);
        this.obj.setBounce(bounce, bounce).setScale(0.5).setDepth(1).setAngularAcceleration(1000).setCircle(this.obj.width / 2);

        this.randomX = Math.random();
        this.randomY = Math.random();
        this.randomX < 0.5 ? this.randomX *= -1 : this.randomX *= 1;
        this.randomY < 0.5 ? this.randomY *= -1 : this.randomY *= 1;

        this.obj.setVelocity(this.randomX * sceneDim.height / 1.8, this.randomY * sceneDim.height / 1.8);
        this.obj.setCollideWorldBounds(true)
    }
    sleep = (ms : number) => new Promise(r => setTimeout(r, ms));
    update(time: number, delta: number): number {
        
        if (this.obj.y <= this.obj.height / 2)
        {
            if (this.type === 'temp')
                return (2);
            this.randomX = Math.random();
            this.randomY = Math.random();
            this.randomX < 0.5 ? this.randomX *= -1 : this.randomX *= 1;
            this.randomY < 0.5 ? this.randomY *= -1 : this.randomY *= 1;
            this.randomY > 0.95 ? this.randomY -= 0.10 : this.randomY += 0;
            this.randomY < 0.05 ? this.randomY += 0.10 : this.randomY += 0;
            
            this.obj.setPosition(this.startingPos.x, this.startingPos.y);
            this.obj.setVelocity(this.randomX * this.dim.height / 1.8, this.randomY * this.dim.height / 1.8);
            return (2);
        }
        if (this.obj.y >= this.dim.height - this.obj.height / 2)
        {
            if (this.type === 'temp')
                return (1);
            this.randomX = Math.random();
            this.randomY = Math.random();
            this.randomX < 0.5 ? this.randomX *= -1 : this.randomX *= 1;
            this.randomY < 0.5 ? this.randomY *= -1 : this.randomY *= 1;
            this.randomY > 0.95 ? this.randomY -= 0.10 : this.randomY += 0;
            this.randomY < 0.05 ? this.randomY += 0.10 : this.randomY += 0;

            this.obj.setPosition(this.startingPos.x, this.startingPos.y);
            this.obj.setVelocity(this.randomX * this.dim.height / 1.8, this.randomY * this.dim.height / 1.8);
            return (1);
        }
        return(0);
    }
}

class MainScene extends Phaser.Scene {
    constructor() {
        super ('MainScene')
    }

    ball :  Ball;
    scores1 : Phaser.GameObjects.Image[] = [];
    scores2 : Phaser.GameObjects.Image[] = [];
    cursor1 : Phaser.Types.Input.Keyboard.CursorKeys;
    player1 : Player;
    player2 : Player;

    preload() {
        this.load.image('ball', 'game-assets/ball.png');
        this.load.image('paddle', 'game-assets/testPaddle.png');
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
        this.ball = new Ball(this, this.physics.add.sprite(width / 2, height / 2, 'ball'), 3, {width, height}, {x : width / 2, y : height / 2}, 'vanilla')

        this.player1 = new Player(this.physics.add.image(width / 2, 0, 'paddle').setDepth(1), this, 1);
        this.player2 = new Player(this.physics.add.image(width / 2, height, 'paddle').setDepth(1), this, 2);

        this.cursor1 = this.input.keyboard.createCursorKeys();
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
            {
                this.scores1[0].destroy(true);
                this.scores1.shift();
            }


            this.scores1.push(this.add.image(width / 2, height / 4, keys[playerScore - 1]));
        }
        if (playerId === 2 && playerScore <= 10)
        {
            if (playerScore > 1)
            {
                this.scores2[0].destroy(true);
                this.scores2.shift();
            }
            this.scores2.push(this.add.image(width / 2, (height - (height / 4)), keys[playerScore - 1]));
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
        if (this.player1.score >= 10 || this.player2.score >= 10)
        {
            this.scene.pause();
        }
    }
}

export default MainScene