const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ensure roundRect compatibility
if (!ctx.roundRect) {
    ctx.roundRect = function(x, y, w, h, r) {
        let radius = typeof r === 'number' ? r : (r[0] || 0);
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + w - radius, y);
        this.quadraticCurveTo(x + w, y, x + w, y + radius);
        this.lineTo(x + w, y + h - radius);
        this.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        this.lineTo(x + radius, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
    };
}

// Fixed logical dimensions for crisp high-DPI scaling
const canvasWidth = 320;
const canvasHeight = 480;
let dpr = 1;

function adjustDPI() {
    dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
}

adjustDPI();
window.addEventListener('resize', adjustDPI);

// Game parameters tuned for smooth, comfortable speed
let bird = { x: 50, y: 150, width: 24, height: 24, gravity: 0.25, lift: -5.5, velocity: 0, wingAngle: 0 };
let pipes = [];
let frame = 0;
let score = 0;
let highScore = parseInt(localStorage.getItem('flappy_nature_highscore')) || 0;
let gameOver = false;
let gameStarted = false;

const pipeWidth = 44;
const pipeGap = 130;
const pipeSpeed = 1.6;
const groundHeight = 36;
const groundY = canvasHeight - groundHeight;

// FPS Throttling variables (prevents hyper-speed on 120Hz/144Hz monitors)
let lastTime = 0;
const fps = 60;
const frameInterval = 1000 / fps;

// Parallax nature background scroll positions
let bgOffsetFar = 0;
let bgOffsetMid = 0;
let bgOffsetNear = 0;

// Nature elements: Clouds & Drifting Leaves
let clouds = [
    { x: 20, y: 45, scale: 0.8, speed: 0.15 },
    { x: 140, y: 75, scale: 1.1, speed: 0.2 },
    { x: 260, y: 30, scale: 0.7, speed: 0.12 }
];

let particles = [];
function initParticles() {
    particles = [];
    for (let i = 0; i < 14; i++) {
        particles.push({
            x: Math.random() * canvasWidth,
            y: Math.random() * (groundY - 20),
            size: Math.random() * 3 + 2,
            speedX: Math.random() * 0.4 + 0.3,
            speedY: Math.random() * 0.3 + 0.1,
            oscillation: Math.random() * Math.PI * 2,
            oscSpeed: Math.random() * 0.03 + 0.01,
            color: Math.random() > 0.4 ? '#8dc63f' : (Math.random() > 0.5 ? '#ffb7c5' : '#7cb342')
        });
    }
}

function setup() {
    // Keyboard listener for Space, ArrowUp, or Enter key
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter' || e.code === 'NumpadEnter' || e.key === 'Enter') {
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

    initParticles();
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

    // Apply device pixel ratio transformation for ultra-sharp rendering
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (gameStarted && !gameOver) {
        frame++;

        // Update Parallax Offsets
        bgOffsetFar = (bgOffsetFar + 0.2) % canvasWidth;
        bgOffsetMid = (bgOffsetMid + 0.6) % canvasWidth;
        bgOffsetNear = (bgOffsetNear + pipeSpeed) % canvasWidth;

        // Bird physics
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        bird.wingAngle += 0.25;

        // Pipe generation (every ~2 seconds at 60 FPS)
        if (frame % 110 === 0) {
            const minPipeHeight = 40;
            const maxPipeHeight = groundY - pipeGap - minPipeHeight;
            const pipeHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;

            pipes.push({
                x: canvasWidth,
                y: 0,
                height: pipeHeight,
                scored: false,
                isTop: true
            });
            pipes.push({
                x: canvasWidth,
                y: pipeHeight + pipeGap,
                height: groundY - (pipeHeight + pipeGap),
                scored: false,
                isTop: false
            });
        }

        // Update pipes and check collisions
        for (let i = 0; i < pipes.length; i++) {
            let pipe = pipes[i];
            pipe.x -= pipeSpeed;

            // Collision detection
            const padding = 2;
            if (
                bird.x + padding < pipe.x + pipeWidth &&
                bird.x + bird.width - padding > pipe.x &&
                bird.y + padding < pipe.y + pipe.height &&
                bird.y + bird.height - padding > pipe.y
            ) {
                triggerGameOver();
            }

            // Score counting
            if (pipe.isTop && pipe.x + pipeWidth < bird.x && !pipe.scored) {
                score++;
                pipe.scored = true;
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('flappy_nature_highscore', highScore);
                }
            }
        }

        // Remove off-screen pipes
        pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

        // Ground and ceiling collision
        if (bird.y + bird.height >= groundY || bird.y <= 0) {
            triggerGameOver();
        }
    } else {
        // Gentle wing idle animation on start/over screens
        bird.wingAngle += 0.1;
        // Slow ambient background drift on menu
        bgOffsetFar = (bgOffsetFar + 0.08) % canvasWidth;
        bgOffsetMid = (bgOffsetMid + 0.2) % canvasWidth;
    }

    // Update nature particles
    particles.forEach(p => {
        p.x -= p.speedX;
        p.y += p.speedY + Math.sin(p.oscillation) * 0.3;
        p.oscillation += p.oscSpeed;

        if (p.x < -10) p.x = canvasWidth + 10;
        if (p.y > groundY) p.y = -5;
    });

    // Update clouds
    clouds.forEach(c => {
        c.x -= c.speed;
        if (c.x < -70) c.x = canvasWidth + 50;
    });

    // --- DRAWING NATURE SCENE LAYERS ---
    drawSkyAndSun();
    drawClouds();
    drawDistantMountains();
    drawMidgroundHills();
    drawPipes();
    drawNatureParticles();
    drawGround();
    drawBird();
    drawUI();
}

