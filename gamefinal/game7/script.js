const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game parameters tuned for smooth, comfortable speed
let bird = { x: 50, y: 150, width: 24, height: 24, gravity: 0.25, lift: -5.5, velocity: 0 };
let pipes = [];
let frame = 0;
let score = 0;
let gameOver = false;
let gameStarted = false;

const pipeWidth = 44;
const pipeGap = 130;
const pipeSpeed = 1.6;

// FPS Throttling variables (prevents hyper-speed on 120Hz/144Hz monitors)
let lastTime = 0;
const fps = 60;
const frameInterval = 1000 / fps;

function setup() {
    // Keyboard listener for Space or ArrowUp
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            handleJump();
        }
    });

    // Mouse click or touch listener
    canvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handleJump();
    });

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleJump();
    }, { passive: false });

    resetGame();
    requestAnimationFrame(gameLoop);
}

function handleJump() {
    if (gameOver) {
        resetGame();
        gameStarted = true;
        bird.velocity = bird.lift;
    } else if (!gameStarted) {
        gameStarted = true;
        bird.velocity = bird.lift;
    } else {
        bird.velocity = bird.lift;
    }
}

function gameLoop(currentTime) {
    requestAnimationFrame(gameLoop);

    // Limit execution to 60 FPS max
    if (!lastTime) lastTime = currentTime;
    const elapsed = currentTime - lastTime;

    if (elapsed < frameInterval) {
        return;
    }
    lastTime = currentTime - (elapsed % frameInterval);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameStarted && !gameOver) {
        frame++;

        // Bird physics
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        // Pipe generation (every ~2 seconds at 60 FPS)
        if (frame % 110 === 0) {
            const minPipeHeight = 40;
            const maxPipeHeight = canvas.height - pipeGap - minPipeHeight;
            const pipeHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;

            pipes.push({
                x: canvas.width,
                y: 0,
                height: pipeHeight,
                scored: false,
                isTop: true
            });
            pipes.push({
                x: canvas.width,
                y: pipeHeight + pipeGap,
                height: canvas.height - (pipeHeight + pipeGap),
                scored: false,
                isTop: false
            });
        }

        // Update pipes and check collisions
        for (let i = 0; i < pipes.length; i++) {
            let pipe = pipes[i];
            pipe.x -= pipeSpeed;

            // Collision detection
            if (
                bird.x < pipe.x + pipeWidth &&
                bird.x + bird.width > pipe.x &&
                bird.y < pipe.y + pipe.height &&
                bird.y + bird.height > pipe.y
            ) {
                gameOver = true;
            }

            // Score counting (only count top pipe once per pipe pair)
            if (pipe.isTop && pipe.x + pipeWidth < bird.x && !pipe.scored) {
                score++;
                pipe.scored = true;
            }
        }

        // Remove off-screen pipes
        pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

        // Canvas boundary collision
        if (bird.y + bird.height >= canvas.height || bird.y <= 0) {
            gameOver = true;
        }
    }

    // --- DRAWING ---

    // Draw background gradient (sky to horizon)
    let bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, '#70c5ce');
    bgGrad.addColorStop(1, '#b4e4eb');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pipes
    pipes.forEach(pipe => {
        // Main pipe body
        let pipeGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
        pipeGrad.addColorStop(0, '#73bf2e');
        pipeGrad.addColorStop(0.5, '#9ce659');
        pipeGrad.addColorStop(1, '#558022');

        ctx.fillStyle = pipeGrad;
        ctx.fillRect(pipe.x, pipe.y, pipeWidth, pipe.height);

        ctx.strokeStyle = '#2d470f';
        ctx.lineWidth = 2;
        ctx.strokeRect(pipe.x, pipe.y, pipeWidth, pipe.height);

        // Pipe rim/cap
        ctx.fillStyle = '#83d338';
        if (pipe.isTop) {
            ctx.fillRect(pipe.x - 3, pipe.height - 14, pipeWidth + 6, 14);
            ctx.strokeRect(pipe.x - 3, pipe.height - 14, pipeWidth + 6, 14);
        } else {
            ctx.fillRect(pipe.x - 3, pipe.y, pipeWidth + 6, 14);
            ctx.strokeRect(pipe.x - 3, pipe.y, pipeWidth + 6, 14);
        }
    });

    // Draw bird with rotation animation
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    let angle = Math.min(Math.max(bird.velocity * 4, -25), 70) * (Math.PI / 180);
    ctx.rotate(angle);

    // Bird body
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.arc(0, 0, bird.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d7a100';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Bird wing
    ctx.fillStyle = '#fbc02d';
    ctx.beginPath();
    ctx.ellipse(-4, 2, 6, 4, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bird eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(4, -4, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(5.5, -4, 2, 0, Math.PI * 2);
    ctx.fill();

    // Bird beak
    ctx.fillStyle = '#ff5722';
    ctx.beginPath();
    ctx.moveTo(8, -1);
    ctx.lineTo(14, 2);
    ctx.lineTo(8, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Draw Score
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';

    ctx.strokeText(`Score: ${score}`, canvas.width / 2, 38);
    ctx.fillText(`Score: ${score}`, canvas.width / 2, 38);

    // Overlay screens
    if (!gameStarted) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;

        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.strokeText('Press SPACE or Click', canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillText('Press SPACE or Click', canvas.width / 2, canvas.height / 2 - 10);

        ctx.font = '16px Arial, sans-serif';
        ctx.strokeText('to Jump & Start', canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('to Jump & Start', canvas.width / 2, canvas.height / 2 + 20);
    } else if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#ff5252';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.font = 'bold 28px Arial, sans-serif';
        ctx.strokeText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);

        ctx.fillStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.font = 'bold 18px Arial, sans-serif';
        ctx.strokeText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);

        ctx.font = '14px Arial, sans-serif';
        ctx.strokeText('Press SPACE or Click to Restart', canvas.width / 2, canvas.height / 2 + 45);
        ctx.fillText('Press SPACE or Click to Restart', canvas.width / 2, canvas.height / 2 + 45);
    }
}

function resetGame() {
    bird.y = canvas.height / 2 - 12;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    frame = 0;
    gameOver = false;
}

setup();

