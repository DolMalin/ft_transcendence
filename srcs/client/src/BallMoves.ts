import {
    Ball,
    Paddle,
  } from './interfaces'
  import * as Constants from './const'

export function VerticalCollisionAngle(ball : Ball) {

    // 1/4 of trig circle
    if (ball.angle <= 0.5 * Math.PI)
        ball.angle += Math.PI * 0.5;
    
    // 2/4 of trig circle
    else if (ball.angle <= Math.PI)
        ball.angle -= Math.PI * 0.5;
    
    // 3/4 of trig circle
    else if (ball.angle <= 1.5 * Math.PI)
        ball.angle += Math.PI * 0.5;
    
    // 4/4 of trig circle
    else if (ball.angle <= 2 * Math.PI)
        ball.angle -= Math.PI * 0.5;
}

/**
 * @description 
 * change ball direction angle following a collision with a horizontal paddle
*/
export function HorizontalCollisionsAngle(ball : Ball, paddle : Paddle) {

    const distanceToPaddleCenter = Math.abs(ball.x - (paddle.x + paddle.width / 2))

    // the closer to the Paddle center the closer bounce direction will be to 0 and
    // the farther, the closer bounce direction will be to Math.PI * 0.5

    let bounceDirection = Math.PI * 0.5 * ((distanceToPaddleCenter / ( paddle.width / 2)));

    // following condition keep the ball to go in a 90 degree angle (therefor provoking an hard lock)
    if (bounceDirection > Math.PI * 0.5 * 0.95)
        bounceDirection = 0.95 * Math.PI * 0.5;

    // 1/4 of trig circle
    if (ball.angle <= 0.5 * Math.PI)
        ball.angle = 1.5 * Math.PI + bounceDirection; 

    // 2/4 of trig circle
    else if (ball.angle <= Math.PI)
        ball.angle = 1.5 * Math.PI - bounceDirection;
        
    // 3/4 of trig circle
    else if (ball.angle <= 1.5 * Math.PI)
        ball.angle = Math.PI * 0.5 + bounceDirection;

    // 4/4 of trig circle
    else if (ball.angle <= 2 * Math.PI)
        ball.angle = Math.PI * 0.5 - bounceDirection;
}

/**
 * @description 
 * vX : horizontal velocity of the ball
 * vY : vertical velocity of the ball
 * check for collisions with vertical walls at next ball step
*/
export function willBallCollideWithWall(ball : Ball, vX : number) {
    const futureBallX = ball.x + vX;
    if (futureBallX + ball.size >= 1 || futureBallX - ball.size <= 0)
    {
        futureBallX + ball.size >= 1 ? ball.x = 1 - ball.size - 0.001 : ball.x = 0 + ball.size + 0.001;
        VerticalCollisionAngle(ball);
        return (true);
    }
    return (false);
}
/**
 * @description 
 * vX : horizontal velocity of the ball
 * vY : vertical velocity of the ball
 * check for collisions and overlap with paddleOnes
*/
export function willBallOverlapPaddleOne(ball : Ball, paddle : Paddle,vx : number, vy : number) {

    const futureBallX = ball.x + vx;
    const futureBallY = ball.y + vy;

    // will ball overlap paddleOne (bottom) next step while comming from the left ?
    if (futureBallY + ball.size >= paddle.y && futureBallX + ball.size >= paddle.x 
        && futureBallX + ball.size <= paddle.x + vx)
    {
        ball.x = paddle.x - ball.size;
        VerticalCollisionAngle(ball);
        return (true);
    }
    // will it overlap coming from the right side ?
    else if (futureBallY + ball.size >= paddle.y && futureBallX - ball.size <= paddle.x + paddle.width 
        && futureBallX - ball.size >= paddle.x + paddle.width - vx)
    {
        ball.x = paddle.x + paddle.width + ball.size;
        VerticalCollisionAngle(ball);
        return (true);
    }
    // will ball overlap next step while comming from above ?
    else if (futureBallX - ball.size > paddle.x && futureBallX - ball.size < paddle.x + paddle.width
        || futureBallX + ball.size > paddle.x && futureBallX + ball.size < paddle.x + paddle.width)
        {
        if (futureBallY + ball.size > paddle.y)
        {
            ball.y = paddle.y - ball.size;
            HorizontalCollisionsAngle(ball, paddle);
            return (true);
        }
    }
    // will it overlap coming from the left side ?
    return (false);
}

/**
 * @description 
 * vX : horizontal velocity of the ball
 * vY : vertical velocity of the ball
 * check for collisions and overlaps with paddleTwo
*/
export function willBallOverlapPaddleTwo(ball : Ball, paddle : Paddle,vx : number, vy : number) {

    const futureBallX = ball.x + vx;
    const futureBallY = ball.y + vy;

    // will ball overlap paddleTwo (Top) next step while comming from underneath ?
    // will it overlap coming from the left side ?
    if (futureBallY - ball.size <= paddle.y + paddle.height && futureBallX + ball.size >= paddle.x 
        && futureBallX + ball.size <= paddle.x + vx)
    {
        ball.x = paddle.x - ball.size;
        VerticalCollisionAngle(ball);
        return (true);
    }
    // will it overlap coming from the right side ?
    else if (futureBallY - ball.size <= paddle.y + paddle.height && futureBallX - ball.size <= paddle.x + paddle.width
        && futureBallX - ball.size >= paddle.x + paddle.width - vx)
    {
        ball.x = paddle.x + paddle.width + ball.size;
        VerticalCollisionAngle(ball);
        return (true);
    }
    else if (futureBallX - ball.size > paddle.x && futureBallX - ball.size < paddle.x + paddle.width
        || futureBallX + ball.size > paddle.x && futureBallX + ball.size < paddle.x + paddle.width)
    {
        if (futureBallY - ball.size <= paddle.y + paddle.height)
        {
            ball.y = paddle.y + paddle.height + ball.size;
            HorizontalCollisionsAngle(ball, paddle);
            return (true);
        }
    }
    return (false);
}