function triggerGameOver() {
    gameOver = true;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('flappy_nature_highscore', highScore);
    }
}

// --- NATURE GRAPHICS RENDERING FUNCTIONS ---

function drawSkyAndSun() {
    let skyGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    skyGrad.addColorStop(0, '#4a90e2');   
    skyGrad.addColorStop(0.45, '#7bc0ed'); 
    skyGrad.addColorStop(0.75, '#bfe3f7'); 
    skyGrad.addColorStop(1.0, '#eaf7e3');  
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const sunX = 250;
    const sunY = 70;
    
    let auraGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 55);
    auraGrad.addColorStop(0, 'rgba(255, 245, 200, 0.8)');
    auraGrad.addColorStop(0.5, 'rgba(255, 220, 130, 0.35)');
    auraGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 55, 0, Math.PI * 2);
    ctx.fill();

    let sunGrad = ctx.createRadialGradient(sunX - 4, sunY - 4, 2, sunX, sunY, 18);
    sunGrad.addColorStop(0, '#ffffff');
    sunGrad.addColorStop(0.3, '#fff3a8');
    sunGrad.addColorStop(1, '#ffc845');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 18, 0, Math.PI * 2);
    ctx.fill();
}

function drawClouds() {
    clouds.forEach(c => {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
        let x = c.x;
        let y = c.y;
        let s = c.scale;

        ctx.beginPath();
        ctx.arc(x, y, 16 * s, Math.PI * 0.5, Math.PI * 1.5);
        ctx.arc(x + 16 * s, y - 12 * s, 18 * s, Math.PI * 1.0, Math.PI * 1.85);
        ctx.arc(x + 36 * s, y - 10 * s, 15 * s, Math.PI * 1.3, Math.PI * 1.9);
        ctx.arc(x + 48 * s, y, 14 * s, Math.PI * 1.5, Math.PI * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(180, 210, 230, 0.3)';
        ctx.beginPath();
        ctx.ellipse(x + 24 * s, y + 4 * s, 26 * s, 6 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    });
}

function drawDistantMountains() {
    ctx.fillStyle = '#6589a6';
    ctx.beginPath();

    const mountainPoints = [
        [0, 290], [40, 240], [90, 310], [140, 220], [190, 285],
        [240, 210], [300, 300], [360, 230], [410, 295], [460, 250]
    ];

    let shift = bgOffsetFar;
    ctx.moveTo(-50, groundY);

    for (let i = 0; i < 3; i++) {
        let offsetX = i * 360 - shift;
        mountainPoints.forEach((pt, idx) => {
            let px = pt[0] + offsetX;
            let py = pt[1];
            ctx.lineTo(px, py);
        });
    }

    ctx.lineTo(canvasWidth + 100, groundY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(245, 250, 255, 0.7)';
    for (let i = 0; i < 3; i++) {
        let offsetX = i * 360 - shift;
        let p1x = 140 + offsetX;
        ctx.beginPath();
        ctx.moveTo(p1x, 220);
        ctx.lineTo(p1x - 14, 245);
        ctx.lineTo(p1x + 14, 245);
        ctx.closePath();
        ctx.fill();

        let p2x = 240 + offsetX;
        ctx.beginPath();
        ctx.moveTo(p2x, 210);
        ctx.lineTo(p2x - 16, 238);
        ctx.lineTo(p2x + 16, 238);
        ctx.closePath();
        ctx.fill();
    }
}

function drawMidgroundHills() {
    let shift = bgOffsetMid;

    ctx.fillStyle = '#56a347';
    ctx.beginPath();
    ctx.moveTo(-20, groundY);

    for (let x = -50; x <= canvasWidth + 100; x += 10) {
        let realX = x + shift;
        let hillY = groundY - 70 + Math.sin(realX * 0.015) * 22 + Math.cos(realX * 0.03) * 10;
        ctx.lineTo(x, hillY);
    }
    ctx.lineTo(canvasWidth + 20, groundY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#428e34';
    ctx.beginPath();
    ctx.moveTo(-20, groundY);

    for (let x = -50; x <= canvasWidth + 100; x += 10) {
        let realX = x + shift * 1.5;
        let hillY = groundY - 42 + Math.sin(realX * 0.025 + 1.2) * 16;
        ctx.lineTo(x, hillY);
    }
    ctx.lineTo(canvasWidth + 20, groundY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#2d6823';
    for (let i = -1; i < 6; i++) {
        let treeX = (i * 85 - (shift * 1.5) % 85 + 85) % (canvasWidth + 80) - 20;
        let treeBaseY = groundY - 42 + Math.sin((treeX + shift * 1.5) * 0.025 + 1.2) * 16;

        ctx.fillStyle = '#4a3319';
        ctx.fillRect(treeX - 2, treeBaseY - 6, 4, 8);

        ctx.fillStyle = '#255e1c';
        ctx.beginPath();
        ctx.moveTo(treeX, treeBaseY - 24);
        ctx.lineTo(treeX - 9, treeBaseY - 12);
        ctx.lineTo(treeX + 9, treeBaseY - 12);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(treeX, treeBaseY - 18);
        ctx.lineTo(treeX - 12, treeBaseY - 5);
        ctx.lineTo(treeX + 12, treeBaseY - 5);
        ctx.closePath();
        ctx.fill();
    }
}

function drawPipes() {
    pipes.forEach(pipe => {
        let pipeGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
        pipeGrad.addColorStop(0, '#4e8c25');
        pipeGrad.addColorStop(0.3, '#7bc437');
        pipeGrad.addColorStop(0.7, '#64aa2b');
        pipeGrad.addColorStop(1, '#3b6e1b');

        ctx.fillStyle = pipeGrad;
        ctx.fillRect(pipe.x, pipe.y, pipeWidth, pipe.height);

        ctx.strokeStyle = '#244710';
        ctx.lineWidth = 2;
        ctx.strokeRect(pipe.x, pipe.y, pipeWidth, pipe.height);

        ctx.strokeStyle = 'rgba(30, 60, 12, 0.25)';
        ctx.lineWidth = 1.5;
        for (let strokeY = pipe.y + 15; strokeY < pipe.y + pipe.height - 10; strokeY += 22) {
            ctx.beginPath();
            ctx.moveTo(pipe.x + 8, strokeY);
            ctx.lineTo(pipe.x + pipeWidth - 8, strokeY + 4);
            ctx.stroke();
        }

        let capHeight = 16;
        let capX = pipe.x - 3;
        let capW = pipeWidth + 6;
        let capY = pipe.isTop ? pipe.height - capHeight : pipe.y;

        let capGrad = ctx.createLinearGradient(capX, 0, capX + capW, 0);
        capGrad.addColorStop(0, '#65aa2d');
        capGrad.addColorStop(0.5, '#95dc48');
        capGrad.addColorStop(1, '#4e8a20');

        ctx.fillStyle = capGrad;
        ctx.fillRect(capX, capY, capW, capHeight);
        ctx.strokeStyle = '#244710';
        ctx.lineWidth = 2;
        ctx.strokeRect(capX, capY, capW, capHeight);

        ctx.fillStyle = '#8bc34a';
        if (pipe.isTop) {
            ctx.beginPath();
            ctx.ellipse(capX + 10, capY + capHeight + 4, 5, 8, 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.ellipse(capX + capW - 10, capY - 4, 5, 8, -0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
    });
}

function drawGround() {
    let soilGrad = ctx.createLinearGradient(0, groundY, 0, canvasHeight);
    soilGrad.addColorStop(0, '#8c5e38');
    soilGrad.addColorStop(0.3, '#6e4526');
    soilGrad.addColorStop(1, '#4a2c15');
    ctx.fillStyle = soilGrad;
    ctx.fillRect(0, groundY, canvasWidth, groundHeight);

    ctx.fillStyle = '#3a200d';
    ctx.fillRect(0, groundY, canvasWidth, 2);

    ctx.fillStyle = 'rgba(60, 35, 15, 0.4)';
    for (let i = 0; i < canvasWidth; i += 24) {
        let px = (i - bgOffsetNear % 24 + canvasWidth) % canvasWidth;
        ctx.fillRect(px, groundY + 14, 5, 3);
        ctx.fillRect(px + 10, groundY + 24, 4, 4);
    }

    let grassGrad = ctx.createLinearGradient(0, groundY - 6, 0, groundY + 6);
    grassGrad.addColorStop(0, '#8ed433');
    grassGrad.addColorStop(1, '#539e1b');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, groundY - 6, canvasWidth, 8);

    ctx.fillStyle = '#8ed433';
    ctx.strokeStyle = '#3d7811';
    ctx.lineWidth = 1;

    const bladeWidth = 8;
    for (let x = -bladeWidth; x < canvasWidth + bladeWidth; x += bladeWidth) {
        let realX = x - (bgOffsetNear % bladeWidth);
        ctx.beginPath();
        ctx.moveTo(realX, groundY - 5);
        ctx.lineTo(realX + 4, groundY - 11);
        ctx.lineTo(realX + 8, groundY - 5);
        ctx.closePath();
        ctx.fill();
    }

    for (let i = 0; i < canvasWidth; i += 75) {
        let flowerX = (i - bgOffsetNear % 75 + canvasWidth) % canvasWidth;
        let flowerY = groundY - 8;

        ctx.strokeStyle = '#4e8c25';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(flowerX, groundY);
        ctx.lineTo(flowerX, flowerY);
        ctx.stroke();

        ctx.fillStyle = (i % 150 === 0) ? '#ffea00' : '#ffffff';
        ctx.beginPath();
        ctx.arc(flowerX - 2, flowerY, 2, 0, Math.PI * 2);
        ctx.arc(flowerX + 2, flowerY, 2, 0, Math.PI * 2);
        ctx.arc(flowerX, flowerY - 2, 2, 0, Math.PI * 2);
        ctx.arc(flowerX, flowerY + 2, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff9800';
        ctx.beginPath();
        ctx.arc(flowerX, flowerY, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawNatureParticles() {
    particles.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.oscillation);

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    });
}

function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);

    let angle = Math.min(Math.max(bird.velocity * 4, -25), 70) * (Math.PI / 180);
    ctx.rotate(angle);

    ctx.fillStyle = '#f57c00';
    ctx.beginPath();
    ctx.moveTo(-10, -2);
    ctx.lineTo(-17, -7);
    ctx.lineTo(-14, 2);
    ctx.lineTo(-17, 7);
    ctx.closePath();
    ctx.fill();

    let birdGrad = ctx.createRadialGradient(-2, -2, 2, 0, 0, bird.width / 2);
    birdGrad.addColorStop(0, '#fff176');
    birdGrad.addColorStop(0.7, '#fbc02d');
    birdGrad.addColorStop(1, '#f57f17');
    ctx.fillStyle = birdGrad;
    ctx.beginPath();
    ctx.arc(0, 0, bird.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b78103';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.save();
    let flapOffset = Math.sin(bird.wingAngle) * 5;
    ctx.fillStyle = '#fff59d';
    ctx.beginPath();
    ctx.ellipse(-3, 2 + flapOffset * 0.4, 7, 4.5, 0.2 + flapOffset * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f57f17';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(4, -4, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(5.5, -4, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(6.2, -5, 0.8, 0, Math.PI * 2);
    ctx.fill();

    let beakGrad = ctx.createLinearGradient(7, 0, 14, 0);
    beakGrad.addColorStop(0, '#ff7043');
    beakGrad.addColorStop(1, '#d84315');
    ctx.fillStyle = beakGrad;
    ctx.beginPath();
    ctx.moveTo(8, -2);
    ctx.lineTo(15, 1);
    ctx.lineTo(8, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawUI() {
    ctx.save();
    
    let plateX = canvasWidth / 2 - 50;
    let plateY = 12;
    let plateW = 100;
    let plateH = 34;

    ctx.fillStyle = 'rgba(30, 45, 20, 0.55)';
    ctx.beginPath();
    ctx.roundRect(plateX, plateY, plateW, plateH, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 4;
    ctx.fillText(`${score}`, canvasWidth / 2, plateY + 23);
    ctx.restore();

    if (!gameStarted) {
        ctx.save();
        ctx.fillStyle = 'rgba(15, 30, 20, 0.45)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        let cardW = 240;
        let cardH = 160;
        let cardX = (canvasWidth - cardW) / 2;
        let cardY = (canvasHeight - cardH) / 2 - 10;

        let cardGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
        cardGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        cardGrad.addColorStop(1, 'rgba(240, 248, 235, 0.92)');
        ctx.fillStyle = cardGrad;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 16);
        ctx.fill();
        ctx.strokeStyle = '#8bc34a';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#2e7d32';
        ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Flappy Nature', canvasWidth / 2, cardY + 38);

        ctx.fillStyle = '#424242';
        ctx.font = '13px "Segoe UI", Arial, sans-serif';
        ctx.fillText('Press SPACE, ENTER or Click', canvasWidth / 2, cardY + 68);

        let btnW = 130;
        let btnH = 34;
        let btnX = canvasWidth / 2 - btnW / 2;
        let btnY = cardY + 98;

        let btnGrad = ctx.createLinearGradient(0, btnY, 0, btnY + btnH);
        btnGrad.addColorStop(0, '#7cb342');
        btnGrad.addColorStop(1, '#558b2f');
        ctx.fillStyle = btnGrad;
        ctx.beginPath();
        ctx.roundRect(btnX, btnY, btnW, btnH, 17);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
        ctx.fillText('TAP / ENTER TO PLAY', canvasWidth / 2, btnY + 22);

        if (highScore > 0) {
            ctx.fillStyle = '#558b2f';
            ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
            ctx.fillText(`Best Score: ${highScore}`, canvasWidth / 2, cardY + cardH + 25);
        }

        ctx.restore();

    } else if (gameOver) {
        ctx.save();
        ctx.fillStyle = 'rgba(20, 15, 10, 0.55)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        let cardW = 240;
        let cardH = 180;
        let cardX = (canvasWidth - cardW) / 2;
        let cardY = (canvasHeight - cardH) / 2 - 10;

        let cardGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
        cardGrad.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
        cardGrad.addColorStop(1, 'rgba(240, 248, 235, 0.94)');
        ctx.fillStyle = cardGrad;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 16);
        ctx.fill();
        ctx.strokeStyle = '#ff7043';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#d84315';
        ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvasWidth / 2, cardY + 40);

        ctx.fillStyle = '#37474f';
        ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
        ctx.fillText(`Score: ${score}`, canvasWidth / 2, cardY + 75);
        ctx.fillStyle = '#689f38';
        ctx.fillText(`High Score: ${highScore}`, canvasWidth / 2, cardY + 98);

        let btnW = 140;
        let btnH = 34;
        let btnX = canvasWidth / 2 - btnW / 2;
        let btnY = cardY + 124;

        let btnGrad = ctx.createLinearGradient(0, btnY, 0, btnY + btnH);
        btnGrad.addColorStop(0, '#ff7043');
        btnGrad.addColorStop(1, '#d84315');
        ctx.fillStyle = btnGrad;
        ctx.beginPath();
        ctx.roundRect(btnX, btnY, btnW, btnH, 17);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
        ctx.fillText('PLAY AGAIN (ENTER)', canvasWidth / 2, btnY + 22);

        ctx.restore();
    }
}

function resetGame() {
    bird.y = canvasHeight / 2 - 12;
    bird.velocity = 0;
    bird.wingAngle = 0;
    pipes = [];
    score = 0;
    frame = 0;
    gameOver = false;
}

setup();



