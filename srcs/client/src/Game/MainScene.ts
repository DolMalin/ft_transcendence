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
    score   : number

    private scene : Phaser.Scene
    private cursor : Phaser.Types.Input.Keyboard.CursorKeys;

    constructor(paddleImage : Phaser.Physics.Arcade.Image, sceneRef : Phaser.Scene
        ) {
        this.paddle = paddleImage;
        this.PowerUp = [{}];
        this.score = 0;
        this.scene = sceneRef;

        this.paddle.setCollideWorldBounds(true);

        this.cursor = sceneRef.input.keyboard.createCursorKeys();
    }
    update(time: number, delta: number): void {
        if (this.paddle.getBottomCenter().y >= this.scene.sys.game.canvas.height / 2 && !this.cursor.up.isDown)
            this.paddle.setVelocityY(0)
        else if (this.cursor.down.isDown && !this.cursor.up.isDown)
        {
            this.paddle.setVelocityY(300)
        }
        else if (this.cursor.up.isDown && !this.cursor.down.isDown)
            this.paddle.setVelocityY(-300)
        else if (this.cursor.up.isUp && this.cursor.down.isUp)
            this.paddle.setVelocityY(0)

        if (this.cursor.left.isDown)
            this.paddle.setVelocityX(-(this.scene.sys.game.canvas.width / 2))
        else if (this.cursor.right.isDown)
            this.paddle.setVelocityX((this.scene.sys.game.canvas.width / 2))
        else if (this.cursor.left.isUp && this.cursor.right.isUp)
            this.paddle.setVelocityX(0)
    }
}

class Ball extends Phaser.Scene {
    obj: Phaser.Physics.Arcade.Sprite
    pos: Pos
    type: string
    dim : Dim

    private randomX : number
    private randomY : number

    constructor(ballSprite : Phaser.Physics.Arcade.Sprite, bounce : number, sceneDim : Dim, startPos : Pos, ballType : string) {
        super();
        this.type = ballType;
        this.pos = startPos;
        this.obj = ballSprite;
        this.dim = sceneDim;
        this.randomX = 0;
        
        // let {width, height} = this.sys.game.canvas;

        this.obj.setMaxVelocity(sceneDim.width, sceneDim.height);
        this.obj.setBounce(bounce);

        this.randomX = Math.random();
        this.randomY = Math.random();
        this.randomX < 0.5 ? this.randomX *= -1 : this.randomX *= 1;
        this.randomY < 0.5 ? this.randomY *= -1 : this.randomY *= 1;

        this.obj.setVelocity(this.randomX * sceneDim.height / 1.8, this.randomY * sceneDim.height / 1.8);
        this.obj.setCollideWorldBounds(true)
    }
    update(time: number, delta: number): number {
        
        if (this.obj.y < 12.5)
        {
            this.randomX = Math.random();
            this.randomY = Math.random();
            this.randomX < 0.5 ? this.randomX *= -1 : this.randomX *= 1;
            this.randomY < 0.5 ? this.randomY *= -1 : this.randomY *= 1;
            
            console.log("y :", this.obj.y, 'x :', this.obj.x )
            this.obj.setPosition(this.dim.width / 2, this.dim.height / 2)
            this.obj.setVelocity(this.randomX * this.dim.height / 1.8, this.randomY * this.dim.height / 1.8);
            return (2);
        }
        if (this.obj.y > this.dim.height - 12.5)
        {
            this.randomX = Math.random();
            this.randomY = Math.random();
            this.randomX < 0.5 ? this.randomX *= -1 : this.randomX *= 1;
            this.randomY < 0.5 ? this.randomY *= -1 : this.randomY *= 1;

            console.log("y :", this.obj.y, 'x :', this.obj.x )
            this.obj.setPosition(this.dim.width / 2, this.dim.height / 2)
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

        // this.scores = [this.load.image('1', 'game-assets/1.png'),
        // this.load.image('2', 'game-assets/2.png'),
        // this.load.image('3', 'game-assets/3.png'),
        // this.load.image('4', 'game-assets/4.png'),
        // this.load.image('5', 'game-assets/5.png'),
        // this.load.image('6', 'game-assets/6.png'),
        // this.load.image('7', 'game-assets/7.png'),
        // this.load.image('8', 'game-assets/8.png'),
        // this.load.image('9', 'game-assets/9.png'),
        // this.load.image('win', 'game-assets/win.png')];
    }
    create ()
    {
        let {width, height} = this.sys.game.canvas;
        this.ball = new Ball(this.physics.add.sprite(width / 2, height / 2, 'ball').setScale(0.5), 2, {width, height}, {x : width / 2, y : height / 2}, 'vanilla')

        // this.paddle = [this.physics.add.image(width / 2, 50, 'paddle'),
        // this.physics.add.image(width / 2, height - 50, 'paddle')]

        this.player1 = new Player(this.physics.add.image(width / 2, 50, 'paddle'), this);
        this.player2 = new Player(this.physics.add.image(width / 2, height - 50, 'paddle'), this);

        this.cursor1 = this.input.keyboard.createCursorKeys();
    }
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


            this.scores1.push(this.add.image(width / 2, height / 4, keys[playerScore - 1], 124));
        }
        if (playerId === 2 && playerScore <= 10)
        {
            if (playerScore > 1)
            {
                this.scores2[0].destroy(true);
                this.scores2.shift();
            }
            this.scores2.push(this.add.image(width / 2, (height - (height / 4)), keys[playerScore - 1], 124));
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
                break;
            case 2 :
                this.player2.score ++;
                this.displayScore(2, this.player2.score);
                break;
            default:
                break;
        }
        if (this.cursor1.space.isDown)
        {
            this.scene.pause();
        }
        // if (this.ball.obj.y <= 1)
        // {
        //     console.log("bottom: ",this.ball.obj.y)
        //     this.ball.obj.setPosition(this.sys.game.canvas.width / 2, this.sys.game.canvas.height / 2);
        // }
        // if (this.ball.pos.y < 100)
        // {
        //     this.ball.reset();
        // }
    }
}

export default MainScene