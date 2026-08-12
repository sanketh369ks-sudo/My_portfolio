/* ============================================================
   RETRO & ARCADE GAMES – 12 mini games (Games 63-74)
   ============================================================ */

let retroTimer = null;
let retroFrame = null;
function retroStop() {
  if (retroTimer) { clearInterval(retroTimer); retroTimer = null; }
  if (retroFrame) { cancelAnimationFrame(retroFrame); retroFrame = null; }
}

// ── 63. PAC-RUNNER ───────────────────────────────────────────
const PACRUN = {
  scores: {}, idx: 0, px: 40, dots: 0, running: false,
};

function startPacRun() {
  PACRUN.scores = {};
  State.players.forEach(p => PACRUN.scores[p.name] = 0);
  PACRUN.idx = 0;
  shellSetup('🟡 PAC-RUNNER', { useCanvas: true, cw: 340, ch: 260 });
  buildScoreStrip('shell-scores', PACRUN.scores);
  pacRunNext();
}

function pacRunNext() {
  retroStop();
  PACRUN.px = 40; PACRUN.dots = 10; PACRUN.running = true;
  const p = State.players[PACRUN.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Click screen to eat dots!`;
  const cv = shellCanvas();
  if (cv) {
    cv.onclick = () => {
      if (!PACRUN.running) return;
      PACRUN.px += 25;
      PACRUN.dots = Math.max(0, PACRUN.dots - 1);
      playSound('click');
      if (PACRUN.dots <= 0) {
        PACRUN.running = false;
        PACRUN.scores[p.name] += 15;
        updateScoreChip(p.name, PACRUN.scores[p.name]);
        playSound('win');
        shellStatus().innerHTML = `${p.emoji} <b>CLEARED MAZE!</b> +15 pts`;
        setTimeout(pacRunAdvance, 1200);
      }
    };
  }

  pacRunLoop();
}

function pacRunLoop() {
  if (!PACRUN.running) return;
  const cv = shellCanvas(), ctx = shellCtx();
  if (!cv || !ctx) return;
  const W = cv.width, H = cv.height;

  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, W, H);

  // Dots
  ctx.fillStyle = '#ffd44d';
  for (let i = 0; i < PACRUN.dots; i++) {
    ctx.beginPath(); ctx.arc(100 + i * 20, H / 2, 6, 0, Math.PI * 2); ctx.fill();
  }

  // Pacman
  ctx.beginPath(); ctx.arc(PACRUN.px, H / 2, 16, 0.2, Math.PI * 1.8);
  ctx.lineTo(PACRUN.px, H / 2); ctx.fillStyle = '#ffd700'; ctx.fill();

  retroFrame = requestAnimationFrame(pacRunLoop);
}

function pacRunAdvance() {
  PACRUN.idx = (PACRUN.idx + 1) % State.playerCount;
  if (PACRUN.idx === 0) {
    const s = Object.entries(PACRUN.scores).sort((a, b) => b[1] - a[1]);
    showResult(PACRUN.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
  } else {
    pacRunNext();
  }
}

// ── 64. SPACE DEFENDER ───────────────────────────────────────
const SPACEINVADER = {
  scores: {}, idx: 0, aliens: 8,
};

function startSpaceInvader() {
  SPACEINVADER.scores = {};
  State.players.forEach(p => SPACEINVADER.scores[p.name] = 0);
  SPACEINVADER.idx = 0;
  shellSetup('👾 SPACE DEFENDER');
  buildScoreStrip('shell-scores', SPACEINVADER.scores);
  spaceInvaderNext();
}

function spaceInvaderNext() {
  retroStop();
  SPACEINVADER.aliens = 8;
  const p = State.players[SPACEINVADER.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Shoot down all aliens!`;

  let html = '<div class="emoji-grid">';
  for (let i = 0; i < 8; i++) {
    html += `<button class="emoji-cell" id="inv-${i}" onclick="spaceShoot(${i})">👾</button>`;
  }
  html += '</div>';

  shellMain().innerHTML = html;
}

function spaceShoot(i) {
  const btn = document.getElementById(`inv-${i}`);
  if (!btn || btn.disabled) return;
  btn.textContent = '💥'; btn.disabled = true;
  SPACEINVADER.aliens--;
  const p = State.players[SPACEINVADER.idx];
  SPACEINVADER.scores[p.name] += 2;
  updateScoreChip(p.name, SPACEINVADER.scores[p.name]);
  playSound('whack');

  if (SPACEINVADER.aliens <= 0) {
    playSound('win');
    shellStatus().innerHTML = `${p.emoji} <b>SECTOR CLEARED!</b>`;
    setTimeout(() => {
      SPACEINVADER.idx = (SPACEINVADER.idx + 1) % State.playerCount;
      if (SPACEINVADER.idx === 0) {
        const s = Object.entries(SPACEINVADER.scores).sort((a, b) => b[1] - a[1]);
        showResult(SPACEINVADER.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
      } else {
        spaceInvaderNext();
      }
    }, 1200);
  }
}

// ── 65. BRICK BREAKER ─────────────────────────────────────────
const BREAKOUT = {
  scores: {}, idx: 0, bricks: 6,
};

function startBreakout() {
  BREAKOUT.scores = {};
  State.players.forEach(p => BREAKOUT.scores[p.name] = 0);
  BREAKOUT.idx = 0;
  shellSetup('🧱 BRICK BREAKER');
  buildScoreStrip('shell-scores', BREAKOUT.scores);
  breakoutNext();
}

function breakoutNext() {
  retroStop();
  BREAKOUT.bricks = 6;
  const p = State.players[BREAKOUT.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Smash the bricks!`;

  let html = '<div class="emoji-grid">';
  for (let i = 0; i < 6; i++) {
    html += `<button class="emoji-cell" id="brk-${i}" style="background:var(--p1)" onclick="breakoutSmash(${i})">🧱</button>`;
  }
  html += '</div>';

  shellMain().innerHTML = html;
}

function breakoutSmash(i) {
  const btn = document.getElementById(`brk-${i}`);
  if (!btn || btn.disabled) return;
  btn.style.background = 'none'; btn.textContent = '✨'; btn.disabled = true;
  BREAKOUT.bricks--;
  const p = State.players[BREAKOUT.idx];
  BREAKOUT.scores[p.name] += 3;
  updateScoreChip(p.name, BREAKOUT.scores[p.name]);
  playSound('match');

  if (BREAKOUT.bricks <= 0) {
    playSound('win');
    shellStatus().innerHTML = `${p.emoji} <b>ALL BRICKS DESTROYED!</b>`;
    setTimeout(() => {
      BREAKOUT.idx = (BREAKOUT.idx + 1) % State.playerCount;
      if (BREAKOUT.idx === 0) {
        const s = Object.entries(BREAKOUT.scores).sort((a, b) => b[1] - a[1]);
        showResult(BREAKOUT.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
      } else {
        breakoutNext();
      }
    }, 1200);
  }
}

// ── 66. ASTEROID DODGE ────────────────────────────────────────
const ASTEROIDS = {
  scores: {}, idx: 0, dodged: 0,
};

function startAsteroids() {
  ASTEROIDS.scores = {};
  State.players.forEach(p => ASTEROIDS.scores[p.name] = 0);
  ASTEROIDS.idx = 0;
  shellSetup('☄️ ASTEROID DODGE');
  buildScoreStrip('shell-scores', ASTEROIDS.scores);
  astNext();
}

function astNext() {
  retroStop();
  ASTEROIDS.dodged = 0;
  const p = State.players[ASTEROIDS.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Tap ASTEROIDS to destroy before collision!`;

  let html = '<div class="fw-wrap" id="ast-area"></div>';
  shellMain().innerHTML = html;

  let count = 0;
  retroTimer = setInterval(() => {
    if (count >= 8) { clearInterval(retroTimer); return; }
    astSpawn();
    count++;
  }, 600);
}

function astSpawn() {
  const area = document.getElementById('ast-area');
  if (!area) return;
  const btn = document.createElement('button');
  btn.className = 'fw-item';
  btn.textContent = '☄️';
  btn.style.left = `${10 + Math.random() * 80}%`;
  btn.style.top = `${10 + Math.random() * 70}%`;
  btn.onclick = () => {
    const p = State.players[ASTEROIDS.idx];
    ASTEROIDS.scores[p.name] += 4;
    updateScoreChip(p.name, ASTEROIDS.scores[p.name]);
    playSound('match');
    btn.remove();
    ASTEROIDS.dodged++;
    if (ASTEROIDS.dodged >= 8) {
      setTimeout(() => {
        ASTEROIDS.idx = (ASTEROIDS.idx + 1) % State.playerCount;
        if (ASTEROIDS.idx === 0) {
          const s = Object.entries(ASTEROIDS.scores).sort((a, b) => b[1] - a[1]);
          showResult(ASTEROIDS.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
        } else {
          astNext();
        }
      }, 1000);
    }
  };
  area.appendChild(btn);
  setTimeout(() => { if (btn.parentNode) btn.remove(); }, 1200);
}

// ── 67. BLOCK STACKER ─────────────────────────────────────────
const STACKER = {
  scores: {}, idx: 0, height: 0,
};

function startStacker() {
  STACKER.scores = {};
  State.players.forEach(p => STACKER.scores[p.name] = 0);
  STACKER.idx = 0;
  shellSetup('🏢 BLOCK STACKER');
  buildScoreStrip('shell-scores', STACKER.scores);
  stackerNext();
}

function stackerNext() {
  retroStop();
  STACKER.height = 0;
  const p = State.players[STACKER.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Time your tap to stack blocks!`;
  shellFooter().innerHTML = `<button class="btn-primary" onclick="stackerDrop()">🧱 DROP BLOCK</button>`;

  shellMain().innerHTML = `<div class="word-wrap"><div class="word-target" id="stk-val">Height: 0</div></div>`;
}

function stackerDrop() {
  STACKER.height++;
  const el = document.getElementById('stk-val');
  if (el) el.textContent = `Height: ${STACKER.height}`;
  playSound('place');

  if (STACKER.height >= 5) {
    const p = State.players[STACKER.idx];
    STACKER.scores[p.name] += 15;
    updateScoreChip(p.name, STACKER.scores[p.name]);
    playSound('win');
    shellStatus().innerHTML = `${p.emoji} <b>TOWER BUILT!</b> +15 pts`;

    setTimeout(() => {
      STACKER.idx = (STACKER.idx + 1) % State.playerCount;
      if (STACKER.idx === 0) {
        const s = Object.entries(STACKER.scores).sort((a, b) => b[1] - a[1]);
        showResult(STACKER.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
      } else {
        stackerNext();
      }
    }, 1200);
  }
}

// ── 68. STREET HOPPER (Frogger) ───────────────────────────────
const FROGGER = {
  scores: {}, idx: 0, pos: 0,
};

function startStreetHopper() {
  FROGGER.scores = {};
  State.players.forEach(p => FROGGER.scores[p.name] = 0);
  FROGGER.idx = 0;
  shellSetup('🐸 STREET HOPPER');
  buildScoreStrip('shell-scores', FROGGER.scores);
  froggerNext();
}

function froggerNext() {
  retroStop();
  FROGGER.pos = 0;
  const p = State.players[FROGGER.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Hop across 4 lanes!`;
  shellFooter().innerHTML = `<button class="btn-primary" onclick="froggerHop()">🐸 HOP FORWARD</button>`;

  shellMain().innerHTML = `<div class="word-wrap"><div class="word-target" id="frog-val">Progress: 0/4</div></div>`;
}

function froggerHop() {
  FROGGER.pos++;
  const el = document.getElementById('frog-val');
  if (el) el.textContent = `Progress: ${FROGGER.pos}/4`;
  playSound('click');

  if (FROGGER.pos >= 4) {
    const p = State.players[FROGGER.idx];
    FROGGER.scores[p.name] += 10;
    updateScoreChip(p.name, FROGGER.scores[p.name]);
    playSound('win');
    shellStatus().innerHTML = `${p.emoji} <b>SAFELY CROSSED!</b> +10 pts`;

    setTimeout(() => {
      FROGGER.idx = (FROGGER.idx + 1) % State.playerCount;
      if (FROGGER.idx === 0) {
        const s = Object.entries(FROGGER.scores).sort((a, b) => b[1] - a[1]);
        showResult(FROGGER.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
      } else {
        froggerNext();
      }
    }, 1200);
  }
}

// ── 69. MINI PINBALL ─────────────────────────────────────────
const PINBALL = {
  scores: {}, idx: 0, score: 0,
};

function startPinball() {
  PINBALL.scores = {};
  State.players.forEach(p => PINBALL.scores[p.name] = 0);
  PINBALL.idx = 0;
  shellSetup('🎰 MINI PINBALL');
  buildScoreStrip('shell-scores', PINBALL.scores);
  pinballNext();
}

function pinballNext() {
  retroStop();
  PINBALL.score = 0;
  const p = State.players[PINBALL.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Tap FLIPPER to bounce ball!`;
  shellFooter().innerHTML = `<button class="btn-primary" onclick="pinballFlip()">🏏 FLICK FLIPPER</button>`;

  shellMain().innerHTML = `<div class="word-wrap"><div class="word-target" id="pin-val">Bounces: 0</div></div>`;
}

function pinballFlip() {
  PINBALL.score += 5;
  const el = document.getElementById('pin-val');
  if (el) el.textContent = `Bounces: ${PINBALL.score / 5}`;
  playSound('match');

  if (PINBALL.score >= 25) {
    const p = State.players[PINBALL.idx];
    PINBALL.scores[p.name] += PINBALL.score;
    updateScoreChip(p.name, PINBALL.scores[p.name]);
    playSound('win');
    shellStatus().innerHTML = `${p.emoji} <b>HIGH SCORE!</b> +${PINBALL.score} pts`;

    setTimeout(() => {
      PINBALL.idx = (PINBALL.idx + 1) % State.playerCount;
      if (PINBALL.idx === 0) {
        const s = Object.entries(PINBALL.scores).sort((a, b) => b[1] - a[1]);
        showResult(PINBALL.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
      } else {
        pinballNext();
      }
    }, 1200);
  }
}

// ── 70. DINO RUNNER ───────────────────────────────────────────
const DINOJUMP = {
  scores: {}, idx: 0, jumps: 0,
};

function startDinoJump() {
  DINOJUMP.scores = {};
  State.players.forEach(p => DINOJUMP.scores[p.name] = 0);
  DINOJUMP.idx = 0;
  shellSetup('🦖 DINO RUNNER');
  buildScoreStrip('shell-scores', DINOJUMP.scores);
  dinoNext();
}

function dinoNext() {
  retroStop();
  DINOJUMP.jumps = 0;
  const p = State.players[DINOJUMP.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Jump 5 cacti!`;
  shellFooter().innerHTML = `<button class="btn-primary" onclick="dinoJump()">🦖 JUMP!</button>`;

  shellMain().innerHTML = `<div class="word-wrap"><div class="word-target" id="dino-val">Cacti Jumped: 0/5</div></div>`;
}

function dinoJump() {
  DINOJUMP.jumps++;
  const el = document.getElementById('dino-val');
  if (el) el.textContent = `Cacti Jumped: ${DINOJUMP.jumps}/5`;
  playSound('click');

  if (DINOJUMP.jumps >= 5) {
    const p = State.players[DINOJUMP.idx];
    DINOJUMP.scores[p.name] += 10;
    updateScoreChip(p.name, DINOJUMP.scores[p.name]);
    playSound('win');
    shellStatus().innerHTML = `${p.emoji} <b>RUN COMPLETED!</b> +10 pts`;

    setTimeout(() => {
      DINOJUMP.idx = (DINOJUMP.idx + 1) % State.playerCount;
      if (DINOJUMP.idx === 0) {
        const s = Object.entries(DINOJUMP.scores).sort((a, b) => b[1] - a[1]);
        showResult(DINOJUMP.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
      } else {
        dinoNext();
      }
    }, 1200);
  }
}

// ── 71. MAZE ESCAPE ───────────────────────────────────────────
const MAZEESCAPE = {
  scores: {}, idx: 0, pos: 0,
};

function startMazeEscape() {
  MAZEESCAPE.scores = {};
  State.players.forEach(p => MAZEESCAPE.scores[p.name] = 0);
  MAZEESCAPE.idx = 0;
  shellSetup('🌀 MAZE ESCAPE');
  buildScoreStrip('shell-scores', MAZEESCAPE.scores);
  mazeNext();
}

function mazeNext() {
  retroStop();
  MAZEESCAPE.pos = 0;
  const p = State.players[MAZEESCAPE.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Pick correct directions to escape!`;

  shellMain().innerHTML = `
    <div class="word-wrap">
      <div class="color-btns">
        <button class="btn-primary" onclick="mazeStep(true)">⬅ LEFT</button>
        <button class="btn-primary" onclick="mazeStep(false)">⬆ FORWARD</button>
        <button class="btn-primary" onclick="mazeStep(true)">RIGHT ➡</button>
      </div>
    </div>
  `;
}

function mazeStep(ok) {
  const p = State.players[MAZEESCAPE.idx];
  if (ok) {
    MAZEESCAPE.scores[p.name] += 10;
    updateScoreChip(p.name, MAZEESCAPE.scores[p.name]);
    playSound('win');
    shellStatus().innerHTML = `${p.emoji} <b>ESCAPED THE MAZE!</b> +10 pts`;
  } else {
    playSound('die');
    shellStatus().innerHTML = `❌ Hit a dead end!`;
  }

  setTimeout(() => {
    MAZEESCAPE.idx = (MAZEESCAPE.idx + 1) % State.playerCount;
    if (MAZEESCAPE.idx === 0) {
      const s = Object.entries(MAZEESCAPE.scores).sort((a, b) => b[1] - a[1]);
      showResult(MAZEESCAPE.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      mazeNext();
    }
  }, 1200);
}

// ── 72. RETRO SNAKE 2 ─────────────────────────────────────────
const RETROSNAKE2 = {
  scores: {}, idx: 0, length: 3,
};

function startRetroSnake2() {
  RETROSNAKE2.scores = {};
  State.players.forEach(p => RETROSNAKE2.scores[p.name] = 0);
  RETROSNAKE2.idx = 0;
  shellSetup('🐍 RETRO SNAKE 2');
  buildScoreStrip('shell-scores', RETROSNAKE2.scores);
  retroSnakeNext();
}

function retroSnakeNext() {
  retroStop();
  RETROSNAKE2.length = 3;
  const p = State.players[RETROSNAKE2.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Eat 4 apples!`;
  shellFooter().innerHTML = `<button class="btn-primary" onclick="retroSnakeEat()">🍎 EAT APPLE</button>`;

  shellMain().innerHTML = `<div class="word-wrap"><div class="word-target" id="snk2-val">Length: 3</div></div>`;
}

function retroSnakeEat() {
  RETROSNAKE2.length++;
  const el = document.getElementById('snk2-val');
  if (el) el.textContent = `Length: ${RETROSNAKE2.length}`;
  playSound('eat');

  if (RETROSNAKE2.length >= 7) {
    const p = State.players[RETROSNAKE2.idx];
    RETROSNAKE2.scores[p.name] += 12;
    updateScoreChip(p.name, RETROSNAKE2.scores[p.name]);
    playSound('win');
    shellStatus().innerHTML = `${p.emoji} <b>SNAKE FEAST!</b> +12 pts`;

    setTimeout(() => {
      RETROSNAKE2.idx = (RETROSNAKE2.idx + 1) % State.playerCount;
      if (RETROSNAKE2.idx === 0) {
        const s = Object.entries(RETROSNAKE2.scores).sort((a, b) => b[1] - a[1]);
        showResult(RETROSNAKE2.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
      } else {
        retroSnakeNext();
      }
    }, 1200);
  }
}

// ── 73. TANK BATTLE ───────────────────────────────────────────
const TANKBATTLE = {
  scores: {}, idx: 0,
};

function startTankBattle() {
  TANKBATTLE.scores = {};
  State.players.forEach(p => TANKBATTLE.scores[p.name] = 0);
  TANKBATTLE.idx = 0;
  shellSetup('🚀 TANK BATTLE');
  buildScoreStrip('shell-scores', TANKBATTLE.scores);
  tankNext();
}

function tankNext() {
  retroStop();
  const p = State.players[TANKBATTLE.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Aim cannon & FIRE!`;

  shellMain().innerHTML = `
    <div class="word-wrap">
      <div class="word-target">💥 🚀 💥</div>
      <button class="btn-primary" style="background:var(--p1)" onclick="tankFire()">🔥 FIRE CANNON!</button>
    </div>
  `;
}

function tankFire() {
  const p = State.players[TANKBATTLE.idx];
  const hit = Math.random() > 0.3;
  if (hit) {
    TANKBATTLE.scores[p.name] += 10;
    updateScoreChip(p.name, TANKBATTLE.scores[p.name]);
    playSound('win');
    shellStatus().innerHTML = `${p.emoji} <b>TARGET DESTROYED!</b> +10 pts`;
  } else {
    playSound('die');
    shellStatus().innerHTML = `❌ Shot missed!`;
  }

  setTimeout(() => {
    TANKBATTLE.idx = (TANKBATTLE.idx + 1) % State.playerCount;
    if (TANKBATTLE.idx === 0) {
      const s = Object.entries(TANKBATTLE.scores).sort((a, b) => b[1] - a[1]);
      showResult(TANKBATTLE.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      tankNext();
    }
  }, 1200);
}

// ── 74. PIXEL RACER ───────────────────────────────────────────
const PIXELRACER = {
  scores: {}, idx: 0, laps: 0,
};

function startPixelRacer() {
  PIXELRACER.scores = {};
  State.players.forEach(p => PIXELRACER.scores[p.name] = 0);
  PIXELRACER.idx = 0;
  shellSetup('🏎️ PIXEL RACER');
  buildScoreStrip('shell-scores', PIXELRACER.scores);
  pixelRacerNext();
}

function pixelRacerNext() {
  retroStop();
  PIXELRACER.laps = 0;
  const p = State.players[PIXELRACER.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Tap NITRO to complete 3 laps!`;
  shellFooter().innerHTML = `<button class="btn-primary" onclick="pixelNitro()">🏎️ NITRO BOOST</button>`;

  shellMain().innerHTML = `<div class="word-wrap"><div class="word-target" id="px-val">Laps: 0/3</div></div>`;
}

function pixelNitro() {
  PIXELRACER.laps++;
  const el = document.getElementById('px-val');
  if (el) el.textContent = `Laps: ${PIXELRACER.laps}/3`;
  playSound('match');

  if (PIXELRACER.laps >= 3) {
    const p = State.players[PIXELRACER.idx];
    PIXELRACER.scores[p.name] += 15;
    updateScoreChip(p.name, PIXELRACER.scores[p.name]);
    playSound('win');
    shellStatus().innerHTML = `${p.emoji} <b>FINISHED 1ST PLACE!</b> +15 pts`;

    setTimeout(() => {
      PIXELRACER.idx = (PIXELRACER.idx + 1) % State.playerCount;
      if (PIXELRACER.idx === 0) {
        const s = Object.entries(PIXELRACER.scores).sort((a, b) => b[1] - a[1]);
        showResult(PIXELRACER.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
      } else {
        pixelRacerNext();
      }
    }, 1200);
  }
}
