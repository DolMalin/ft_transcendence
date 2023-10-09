import Player from "./Player"
import {Dim, Pos} from './MainScene'

class Ball extends Phaser.Scene {
    obj: Phaser.Physics.Arcade.Sprite
    startingPos: Pos
    type: string
    dim : Dim
    sock : any
    
    private randomX : number
    private randomY : number

    constructor(sock : any, ballSprite : Phaser.Physics.Arcade.Sprite, bounce : number, sceneDim : Dim, startPos : Pos, ballType : string) {
        super();
        this.type = ballType;
        this.startingPos = startPos;
        this.obj = ballSprite;
        this.dim = sceneDim;
        this.randomX = 0;
        this.sock = sock;

        this.obj.setMaxVelocity(sceneDim.width, sceneDim.height);
        this.obj.setBounce(bounce, bounce).setScale(0.5).setDepth(1).setAngularAcceleration(1000).setCircle(this.obj.width / 2);

        this.randomX = Math.random();
        this.randomY = Math.random();
        this.randomX < 0.5 ? this.randomX *= -1 : this.randomX *= 1;
        this.randomY < 0.5 ? this.randomY *= -1 : this.randomY *= 1;

        this.obj.setVelocity(this.randomX * sceneDim.height / 1.5, this.randomY * sceneDim.height / 1.5);
        this.obj.setCollideWorldBounds(true)
    }
    
    update(time: number, delta: number): number {
            if (this.obj.y <= this.obj.height / 2)
            {
                if (this.type === 'temp')
                    return (2);

                this.randomX = Math.random();
                this.randomY = Math.random();
                this.randomX < 0.5 ? this.randomX *= -1 : this.randomX *= 1;
                this.randomY < 0.5 ? this.randomY *= -1 : this.randomY *= 1;
                this.randomY >= 0.90 ? this.randomY -= 0.10 : this.randomY += 0;
                this.randomY <= 0.10 ? this.randomY += 0.10 : this.randomY += 0;
                
                this.obj.setPosition(this.startingPos.x, this.startingPos.y);
                this.obj.setVelocity(this.randomX * (this.dim.height / 1.5), this.randomY * (this.dim.height / 1.5));
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

export default Ball