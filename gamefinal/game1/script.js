// Spider-Man: City Web-Slinger Engine
document.addEventListener('DOMContentLoaded', () => {
    // --- Canvas & Context ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // --- DOM Elements ---
    const scoreDisplay = document.getElementById('scoreDisplay');
    const distanceDisplay = document.getElementById('distanceDisplay');
    const highScoreDisplay = document.getElementById('highScoreDisplay');
    const fluidBar = document.getElementById('fluidBar');
    const livesDisplay = document.getElementById('livesDisplay');
    const soundBtn = document.getElementById('soundBtn');
    const soundIcon = document.getElementById('soundIcon');
    const pauseBtn = document.getElementById('pauseBtn');

    // Overlays & Buttons
    const startOverlay = document.getElementById('startOverlay');
    const pauseOverlay = document.getElementById('pauseOverlay');
    const gameOverOverlay = document.getElementById('gameOverOverlay');
    const startBtn = document.getElementById('startBtn');
    const resumeBtn = document.getElementById('resumeBtn');
    const restartBtn = document.getElementById('restartBtn');
    const restartPauseBtn = document.getElementById('restartPauseBtn');
    const finalScore = document.getElementById('finalScore');
    const finalDistance = document.getElementById('finalDistance');
    const bestScore = document.getElementById('bestScore');
    const gameOverTitle = document.getElementById('gameOverTitle');

    // Mobile buttons
    const mobileSwingBtn = document.getElementById('mobileSwingBtn');
    const mobileBlastBtn = document.getElementById('mobileBlastBtn');
    const mobileJumpBtn = document.getElementById('mobileJumpBtn');

    // Boss HUD Elements
    const bossHudBar = document.getElementById('bossHudBar');
    const bossHpText = document.getElementById('bossHpText');
    const bossBarFill = document.getElementById('bossBarFill');
    const bossAlertBanner = document.getElementById('bossAlertBanner');

    // --- Audio Engine (Web Audio API Synthesizer) ---
    let soundMuted = false;
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playSFX(type) {
        if (soundMuted) return;
        try {
            const actx = getAudioContext();
            const now = actx.currentTime;

            if (type === 'thwip') { // Web shoot sound
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(1200, now);
                osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
                osc.connect(gain);
                gain.connect(actx.destination);
                osc.start(now);
                osc.stop(now + 0.12);
            } else if (type === 'blast') { // Laser web blast
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.15);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
                osc.connect(gain);
                gain.connect(actx.destination);
                osc.start(now);
                osc.stop(now + 0.15);
            } else if (type === 'explosion') { // Bomb explosion
                const bufferSize = actx.sampleRate * 0.25;
                const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                const noise = actx.createBufferSource();
                noise.buffer = buffer;
                const filter = actx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(800, now);
                filter.frequency.linearRampToValueAtTime(50, now + 0.25);
                const gain = actx.createGain();
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
                noise.connect(filter);
                filter.connect(gain);
                gain.connect(actx.destination);
                noise.start(now);
            } else if (type === 'pickup') { // Item collect
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
                osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
                osc.connect(gain);
                gain.connect(actx.destination);
                osc.start(now);
                osc.stop(now + 0.25);
            } else if (type === 'hurt') { // Damage taken
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.setValueAtTime(90, now + 0.1);
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
                osc.connect(gain);
                gain.connect(actx.destination);
                osc.start(now);
                osc.stop(now + 0.2);
            } else if (type === 'boss_spawn') { // Boss siren warning sound
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(180, now);
                osc.frequency.linearRampToValueAtTime(450, now + 0.4);
                osc.frequency.linearRampToValueAtTime(200, now + 0.8);
                gain.gain.setValueAtTime(0.35, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.8);
                osc.connect(gain);
                gain.connect(actx.destination);
                osc.start(now);
                osc.stop(now + 0.8);
            } else if (type === 'boss_hit') { // Boss taking damage
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.linearRampToValueAtTime(80, now + 0.15);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
                osc.connect(gain);
                gain.connect(actx.destination);
                osc.start(now);
                osc.stop(now + 0.15);
            } else if (type === 'boss_attack') { // Boss shooting energy projectile
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
                osc.connect(gain);
                gain.connect(actx.destination);
                osc.start(now);
                osc.stop(now + 0.2);
            }
        } catch (e) {
            console.log('Audio playback error:', e);
        }
    }

    // Sound Mute Toggle
    soundBtn.addEventListener('click', () => {
        soundMuted = !soundMuted;
        soundIcon.style.opacity = soundMuted ? '0.3' : '1.0';
    });

    // --- Game State Variables ---
    let gameState = 'start'; // 'start', 'playing', 'paused', 'gameover'
    let score = 0;
    let distance = 0;
    let highScore = parseInt(localStorage.getItem('spidey_highscore') || '0', 10);
    highScoreDisplay.textContent = highScore;

    let lives = 3;
    let webFluid = 100;
    let cameraX = 0;

    // --- Input Tracking ---
    const keys = {
        space: false,
        up: false,
        blast: false
    };

    let isSwingingInput = false;

    // Mouse targeting for Web Shooting
    let mousePos = { x: 480, y: 270 };

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mousedown', (e) => {
        getAudioContext();
        if (e.button === 0) { // Left click: Swing
            isSwingingInput = true;
        } else if (e.button === 2) { // Right click: Blast
            e.preventDefault();
            triggerWebBlast();
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        if (e.button === 0) {
            isSwingingInput = false;
        }
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Keyboard Listeners
    window.addEventListener('keydown', (e) => {
        getAudioContext();
        if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
            keys.space = true;
            isSwingingInput = true;
        }
        if (e.code === 'KeyE') {
            triggerWebBlast();
        }
        if (e.code === 'KeyP') {
            togglePause();
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
            keys.space = false;
            isSwingingInput = false;
        }
    });

    // Mobile Control Listeners
    mobileSwingBtn.addEventListener('touchstart', (e) => { e.preventDefault(); isSwingingInput = true; });
    mobileSwingBtn.addEventListener('touchend', (e) => { e.preventDefault(); isSwingingInput = false; });
    mobileBlastBtn.addEventListener('click', () => triggerWebBlast());
    mobileJumpBtn.addEventListener('click', () => spideyJump());

    // --- Player (Spider-Man) ---
    const player = {
        x: 100,
        y: 200,
        vx: 5,
        vy: 0,
        radius: 18,
        isSwinging: false,
        webAnchor: null,
        ropeLength: 0,
        ropeAngle: 0,
        ropeAngularVel: 0,
        onGround: false,

        reset() {
            this.x = 150;
            this.y = 200;
            this.vx = 6;
            this.vy = 0;
            this.isSwinging = false;
            this.webAnchor = null;
            this.ropeLength = 0;
            this.ropeAngle = 0;
            this.ropeAngularVel = 0;
            this.onGround = false;
        }
    };

    function spideyJump() {
        if (player.onGround || player.isSwinging) {
            player.vy = -12;
            player.vx += 2;
            if (player.isSwinging) {
                player.isSwinging = false;
                player.webAnchor = null;
            }
            player.onGround = false;
            playSFX('thwip');
        }
    }

    function triggerWebBlast() {
        if (gameState !== 'playing' || webFluid < 10) return;
        webFluid -= 10;
        updateHUD();
        playSFX('blast');

        // Target vector towards mouse or straight forward
        const worldMouseX = mousePos.x + cameraX;
        const worldMouseY = mousePos.y;
        let dx = worldMouseX - player.x;
        let dy = worldMouseY - player.y;
        const len = Math.hypot(dx, dy) || 1;
        dx = (dx / len) * 16;
        dy = (dy / len) * 16;

        webBlasts.push({
            x: player.x + 10,
            y: player.y,
            vx: dx,
            vy: dy,
            radius: 6,
            life: 60
        });
    }

    // --- Game World Entities ---
    let buildings = [];
    let pumpkinBombs = [];
    let webBlasts = [];
    let collectibles = [];
    let particles = [];
    let stars = [];
    let bossProjectiles = [];
    let nextBossDistance = 250;

    // --- Red Spiky Boss Entity ---
    const boss = {
        active: false,
        x: 0,
        y: 130,
        vx: 0,
        vy: 0,
        hp: 100,
        maxHp: 100,
        radius: 38,
        spikes: 12,
        phaseTimer: 0,
        attackTimer: 0,
        pulse: 0,

        spawn(playerX) {
            this.active = true;
            this.x = playerX + 600;
            this.y = 130;
            this.hp = 100;
            this.maxHp = 100;
            this.phaseTimer = 0;
            this.attackTimer = 60;
            this.pulse = 0;

            if (bossHudBar) bossHudBar.classList.add('active');
            if (bossAlertBanner) {
                bossAlertBanner.classList.remove('active');
                void bossAlertBanner.offsetWidth;
                bossAlertBanner.classList.add('active');
            }
            playSFX('boss_spawn');
            updateBossHUD();
        },

        dismiss() {
            this.active = false;
            if (bossHudBar) bossHudBar.classList.remove('active');
        }
    };

    function updateBossHUD() {
        if (!bossHpText || !bossBarFill) return;
        bossHpText.textContent = `${Math.max(0, Math.ceil(boss.hp))} / ${boss.maxHp}`;
        const pct = Math.max(0, (boss.hp / boss.maxHp) * 100);
        bossBarFill.style.width = pct + '%';
    }

    // Initialize Stars for Background
    for (let i = 0; i < 80; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height * 0.6),
            size: Math.random() * 2 + 1,
            alpha: Math.random() * 0.8 + 0.2
        });
    }

    function generateWorld() {
        buildings = [];
        pumpkinBombs = [];
        collectibles = [];
        let currentX = 0;

        // Generate initial starting building
        buildings.push({
            x: 0,
            width: 350,
            height: 220,
            anchorX: 175,
            anchorY: canvas.height - 220
        });

        currentX = 350;

        // Generate procedural skyline ahead
        for (let i = 0; i < 40; i++) {
            const gap = Math.floor(Math.random() * 120) + 90;
            const width = Math.floor(Math.random() * 220) + 160;
            const height = Math.floor(Math.random() * 220) + 180;
            const bX = currentX + gap;
            const bY = canvas.height - height;

            buildings.push({
                x: bX,
                width: width,
                height: height,
                anchorX: bX + width / 2,
                anchorY: bY
            });

            // Add Pumpkin Bombs above gaps
            if (Math.random() > 0.4) {
                pumpkinBombs.push({
                    x: bX - gap / 2,
                    y: bY - Math.random() * 100 - 80,
                    vy: (Math.random() - 0.5) * 2,
                    radius: 16,
                    pulse: 0
                });
            }

            // Add Collectibles
            if (Math.random() > 0.3) {
                const type = Math.random() > 0.3 ? 'badge' : (Math.random() > 0.5 ? 'fluid' : 'heart');
                collectibles.push({
                    x: bX + width / 2,
                    y: bY - 60,
                    type: type,
                    radius: 12,
                    collected: false
                });
            }

            currentX = bX + width;
        }
    }

    function extendWorldIfNeeded() {
        const lastBuilding = buildings[buildings.length - 1];
        if (lastBuilding.x - cameraX < canvas.width + 500) {
            let currentX = lastBuilding.x + lastBuilding.width;
            for (let i = 0; i < 15; i++) {
                const gap = Math.floor(Math.random() * 140) + 100;
                const width = Math.floor(Math.random() * 240) + 160;
                const height = Math.floor(Math.random() * 230) + 160;
                const bX = currentX + gap;
                const bY = canvas.height - height;

                buildings.push({
                    x: bX,
                    width: width,
                    height: height,
                    anchorX: bX + width / 2,
                    anchorY: bY
                });

                if (Math.random() > 0.35) {
                    pumpkinBombs.push({
                        x: bX - gap / 2,
                        y: bY - Math.random() * 110 - 70,
                        vy: (Math.random() - 0.5) * 2.5,
                        radius: 16,
                        pulse: 0
                    });
                }

                if (Math.random() > 0.3) {
                    const type = Math.random() > 0.3 ? 'badge' : (Math.random() > 0.5 ? 'fluid' : 'heart');
                    collectibles.push({
                        x: bX + width / 2,
                        y: bY - 60,
                        type: type,
                        radius: 12,
                        collected: false
                    });
                }

                currentX = bX + width;
            }
        }
    }

    // --- Particle System ---
    function spawnExplosion(x, y, color, count = 16) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 4 + 2,
                color: color,
                alpha: 1.0,
                life: Math.random() * 25 + 15
            });
        }
    }

    // --- Game Logic Updates ---
    function update() {
        if (gameState !== 'playing') return;

        // Check Boss Spawn Milestone
        if (!boss.active && distance >= nextBossDistance) {
            boss.spawn(player.x);
        }

        // Web Fluid passive recharge on ground or decay when swinging
        if (player.onGround) {
            webFluid = Math.min(100, webFluid + 0.3);
        }

        // Web Swinging Input & Mechanics
        if (isSwingingInput && webFluid > 0) {
            if (!player.isSwinging) {
                // Find nearest anchor building ahead of player
                let bestAnchor = null;
                let minDistance = 99999;

                for (let b of buildings) {
                    if (b.anchorX > player.x - 50 && b.anchorX < player.x + 400) {
                        const dist = Math.hypot(b.anchorX - player.x, b.anchorY - player.y);
                        if (dist < minDistance && dist > 50) {
                            minDistance = dist;
                            bestAnchor = b;
                        }
                    }
                }

                if (bestAnchor) {
                    player.isSwinging = true;
                    player.webAnchor = { x: bestAnchor.anchorX, y: bestAnchor.anchorY };
                    player.ropeLength = minDistance;
                    player.ropeAngle = Math.atan2(player.y - bestAnchor.anchorY, player.x - bestAnchor.anchorX);
                    player.ropeAngularVel = 0;
                    playSFX('thwip');
                }
            }
        } else {
            if (player.isSwinging) {
                // Release web swing momentum boost
                player.isSwinging = false;
                player.vx += Math.cos(player.ropeAngle + Math.PI / 2) * (player.ropeAngularVel * 12);
                player.vy += Math.sin(player.ropeAngle + Math.PI / 2) * (player.ropeAngularVel * 12);
                player.webAnchor = null;
            }
        }

        // Physics Updates
        if (player.isSwinging && player.webAnchor) {
            webFluid = Math.max(0, webFluid - 0.15);
            // Pendulum physics
            const g = 0.5;
            const d2theta = (-g / player.ropeLength) * Math.cos(player.ropeAngle);
            player.ropeAngularVel += d2theta;
            player.ropeAngle += player.ropeAngularVel;

            // Apply forward thrust force
            player.ropeAngularVel *= 0.992;
            player.ropeAngularVel += 0.0015;

            player.x = player.webAnchor.x + Math.cos(player.ropeAngle) * player.ropeLength;
            player.y = player.webAnchor.y + Math.sin(player.ropeAngle) * player.ropeLength;

            player.vx = -Math.sin(player.ropeAngle) * player.ropeLength * player.ropeAngularVel;
            player.vy = Math.cos(player.ropeAngle) * player.ropeLength * player.ropeAngularVel;
        } else {
            // Gravity & Air Resistance
            player.vy += 0.45; // Gravity
            player.vx *= 0.99; // Air drag
            player.vx = Math.max(4, Math.min(player.vx, 14)); // Speed boundaries

            player.x += player.vx;
            player.y += player.vy;
        }

        // Building Ground Collision & Landing
        player.onGround = false;
        for (let b of buildings) {
            const bTop = canvas.height - b.height;
            if (player.x + player.radius > b.x && player.x - player.radius < b.x + b.width) {
                if (player.y + player.radius >= bTop && player.y - player.radius < bTop + 20 && player.vy >= 0) {
                    player.y = bTop - player.radius;
                    player.vy = 0;
                    player.onGround = true;
                    if (player.isSwinging) {
                        player.isSwinging = false;
                        player.webAnchor = null;
                    }
                }
            }
        }

        // Fall Out Boundary (Die on falling off rooftops)
        if (player.y > canvas.height + 100) {
            takeDamage(true);
        }

        // Update Camera Position smoothly tracking Spider-Man
        cameraX = player.x - 200;

        // Update Web Blasts & Combat Collisions
        for (let i = webBlasts.length - 1; i >= 0; i--) {
            const b = webBlasts[i];
            b.x += b.vx;
            b.y += b.vy;
            b.life--;

            // Check collision with Red Spiky Boss
            if (boss.active) {
                const distBoss = Math.hypot(b.x - boss.x, b.y - boss.y);
                if (distBoss < b.radius + boss.radius) {
                    boss.hp -= 15;
                    playSFX('boss_hit');
                    spawnExplosion(b.x, b.y, '#ff1e43', 16);
                    webBlasts.splice(i, 1);
                    updateBossHUD();

                    if (boss.hp <= 0) {
                        // Boss Defeated!
                        spawnExplosion(boss.x, boss.y, '#ff1e43', 45);
                        spawnExplosion(boss.x, boss.y, '#ffcb05', 30);
                        spawnExplosion(boss.x, boss.y, '#ffffff', 20);
                        playSFX('explosion');
                        score += 2500;
                        webFluid = 100;
                        boss.dismiss();
                        nextBossDistance = distance + 400;
                    }
                    continue;
                }
            }

            // Check collision with Pumpkin Bombs
            for (let j = pumpkinBombs.length - 1; j >= 0; j--) {
                const bomb = pumpkinBombs[j];
                const dist = Math.hypot(b.x - bomb.x, b.y - bomb.y);
                if (dist < b.radius + bomb.radius) {
                    spawnExplosion(bomb.x, bomb.y, '#ff6600', 20);
                    playSFX('explosion');
                    pumpkinBombs.splice(j, 1);
                    webBlasts.splice(i, 1);
                    score += 150;
                    break;
                }
            }

            // Check collision with Boss Projectiles
            for (let k = bossProjectiles.length - 1; k >= 0; k--) {
                const bp = bossProjectiles[k];
                const distBp = Math.hypot(b.x - bp.x, b.y - bp.y);
                if (distBp < b.radius + bp.radius) {
                    spawnExplosion(bp.x, bp.y, '#ff0055', 12);
                    playSFX('explosion');
                    bossProjectiles.splice(k, 1);
                    webBlasts.splice(i, 1);
                    score += 50;
                    break;
                }
            }

            if (b.life <= 0 && webBlasts[i]) {
                webBlasts.splice(i, 1);
            }
        }

        // Update Boss Mechanics & AI
        if (boss.active) {
            boss.phaseTimer++;
            boss.pulse += 0.06;

            // Hovering physics staying ahead of Spider-Man
            const targetX = player.x + 380;
            const targetY = 135 + Math.sin(boss.phaseTimer * 0.04) * 45;
            boss.x += (targetX - boss.x) * 0.04;
            boss.y += (targetY - boss.y) * 0.04;

            // Boss Attack Cycle
            boss.attackTimer--;
            if (boss.attackTimer <= 0) {
                const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
                bossProjectiles.push({
                    x: boss.x,
                    y: boss.y,
                    vx: Math.cos(angle) * 6.5,
                    vy: Math.sin(angle) * 6.5,
                    radius: 12,
                    pulse: 0
                });
                playSFX('boss_attack');
                boss.attackTimer = 100;
            }

            // Direct Player vs Boss Collision
            const distPlayerBoss = Math.hypot(player.x - boss.x, player.y - boss.y);
            if (distPlayerBoss < player.radius + boss.radius) {
                spawnExplosion(player.x, player.y, '#ff1e43', 25);
                playSFX('hurt');
                takeDamage(false);
            }
        }

        // Update Boss Projectiles
        for (let i = bossProjectiles.length - 1; i >= 0; i--) {
            const bp = bossProjectiles[i];
            bp.x += bp.vx;
            bp.y += bp.vy;
            bp.pulse += 0.1;

            // Collision with Player
            const dist = Math.hypot(player.x - bp.x, player.y - bp.y);
            if (dist < player.radius + bp.radius) {
                spawnExplosion(bp.x, bp.y, '#ff0055', 20);
                playSFX('hurt');
                bossProjectiles.splice(i, 1);
                takeDamage(false);
                continue;
            }

            // Despawn offscreen projectiles
            if (bp.x < cameraX - 100 || bp.x > cameraX + canvas.width + 200 || bp.y > canvas.height + 100) {
                bossProjectiles.splice(i, 1);
            }
        }

        // Update Pumpkin Bombs & Player Hit Collision
        for (let b of pumpkinBombs) {
            b.y += b.vy;
            b.pulse += 0.08;
            if (b.y < 80 || b.y > canvas.height - 120) b.vy *= -1;

            const dist = Math.hypot(player.x - b.x, player.y - b.y);
            if (dist < player.radius + b.radius) {
                spawnExplosion(b.x, b.y, '#ff1e43', 25);
                playSFX('hurt');
                b.x = -999; // Remove bomb
                takeDamage(false);
            }
        }

        // Update Collectibles
        for (let c of collectibles) {
            if (c.collected) continue;
            const dist = Math.hypot(player.x - c.x, player.y - c.y);
            if (dist < player.radius + c.radius) {
                c.collected = true;
                playSFX('pickup');
                if (c.type === 'badge') {
                    score += 300;
                    spawnExplosion(c.x, c.y, '#ffcb05', 10);
                } else if (c.type === 'fluid') {
                    webFluid = Math.min(100, webFluid + 40);
                    spawnExplosion(c.x, c.y, '#00f0ff', 10);
                } else if (c.type === 'heart') {
                    lives = Math.min(5, lives + 1);
                    spawnExplosion(c.x, c.y, '#ff1e43', 10);
                }
            }
        }

        // Update Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.03;
            if (p.alpha <= 0) {
                particles.splice(i, 1);
            }
        }

        // Score & Distance Progress
        score += 1;
        distance = Math.floor(player.x / 10);
        updateHUD();

        extendWorldIfNeeded();
    }

    function takeDamage(fatal = false) {
        if (fatal) {
            lives = 0;
        } else {
            lives--;
        }
        updateHUD();

        if (lives <= 0) {
            endGame();
        } else {
            // Respawn player on safe building top
            player.y = 150;
            player.vy = -5;
            player.vx = 5;
        }
    }

    function updateHUD() {
        scoreDisplay.textContent = score;
        distanceDisplay.textContent = distance + 'm';
        fluidBar.style.width = Math.max(0, Math.min(100, webFluid)) + '%';
        livesDisplay.textContent = '❤️'.repeat(Math.max(0, lives));
    }

    // --- Canvas Rendering ---
    function renderWebGrid(ctx, cameraX) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.lineWidth = 1;

        const centerX = canvas.width / 2 - (cameraX * 0.05) % 80;
        const centerY = 110;

        // Radial web grid rays
        const numRays = 12;
        for (let i = 0; i < numRays; i++) {
            const angle = (i * Math.PI * 2) / numRays;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + Math.cos(angle) * 750, centerY + Math.sin(angle) * 750);
            ctx.stroke();
        }

        // Concentric web polygon rings
        const rings = [50, 110, 190, 290, 420];
        rings.forEach(r => {
            ctx.beginPath();
            for (let i = 0; i < numRays; i++) {
                const angle = (i * Math.PI * 2) / numRays;
                const wx = centerX + Math.cos(angle) * r;
                const wy = centerY + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(wx, wy);
                else ctx.lineTo(wx, wy);
            }
            ctx.closePath();
            ctx.stroke();
        });

        ctx.restore();
    }

    function drawSpikyBoss(ctx, x, y, radius, spikes, pulse) {
        ctx.save();
        ctx.translate(x, y);

        // 1. Red Glow Aura radiating behind Boss
        const glowGrad = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius * 2.6);
        glowGrad.addColorStop(0, 'rgba(255, 30, 67, 0.85)');
        glowGrad.addColorStop(0.5, 'rgba(255, 0, 85, 0.4)');
        glowGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 2.6, 0, Math.PI * 2);
        ctx.fill();

        // 2. Draw Multi-pointed Spiky Starburst Body
        const outerRadius = radius + Math.sin(pulse * 3) * 3;
        const innerRadius = radius * 0.45;
        const step = Math.PI / spikes;

        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const r = (i % 2 === 0) ? outerRadius : innerRadius;
            const angle = i * step + pulse;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();

        // Crimson Red Fill
        ctx.fillStyle = '#ff1e43';
        ctx.fill();

        // Thick Outer White Glow Stroke (matching user image)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 3. Glowing White Angry Eyes (matching user image)
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 10;

        // Left eye
        ctx.beginPath();
        ctx.moveTo(-12, -6);
        ctx.lineTo(-4, 0);
        ctx.lineTo(-10, 4);
        ctx.closePath();
        ctx.fill();

        // Right eye
        ctx.beginPath();
        ctx.moveTo(12, -6);
        ctx.lineTo(4, 0);
        ctx.lineTo(10, 4);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // --- Canvas Rendering ---
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Night Sky Background Gradient
        const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGradient.addColorStop(0, '#060814');
        skyGradient.addColorStop(0.6, '#0f172a');
        skyGradient.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Web Grid Overlay in Background
        renderWebGrid(ctx, cameraX);

        // 3. Stars
        ctx.fillStyle = '#ffffff';
        stars.forEach(s => {
            ctx.globalAlpha = s.alpha;
            ctx.fillRect(s.x, s.y, s.size, s.size);
        });
        ctx.globalAlpha = 1.0;

        // 4. Moon
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#fef08a';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(canvas.width - 120, 80, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 4. Parallax Background Buildings (Distant Silhouettes)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        const bgOffset = (cameraX * 0.2) % 180;
        for (let x = -bgOffset; x < canvas.width; x += 90) {
            const height = 240 + Math.sin(x * 0.05) * 60;
            ctx.fillRect(x, canvas.height - height, 70, height);
        }

        ctx.save();
        ctx.translate(-cameraX, 0);

        // 5. Foreground Skyscrapers & Web Anchor Targets
        buildings.forEach(b => {
            const bY = canvas.height - b.height;

            // Building Shadow & Body Gradient
            const bGradient = ctx.createLinearGradient(b.x, bY, b.x + b.width, canvas.height);
            bGradient.addColorStop(0, '#1e293b');
            bGradient.addColorStop(1, '#0f172a');
            ctx.fillStyle = bGradient;
            ctx.fillRect(b.x, bY, b.width, b.height);

            // Building Neon Edge Top Border
            ctx.strokeStyle = '#ff1e43';
            ctx.lineWidth = 3;
            ctx.strokeRect(b.x, bY, b.width, b.height);

            // Glowing Window Grid
            ctx.fillStyle = 'rgba(255, 203, 5, 0.4)';
            for (let wx = b.x + 15; wx < b.x + b.width - 15; wx += 25) {
                for (let wy = bY + 20; wy < canvas.height - 30; wy += 35) {
                    if ((wx + wy) % 3 === 0) {
                        ctx.fillRect(wx, wy, 12, 18);
                    }
                }
            }

            // Web Anchor Target Node atop rooftop
            ctx.fillStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(b.anchorX, b.anchorY, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // 6. Draw Web Line when Swinging
        if (player.isSwinging && player.webAnchor) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(player.x, player.y);
            ctx.lineTo(player.webAnchor.x, player.webAnchor.y);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // 7. Draw Pumpkin Bombs
        pumpkinBombs.forEach(b => {
            ctx.fillStyle = '#ff6600';
            ctx.shadowColor = '#ff3300';
            ctx.shadowBlur = 15 + Math.sin(b.pulse) * 5;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fill();

            // Bomb Jack-o-lantern face
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(b.x - 5, b.y - 3, 3, 0, Math.PI * 2);
            ctx.arc(b.x + 5, b.y - 3, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // 8. Draw Collectibles
        collectibles.forEach(c => {
            if (c.collected) return;
            ctx.save();
            ctx.translate(c.x, c.y);

            if (c.type === 'badge') {
                ctx.fillStyle = '#ffcb05';
                ctx.shadowColor = '#ffcb05';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(0, 0, c.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 12px sans-serif';
                ctx.fillText('🕷️', -7, 5);
            } else if (c.type === 'fluid') {
                ctx.fillStyle = '#00f0ff';
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 10;
                ctx.fillRect(-8, -10, 16, 20);
            } else if (c.type === 'heart') {
                ctx.fillStyle = '#ff1e43';
                ctx.font = '16px sans-serif';
                ctx.fillText('❤️', -8, 6);
            }
            ctx.restore();
        });

        // 9. Draw Web Blasts
        webBlasts.forEach(b => {
            ctx.fillStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // 9.5 Draw Boss & Boss Projectiles
        if (boss.active) {
            drawSpikyBoss(ctx, boss.x, boss.y, boss.radius, boss.spikes, boss.pulse);
        }

        bossProjectiles.forEach(bp => {
            ctx.fillStyle = '#ff0055';
            ctx.shadowColor = '#ff1e43';
            ctx.shadowBlur = 14 + Math.sin(bp.pulse) * 4;
            ctx.beginPath();
            ctx.arc(bp.x, bp.y, bp.radius, 0, Math.PI * 2);
            ctx.fill();

            // Core white glow center
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(bp.x, bp.y, bp.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // 10. Draw Particles
        particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        // 11. Draw Spider-Man Character
        ctx.save();
        ctx.translate(player.x, player.y);

        // Character Glow
        ctx.shadowColor = '#ff1e43';
        ctx.shadowBlur = 15;

        // Spidey Suit Body (Red/Blue Dual-tone)
        ctx.fillStyle = '#ff1e43';
        ctx.beginPath();
        ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0072ff';
        ctx.beginPath();
        ctx.arc(0, 3, player.radius * 0.6, 0, Math.PI);
        ctx.fill();

        // Spider Suit Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(-6, -4, 5, 8, -Math.PI / 6, 0, Math.PI * 2);
        ctx.ellipse(6, -4, 5, 8, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();

        ctx.restore(); // Restore camera translation
    }

    // --- Main Game Loop ---
    function loop() {
        update();
        render();
        requestAnimationFrame(loop);
    }

    // --- State Handlers ---
    function startGame() {
        score = 0;
        distance = 0;
        lives = 3;
        webFluid = 100;
        bossProjectiles = [];
        nextBossDistance = 250;
        boss.dismiss();
        player.reset();
        generateWorld();
        gameState = 'playing';
        startOverlay.classList.remove('active');
        pauseOverlay.classList.remove('active');
        gameOverOverlay.classList.remove('active');
        updateHUD();
    }

    function togglePause() {
        if (gameState === 'playing') {
            gameState = 'paused';
            pauseOverlay.classList.add('active');
        } else if (gameState === 'paused') {
            gameState = 'playing';
            pauseOverlay.classList.remove('active');
        }
    }

    function endGame() {
        gameState = 'gameover';
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('spidey_highscore', highScore.toString());
            highScoreDisplay.textContent = highScore;
            gameOverTitle.textContent = 'NEW HIGH SCORE!';
        } else {
            gameOverTitle.textContent = 'MISSION FAILED';
        }

        finalScore.textContent = score;
        finalDistance.textContent = distance + 'm';
        bestScore.textContent = highScore;

        gameOverOverlay.classList.add('active');
    }

    // Button Click Listeners
    startBtn.addEventListener('click', startGame);
    resumeBtn.addEventListener('click', togglePause);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', startGame);
    restartPauseBtn.addEventListener('click', startGame);

    // Initial Setup
    generateWorld();
    requestAnimationFrame(loop);
});
