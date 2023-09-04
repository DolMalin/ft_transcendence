import Phaser from 'phaser'

/**
 * @description saucisse
 */
type Dim = {
    width : number,
    height : number
};

type Pos = {
    x : number,
    y : number
};

class Player {
    paddle  : Phaser.Physics.Arcade.Image
    PowerUp : [{}]
    score   : number
    scene : Phaser.Scene
    cursor : Phaser.Types.Input.Keyboard.CursorKeys;

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
            this.paddle.setVelocityY(200)
        }
        else if (this.cursor.up.isDown && !this.cursor.down.isDown)
            this.paddle.setVelocityY(-200)
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

    constructor(ballSprite : Phaser.Physics.Arcade.Sprite, bounce : number, sceneDim : Dim, startPos : Pos) {
        super();
        this.type = 'vanilla';
        this.pos = startPos;
        this.obj = ballSprite;
        this.dim = sceneDim;
        
        // let {width, height} = this.sys.game.canvas;

        this.obj.setMaxVelocity(sceneDim.width, sceneDim.height);
        this.obj.setBounce(bounce);
        this.obj.setVelocity(Math.random() * sceneDim.height / 1.8, Math.random() * sceneDim.height / 1.8);
        this.obj.setCollideWorldBounds(true)
    }
    update(time: number, delta: number): number {
        if (this.obj.y < 12.5)
        {
            console.log("y :", this.obj.y, 'x :', this.obj.x )
            this.obj.setPosition(this.dim.width / 2, this.dim.height / 2)
            this.obj.setVelocity(Math.random() * this.dim.height / 1.8, Math.random() * this.dim.height / 1.8);
            return (2);
        }
        if (this.obj.y > this.dim.height - 12.5)
        {
            console.log("y :", this.obj.y, 'x :', this.obj.x )
            this.obj.setPosition(this.dim.width / 2, this.dim.height / 2)
            this.obj.setVelocity(Math.random() * this.dim.height / 1.8, Math.random() * this.dim.height / 1.8);
            return (1);
        }
        return(0);
    }
    // reset () {
    //     let {width, height} = this.sys.game.canvas;
    //     this.type = 'vanilla';
    //     this.pos = {x : width / 2, y : height / 2};
    // }
}

class MainScene extends Phaser.Scene {
    constructor() {
        super ('MainScene')
    }

    ball :  Ball;
    paddle : Phaser.Physics.Arcade.Image[];
    cursor : Phaser.Types.Input.Keyboard.CursorKeys;
    firstHalfReached : boolean;
    player1 : Player;
    player2 : Player;

    preload() {
        this.load.image('ball', 'ball.png')
        this.load.image('paddle', 'testPaddle.png')
    }
    create ()
    {
        let {width, height} = this.sys.game.canvas;
        this.ball = new Ball(this.physics.add.sprite(width / 2, height / 2, 'ball').setScale(0.5), 2, {width, height}, {x : width / 2, y : height / 2})

        // this.paddle = [this.physics.add.image(width / 2, 50, 'paddle'),
        // this.physics.add.image(width / 2, height - 50, 'paddle')]

        this.player1 = new Player(this.physics.add.image(width / 2, 50, 'paddle'), this);
        this.player2 = new Player(this.physics.add.image(width / 2, height - 50, 'paddle'), this);

        this.cursor = this.input.keyboard.createCursorKeys();
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
                console.log('player1 : ', this.player1.score, 'player2 : ', this.player2.score);
                break;
            case 2 :
                this.player2.score ++;
                console.log('player1 : ', this.player1.score, 'player2 : ', this.player2.score);
                break;
            default:
                break;
        }
        if (this.cursor.space.isDown)
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