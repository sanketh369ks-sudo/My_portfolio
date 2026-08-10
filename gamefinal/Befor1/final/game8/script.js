const canvas = document.getElementById('pingPongGame');
const context = canvas.getContext('2d');

let paddleHeight = 100;
let paddleWidth = 10;
let ballRadius = 10;

let leftPaddleY = (canvas.height - paddleHeight) / 2;
let rightPaddleY = (canvas.height - paddleHeight) / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 5;
let ballSpeedY = 5;

let leftScore = 0;
let rightScore = 0;

function drawPaddles() {
    context.fillStyle = '#000';
    // Left Paddle
    context.fillRect(0, leftPaddleY, paddleWidth, paddleHeight);
    // Right Paddle
    context.fillRect(canvas.width - paddleWidth, rightPaddleY, paddleWidth, paddleHeight);
}

function drawBall() {
    context.fillStyle = '#FF0000';
    context.beginPath();
    context.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    context.fill();
}

function drawScore() {
    context.fillStyle = '#000';
    context.font = '24px Arial';
    context.fillText(`Player 1: ${leftScore}`, 50, 30);
    context.fillText(`Player 2: ${rightScore}`, canvas.width - 150, 30);
}

function update() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Bounce off top and bottom walls
    if (ballY + ballRadius > canvas.height || ballY - ballRadius < 0) {
        ballSpeedY = -ballSpeedY;
    }

    // Bounce off paddles
    if (
        (ballX - ballRadius < paddleWidth && ballY > leftPaddleY && ballY < leftPaddleY + paddleHeight) ||
        (ballX + ballRadius > canvas.width - paddleWidth && ballY > rightPaddleY && ballY < rightPaddleY + paddleHeight)
    ) {
        ballSpeedX = -ballSpeedX;
    }

    // Reset ball if it goes out of bounds
    if (ballX - ballRadius < 0) {
        rightScore++;
        resetBall();
    }
    if (ballX + ballRadius > canvas.width) {
        leftScore++;
        resetBall();
    }
}

function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = -ballSpeedX;
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddles();
    drawBall();
    drawScore();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Control left paddle with W and S keys
document.addEventListener('keydown', (event) => {
    if (event.key === 'w' && leftPaddleY > 0) {
        leftPaddleY -= 10;
    }
    if (event.key === 's' && leftPaddleY < canvas.height - paddleHeight) {
        leftPaddleY += 10;
    }
});

// Control right paddle with Up and Down arrow keys
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' && rightPaddleY > 0) {
        rightPaddleY -= 10;
    }
    if (event.key === 'ArrowDown' && rightPaddleY < canvas.height - paddleHeight) {
        rightPaddleY += 10;
    }
});

gameLoop();
