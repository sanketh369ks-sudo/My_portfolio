const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

let snake = [{ x: 10, y: 10 }];
let direction = { x: 0, y: 0 };
let food = { x: 5, y: 5 };
let score = 0;
let gameInterval;

// Initialize game
function init() {
    placeFood();
    gameInterval = setInterval(draw, 100);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw food
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * 20, food.y * 20, 20, 20);
    
    // Draw snake
    ctx.fillStyle = 'green';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * 20, segment.y * 20, 20, 20);
    });

    // Move the snake
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    // Check for food collision
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreDisplay.innerText = `Score: ${score}`; // Update score display
        snake.unshift(head);
        placeFood();
    } else {
        snake.unshift(head);
        snake.pop();
    }

    // Check for wall collisions
    if (head.x < 0 || head.x >= canvas.width / 20 || head.y < 0 || head.y >= canvas.height / 20 || checkCollision(head)) {
        clearInterval(gameInterval);
        alert(`Game Over! Your score: ${score}`);
        document.location.reload();
    }
}

function placeFood() {
    food.x = Math.floor(Math.random() * (canvas.width / 20));
    food.y = Math.floor(Math.random() * (canvas.height / 20));
}

function checkCollision(head) {
    return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
}

document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowUp':
            if (direction.y === 0) direction = { x: 0, y: -1 }; break;
        case 'ArrowDown':
            if (direction.y === 0) direction = { x: 0, y: 1 }; break;
        case 'ArrowLeft':
            if (direction.x === 0) direction = { x: -1, y: 0 }; break;
        case 'ArrowRight':
            if (direction.x === 0) direction = { x: 1, y: 0 }; break;
        case 'Space':
            if (gameInterval) {
                clearInterval(gameInterval);
                gameInterval = null;
            } else {
                gameInterval = setInterval(draw, 100);
            }
            break;
    }
});

// Start the game
init();
