
import Phaser from 'phaser'
import {Pos} from './MainScene.js'

class Player {
    paddle  : Phaser.Physics.Arcade.Sprite
    PowerUp : [{}]
    id : number
    score   : number
    playerInput : Phaser.Input.Keyboard.Key []
    startingPos : Pos;
    isAtStartingPos : boolean;

    private scene : Phaser.Scene
    private cursor : Phaser.Types.Input.Keyboard.CursorKeys

    constructor(paddleImage : Phaser.Physics.Arcade.Sprite, sceneRef : Phaser.Scene, identifier : number
        ) {
        this.paddle = paddleImage;
        this.PowerUp = [{}];
        this.score = 0;
        this.scene = sceneRef;
        this.id = identifier;
        this.isAtStartingPos = true;

        if (this.id === 1)
            this.startingPos = {x : this.scene.sys.game.canvas.width / 2, y : 0}
        else if (this.id === 2)
            this.startingPos = {x : this.scene.sys.game.canvas.width / 2, y : this.scene.sys.game.canvas.height}

        this.paddle.setCollideWorldBounds(true);

        this.cursor = sceneRef.input.keyboard.createCursorKeys();
        if (this.id === 2)
        {
            this.playerInput = [sceneRef.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                sceneRef.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                sceneRef.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                sceneRef.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
                sceneRef.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
            ]
        }
        if (this.id === 1)
        {
            this.playerInput = [sceneRef.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
                sceneRef.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
                sceneRef.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
                sceneRef.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
                sceneRef.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO)
            ]
        }
    }

    /**
    * @description take a guess
    */
    handleMovement()
    {
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

    takeShot(){
        if (this.playerInput[4].isDown && this.id == 1)
        {
        let test : Phaser.Types.Physics.Arcade.ArcadeBodyBounds;
        test = {x : 0, y : 0, bottom : 0, right : 0};
        console.log('before :', this.paddle.body.getBounds(test));
        console.log('after :', this.paddle.body.getBounds(test));

        }
        else 
        {
            this.paddle.setAngle(0);
        }
    }

    update(time: number, delta: number): void {
        this.handleMovement();
        this.takeShot();
        if (JSON.stringify({x : this.paddle.x, y : this.paddle.y}) !== JSON.stringify(this.startingPos))
            this.isAtStartingPos = false;
        else
            this.isAtStartingPos = true;
    }
    resetPos() {
        if (this.id === 1)
        {
            this.paddle.setPosition(this.scene.sys.game.canvas.width / 2, 0 + this.paddle.height / 2)
        }
        if (this.id === 2)
            this.paddle.setPosition(this.scene.sys.game.canvas.width / 2, this.scene.sys.game.canvas.height - (this.paddle.height / 2))
    }
}

export default Player