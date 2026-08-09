const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const startOverlay = document.getElementById('startOverlay');
const finalScoreDisplay = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const startBtn = document.getElementById('startBtn');

// Touch D-Pad elements
const btnUp = document.getElementById('btnUp');
const btnDown = document.getElementById('btnDown');
const btnLeft = document.getElementById('btnLeft');
const btnRight = document.getElementById('btnRight');
const btnPause = document.getElementById('btnPause');
const canvasWrapper = document.querySelector('.canvas-wrapper');

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

// Touch tracking
let touchStartX = 0;
let touchStartY = 0;

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

// Direction change handler used by all input methods
function changeDirection(dir) {
    if (!gameStarted) startGame();
    if (dir === 'UP' && direction.y === 0) nextDirection = { x: 0, y: -1 };
    if (dir === 'DOWN' && direction.y === 0) nextDirection = { x: 0, y: 1 };
    if (dir === 'LEFT' && direction.x === 0) nextDirection = { x: -1, y: 0 };
    if (dir === 'RIGHT' && direction.x === 0) nextDirection = { x: 1, y: 0 };
}

// Keyboard input handling
document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            changeDirection('UP');
            event.preventDefault();
            break;
        case 'ArrowDown':
        case 'KeyS':
            changeDirection('DOWN');
            event.preventDefault();
            break;
        case 'ArrowLeft':
        case 'KeyA':
            changeDirection('LEFT');
            event.preventDefault();
            break;
        case 'ArrowRight':
        case 'KeyD':
            changeDirection('RIGHT');
            event.preventDefault();
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

// Helper for unified touch/pointer event listening
function attachTouchHandler(element, callback) {
    if (!element) return;
    let handled = false;

    element.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        handled = true;
        if (navigator.vibrate) navigator.vibrate(15);
        callback();
        setTimeout(() => { handled = false; }, 300);
    });

    element.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!handled) {
            handled = true;
            if (navigator.vibrate) navigator.vibrate(15);
            callback();
            setTimeout(() => { handled = false; }, 300);
        }
    }, { passive: false });

    element.addEventListener('click', (e) => {
        e.preventDefault();
        if (!handled) {
            callback();
        }
    });
}

// Touch D-Pad button listeners
attachTouchHandler(btnUp, () => changeDirection('UP'));
attachTouchHandler(btnDown, () => changeDirection('DOWN'));
attachTouchHandler(btnLeft, () => changeDirection('LEFT'));
attachTouchHandler(btnRight, () => changeDirection('RIGHT'));
attachTouchHandler(btnPause, () => {
    if (!gameStarted) startGame();
    else togglePause();
});

attachTouchHandler(startBtn, startGame);
attachTouchHandler(restartBtn, () => {
    init();
    startGame();
});

// Touch Swipe Detection on Canvas Wrapper
if (canvasWrapper) {
    canvasWrapper.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length > 0) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }
        if (!gameStarted) startGame();
    }, { passive: false });

    canvasWrapper.addEventListener('touchmove', (e) => {
        e.preventDefault(); // Prevents mobile page scrolling while swiping
    }, { passive: false });

    canvasWrapper.addEventListener('touchend', (e) => {
        if (!touchStartX || !touchStartY) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        // Minimum swipe distance threshold (15px)
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) > 15) {
                if (diffX > 0) changeDirection('RIGHT');
                else changeDirection('LEFT');
            }
        } else {
            if (Math.abs(diffY) > 15) {
                if (diffY > 0) changeDirection('DOWN');
                else changeDirection('UP');
            }
        }

        touchStartX = 0;
        touchStartY = 0;
    }, { passive: false });
}

// Initialize game on script load
init();


