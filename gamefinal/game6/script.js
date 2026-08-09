const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const startOverlay = document.getElementById('startOverlay');
const finalScoreDisplay = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const startBtn = document.getElementById('startBtn');

const GRID_SIZE = 20;
const TILE_COUNT_X = canvas.width / GRID_SIZE;
const TILE_COUNT_Y = canvas.height / GRID_SIZE;

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 5, y: 5 };
let score = 0;
let highScore = parseInt(localStorage.getItem('snake_high_score')) || 0;
let gameInterval = null;
let isPaused = false;
let gameStarted = false;

// Initialize game state
function init() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    gameStarted = false;
    isPaused = false;
    
    if (gameOverOverlay) gameOverOverlay.classList.add('hidden');
    if (startOverlay) startOverlay.classList.remove('hidden');

    updateScore();
    placeFood();
    draw();
}

function startGame() {
    if (gameInterval) clearInterval(gameInterval);
    if (startOverlay) startOverlay.classList.add('hidden');
    if (gameOverOverlay) gameOverOverlay.classList.add('hidden');
    
    gameStarted = true;
    isPaused = false;
    gameInterval = setInterval(gameLoop, 100);
}

function gameLoop() {
    update();
    draw();
}

function update() {
    // Apply buffered direction
    direction = { ...nextDirection };

    // Compute new head position
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Check wall collision BEFORE modifying snake array
    if (head.x < 0 || head.x >= TILE_COUNT_X || head.y < 0 || head.y >= TILE_COUNT_Y) {
        gameOver();
        return;
    }

    const eatsFood = (head.x === food.x && head.y === food.y);

    // If snake eats food, tail doesn't move; otherwise tail moves away
    const bodyToCheck = eatsFood ? snake : snake.slice(0, -1);
    const selfCollision = bodyToCheck.some(segment => segment.x === head.x && segment.y === head.y);

    if (selfCollision) {
        gameOver();
        return;
    }

    // Move snake head
    snake.unshift(head);

    // Handle food consumption
    if (eatsFood) {
        score++;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snake_high_score', highScore.toString());
        }
        updateScore();
        placeFood();
    } else {
        snake.pop(); // Remove tail
    }
}

function placeFood() {
    let validPosition = false;
    while (!validPosition) {
        food.x = Math.floor(Math.random() * TILE_COUNT_X);
        food.y = Math.floor(Math.random() * TILE_COUNT_Y);
        validPosition = !snake.some(segment => segment.x === food.x && segment.y === food.y);
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw subtle grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = '#ff4757';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff4757';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head
            ctx.fillStyle = '#2ed573';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#2ed573';
        } else {
            // Body
            ctx.fillStyle = '#7bed9f';
            ctx.shadowBlur = 0;
        }

        ctx.fillRect(
            segment.x * GRID_SIZE + 1,
            segment.y * GRID_SIZE + 1,
            GRID_SIZE - 2,
            GRID_SIZE - 2
        );
    });
    ctx.shadowBlur = 0;
}

function updateScore() {
    if (scoreDisplay) scoreDisplay.innerText = `Score: ${score}`;
    if (highScoreDisplay) highScoreDisplay.innerText = `High Score: ${highScore}`;
}

function gameOver() {
    clearInterval(gameInterval);
    gameInterval = null;
    gameStarted = false;
    if (gameOverOverlay) {
        if (finalScoreDisplay) finalScoreDisplay.innerText = score;
        gameOverOverlay.classList.remove('hidden');
    } else {
        alert(`Game Over! Your score: ${score}`);
        init();
    }
}

function togglePause() {
    if (!gameStarted) return;
    if (isPaused) {
        gameInterval = setInterval(gameLoop, 100);
        isPaused = false;
    } else {
        clearInterval(gameInterval);
        gameInterval = null;
        isPaused = true;
    }
}

// Input handling
document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            if (direction.y === 0) nextDirection = { x: 0, y: -1 };
            event.preventDefault();
            if (!gameStarted) startGame();
            break;
        case 'ArrowDown':
        case 'KeyS':
            if (direction.y === 0) nextDirection = { x: 0, y: 1 };
            event.preventDefault();
            if (!gameStarted) startGame();
            break;
        case 'ArrowLeft':
        case 'KeyA':
            if (direction.x === 0) nextDirection = { x: -1, y: 0 };
            event.preventDefault();
            if (!gameStarted) startGame();
            break;
        case 'ArrowRight':
        case 'KeyD':
            if (direction.x === 0) nextDirection = { x: 1, y: 0 };
            event.preventDefault();
            if (!gameStarted) startGame();
            break;
        case 'Space':
            event.preventDefault();
            if (!gameStarted) {
                startGame();
            } else {
                togglePause();
            }
            break;
    }
});

// UI Event Listeners
if (startBtn) {
    startBtn.addEventListener('click', startGame);
}

if (restartBtn) {
    restartBtn.addEventListener('click', () => {
        init();
        startGame();
    });
}

// Initialize game on script load
init();

