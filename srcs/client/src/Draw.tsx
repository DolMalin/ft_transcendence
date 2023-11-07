import * as Constants from './const'
import { 
    Paddle,
    Ball,
    } from './interfaces';

export function drawNumbers(context : CanvasRenderingContext2D, color : string,x : number, y : number, size : number, number : number[]) {

    let height = size;
    let width = size / 2;
    let Spacing  = height / 10;
    let rodWidth  = size / 10;
    let HorizontalRodLenght = size / 2;
    let VerticalRodLenght = size / 2 - Spacing * 2;

    if (number === Constants.ONE)
    {
        x += width / 2 + rodWidth / 2;
    }

    context.fillStyle = color;
    number.forEach((value, index) => {
        switch (value)
        {
            case 1 :
                context.fillRect(x + Spacing, y, HorizontalRodLenght, rodWidth)
                break ;

            case 2 :
                context.fillRect(x, y + Spacing, rodWidth, VerticalRodLenght)
                break ;
                
            case 3 :
                context.fillRect(x + width + Spacing, y + Spacing, rodWidth, VerticalRodLenght)
                break ;

            case 4 :
                context.fillRect(x + Spacing, y + height / 2 - Spacing, HorizontalRodLenght, rodWidth)
                break ;

            case 5 :
                context.fillRect(x, y + height / 2, rodWidth, VerticalRodLenght);
                break ;

            case 6 :
                context.fillRect(x + width + Spacing, y + height / 2, rodWidth, VerticalRodLenght);
                break ;

            case 7 :
                context.fillRect(x + Spacing, y + height - Spacing * 2, HorizontalRodLenght, rodWidth);
                break ;

            default :
                break ;
        }
    })
    
    // TO DO : Add triangle edges for a smoother rendering if times is not of the matter
};



export function drawScore(playerScores : number, side : string, color : string, context : CanvasRenderingContext2D ,canvasBounding : DOMRect) {
    
    let numberSize = canvasBounding.width / 5;
    let y : number;
    let x = canvasBounding.width / 2 - numberSize * 0.25;
    
    if (side === "top")
        y = 0.25 * canvasBounding.height - numberSize * 0.5;
    if (side === "bottom")
        y = 0.75 * canvasBounding.height - numberSize * 0.5;

    switch (playerScores) {
        case 0 :
            drawNumbers(context, color, x, y, numberSize, Constants.ZERO);
            break ;
        case 1 :
            drawNumbers(context, color, x, y, numberSize, Constants.ONE);
            break ;
        case 2 :
            drawNumbers(context, color, x, y, numberSize, Constants.TWO);
            break ;
        case 3 :
            drawNumbers(context, color, x, y, numberSize, Constants.THREE);
            break ;
        case 4 :
            drawNumbers(context, color, x, y, numberSize, Constants.FOUR);
            break ;
        case 5 :
            drawNumbers(context, color, x, y, numberSize, Constants.FIVE);
            break ;
        case 6 :
            drawNumbers(context, color, x, y, numberSize, Constants.SIX);
            break ;
        case 7 :
            drawNumbers(context, color, x, y, numberSize, Constants.SEVEN);
            break ;
        case 8 :
            drawNumbers(context, color, x, y, numberSize, Constants.EIGHT);
            break ;
        case 9 :
            drawNumbers(context, color, x, y, numberSize, Constants.NINE);
            break ;
        default :
            break ;
    }
}

export function drawPaddle(context : CanvasRenderingContext2D, canvasBounding : DOMRect, paddle : Paddle) {

    context.fillStyle = Constants.BLUE;
    context.fillRect(paddle.x * canvasBounding.width, paddle.y * canvasBounding.height,
        paddle.width * canvasBounding.width, paddle.height * canvasBounding.height);
}

export function drawAdversaryPaddle(context : CanvasRenderingContext2D, canvasBounding : DOMRect, adversaryPaddle : Paddle) {

    context.fillStyle = Constants.RED;
    context.fillRect(adversaryPaddle.x * canvasBounding.width, adversaryPaddle.y * canvasBounding.height,
        adversaryPaddle.width * canvasBounding.width, adversaryPaddle.height * canvasBounding.height);
}

export function drawBoard(context : CanvasRenderingContext2D, canvasBounding : DOMRect) {

    context.fillStyle = 'black';
    context.fillRect(0, 0, canvasBounding.width, canvasBounding.height);
}

export function drawBall(context : CanvasRenderingContext2D, canvasBounding : DOMRect, ball : Ball) {
    
    context.fillStyle = ball.color;
    context.beginPath();
    context.arc(ball.x * canvasBounding.width, ball.y * canvasBounding.height, canvasBounding.width * ball.size, 0, 2 * Math.PI);
    context.stroke();
    context.fill();
}