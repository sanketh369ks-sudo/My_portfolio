const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let bird = { x: 50, y: 150, width: 20, height: 20, gravity: 0.5, lift: -10, velocity: 0 };
let pipes = [];
let frame = 0;
let score = 0;
const pipeWidth = 20;
const pipeGap = 200;

function setup() {
    document.addEventListener('keydown', () => { bird.velocity = bird.lift; });
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bird physics
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Draw bird
    ctx.fillStyle = 'yellow';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);

    // Pipe generation
    if (frame % 90 === 0) {
        const pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 20)) + 10;
        pipes.push({ x: canvas.width, y: 0, height: pipeHeight });
        pipes.push({ x: canvas.width, y: pipeHeight + pipeGap, height: canvas.height - pipeHeight - pipeGap });
    }

    // Draw pipes
    ctx.fillStyle = 'green';
    pipes.forEach(pipe => {
        pipe.x -= 2; // Move pipes to the left
        ctx.fillRect(pipe.x, pipe.y, pipeWidth, pipe.height);
        
        // Collision detection
        if (bird.x < pipe.x + pipeWidth && bird.x + bird.width > pipe.x &&
            bird.y < pipe.y + pipe.height && bird.y + bird.height > pipe.y) {
            resetGame();
        }

        // Score counting
        if (pipe.x + pipeWidth < bird.x && !pipe.scored) {
            score++;
            pipe.scored = true;
        }
    });

    // Remove off-screen pipes
    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

    // Draw score
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${score}`, 10, 20);

    // Reset game if bird goes off canvas
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        resetGame();
    }

    requestAnimationFrame(gameLoop);
}

function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    frame = 0;
}

setup();
