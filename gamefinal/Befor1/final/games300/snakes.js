/* ======================================================
   SNAKES – 1–2 players on one canvas
   P1: Arrow Keys | P2: WASD
   Eat food to grow. Collision = death.
   ====================================================== */

const SNAKE = {
  COLS: 20, ROWS: 20,
  CELL: 20,
  snakes:    [],
  food:      null,
  running:   false,
  gameLoop:  null,
  SPEED:     130, // ms per tick
  scores:    {},
};

const SNAKE_COLORS = [
  { head: '#ff4d6d', body: '#ff80a0' },
  { head: '#4db8ff', body: '#80d0ff' },
];

const DIR = {
  UP:    { x: 0,  y: -1 },
  DOWN:  { x: 0,  y:  1 },
  LEFT:  { x: -1, y:  0 },
  RIGHT: { x: 1,  y:  0 },
};

// ── ENTRY ──────────────────────────────────────────────
function startSnake() {
  showScreen('screen-snake');
  snakeStop();

  const canvas = document.getElementById('snakeCanvas');
  canvas.width  = SNAKE.COLS * SNAKE.CELL;
  canvas.height = SNAKE.ROWS * SNAKE.CELL;

  SNAKE.scores = {};
  State.players.slice(0, 2).forEach(p => SNAKE.scores[p.name] = 0);

  snakeBuildHud();
  snakeReset();
  snakeRender();

  document.getElementById('snake-start-btn').style.display = 'inline-flex';
  document.getElementById('snake-ctrl-note').textContent =
    State.playerCount >= 2
      ? 'P1: Arrow Keys | P2: W A S D or use touch D-Pad below'
      : 'Arrow Keys / WASD or touch D-Pad to move';

  // Render Virtual D-Pad for Mobile & Touchscreens
  renderVirtualDPad('snake-touch-pad', (dir) => {
    if (!SNAKE.snakes.length || !SNAKE.snakes[0].alive) return;
    const s1 = SNAKE.snakes[0];
    if (dir === 'up' && s1.dir.y === 0) s1.nextDir = DIR.UP;
    if (dir === 'down' && s1.dir.y === 0) s1.nextDir = DIR.DOWN;
    if (dir === 'left' && s1.dir.x === 0) s1.nextDir = DIR.LEFT;
    if (dir === 'right' && s1.dir.x === 0) s1.nextDir = DIR.RIGHT;
  });
}

function snakeBuildHud() {
  const hud = document.getElementById('snake-scores-hud');
  hud.innerHTML = '';
  const ps = State.players.slice(0, 2);
  ps.forEach((p, i) => {
    const chip = document.createElement('div');
    chip.className = 'score-chip';
    chip.innerHTML = `
      <div class="score-dot" style="background:${p.color}"></div>
      <span style="color:${p.color}">${p.name}</span>
      <span id="snake-score-${i}">0</span>
    `;
    hud.appendChild(chip);
  });
}

// ── RESET / INIT ───────────────────────────────────────
function snakeReset() {
  const count = Math.min(State.playerCount, 2);
  SNAKE.snakes = [];

  // P1 starts left side, P2 right side
  const starts = [
    { x: 4, y: 10 },
    { x: 15, y: 10 },
  ];
  const dirs = [DIR.RIGHT, DIR.LEFT];

  for (let i = 0; i < count; i++) {
    SNAKE.snakes.push({
      body:    [{ ...starts[i] }],
      dir:     { ...dirs[i] },
      nextDir: { ...dirs[i] },
      alive:   true,
      score:   0,
      colorIdx: i,
    });
  }

  snakeSpawnFood();
}

function snakeSpawnFood() {
  const occupied = new Set(
    SNAKE.snakes.flatMap(s => s.body.map(b => `${b.x},${b.y}`))
  );
  let fx, fy;
  do {
    fx = Math.floor(Math.random() * SNAKE.COLS);
    fy = Math.floor(Math.random() * SNAKE.ROWS);
  } while (occupied.has(`${fx},${fy}`));
  SNAKE.food = { x: fx, y: fy };
}

// ── START ──────────────────────────────────────────────
function snakeStart() {
  if (SNAKE.running) return;
  SNAKE.running = true;
  document.getElementById('snake-start-btn').style.display = 'none';
  playSound('start');
  SNAKE.gameLoop = setInterval(snakeTick, SNAKE.SPEED);
}

// ── TICK ───────────────────────────────────────────────
function snakeTick() {
  if (!SNAKE.running) return;

  let anyAlive = false;

  SNAKE.snakes.forEach((s, si) => {
    if (!s.alive) return;

    s.dir = { ...s.nextDir };
    const head  = s.body[0];
    const newHead = {
      x: ((head.x + s.dir.x) + SNAKE.COLS) % SNAKE.COLS,
      y: ((head.y + s.dir.y) + SNAKE.ROWS) % SNAKE.ROWS,
    };

    // Check self-collision
    if (s.body.some(b => b.x === newHead.x && b.y === newHead.y)) {
      s.alive = false;
      playSound('die');
      return;
    }

    // Check other snake collision
    SNAKE.snakes.forEach((other, oi) => {
      if (oi !== si && other.alive) {
        if (other.body.some(b => b.x === newHead.x && b.y === newHead.y)) {
          s.alive = false;
          playSound('die');
        }
      }
    });
    if (!s.alive) return;

    s.body.unshift(newHead);

    // Check food
    if (newHead.x === SNAKE.food.x && newHead.y === SNAKE.food.y) {
      s.score++;
      SNAKE.scores[State.players[si]?.name || `P${si+1}`] = s.score;
      const el = document.getElementById(`snake-score-${si}`);
      if (el) el.textContent = s.score;
      playSound('eat');
      snakeSpawnFood();
    } else {
      s.body.pop();
    }

    anyAlive = true;
  });

  snakeRender();

  if (!anyAlive) {
    snakeEndGame('all dead');
    return;
  }

  // If only 1 snake started and it died
  if (SNAKE.snakes.length === 1 && !SNAKE.snakes[0].alive) {
    snakeEndGame('dead');
    return;
  }

  // 2-snake: check if only 1 alive
  if (SNAKE.snakes.length === 2) {
    const alive = SNAKE.snakes.filter(s => s.alive);
    if (alive.length <= 1) {
      snakeEndGame('one alive');
      return;
    }
  }
}

// ── RENDER ─────────────────────────────────────────────
function snakeRender() {
  const canvas = document.getElementById('snakeCanvas');
  const ctx    = canvas.getContext('2d');
  const C      = SNAKE.CELL;

  // Background
  ctx.fillStyle = '#0d0d1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth   = 0.5;
  for (let x = 0; x <= SNAKE.COLS; x++) {
    ctx.beginPath(); ctx.moveTo(x * C, 0); ctx.lineTo(x * C, canvas.height); ctx.stroke();
  }
  for (let y = 0; y <= SNAKE.ROWS; y++) {
    ctx.beginPath(); ctx.moveTo(0, y * C); ctx.lineTo(canvas.width, y * C); ctx.stroke();
  }

  // Food
  if (SNAKE.food) {
    ctx.font = `${C - 2}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🍎', SNAKE.food.x * C + C/2, SNAKE.food.y * C + C/2);
  }

  // Snakes
  SNAKE.snakes.forEach((s, si) => {
    const colors = SNAKE_COLORS[si];
    s.body.forEach((seg, bi) => {
      const x = seg.x * C;
      const y = seg.y * C;

      if (!s.alive) {
        ctx.globalAlpha = 0.3;
      }

      if (bi === 0) {
        // Head
        ctx.fillStyle = colors.head;
        ctx.shadowColor = colors.head;
        ctx.shadowBlur  = 12;
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, C - 2, C - 2, 6);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Eyes
        ctx.fillStyle = '#fff';
        const ex = s.dir.x, ey = s.dir.y;
        const eyeOff = 4;
        let ex1, ey1, ex2, ey2;
        if (ex !== 0) {
          // moving horizontal
          ex1 = x + (ex > 0 ? C-6 : 3); ey1 = y + 4;
          ex2 = x + (ex > 0 ? C-6 : 3); ey2 = y + C - 7;
        } else {
          ex1 = x + 4;      ey1 = y + (ey > 0 ? C-6 : 3);
          ex2 = x + C - 7;  ey2 = y + (ey > 0 ? C-6 : 3);
        }
        ctx.beginPath(); ctx.arc(ex1 + 1.5, ey1 + 1.5, 2.5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(ex2 + 1.5, ey2 + 1.5, 2.5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(ex1 + 2, ey1 + 2, 1.2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(ex2 + 2, ey2 + 2, 1.2, 0, Math.PI*2); ctx.fill();
      } else {
        // Body
        const fade = Math.max(0.3, 1 - bi / (s.body.length * 1.5));
        ctx.fillStyle = colors.body;
        ctx.globalAlpha = s.alive ? fade : 0.15;
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, C - 4, C - 4, 4);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    });
  });
}

// ── END GAME ───────────────────────────────────────────
function snakeEndGame(reason) {
  snakeStop();

  setTimeout(() => {
    const sorted = Object.entries(SNAKE.scores).sort((a,b) => b[1]-a[1]);
    const isDraw = sorted.length > 1 && sorted[0][1] === sorted[1][1];
    showResult(SNAKE.scores, sorted[0]?.[0], isDraw);
  }, 600);
}

// ── STOP ───────────────────────────────────────────────
function snakeStop() {
  SNAKE.running = false;
  if (SNAKE.gameLoop) {
    clearInterval(SNAKE.gameLoop);
    SNAKE.gameLoop = null;
  }
}

// ── KEYBOARD ───────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (!SNAKE.running) return;

  const s0 = SNAKE.snakes[0];
  const s1 = SNAKE.snakes[1];

  if (s0 && s0.alive) {
    if (e.key === 'ArrowUp'    && s0.dir.y === 0) s0.nextDir = DIR.UP;
    if (e.key === 'ArrowDown'  && s0.dir.y === 0) s0.nextDir = DIR.DOWN;
    if (e.key === 'ArrowLeft'  && s0.dir.x === 0) s0.nextDir = DIR.LEFT;
    if (e.key === 'ArrowRight' && s0.dir.x === 0) s0.nextDir = DIR.RIGHT;
  }

  if (s1 && s1.alive && State.playerCount >= 2) {
    if (e.key === 'w' && s1.dir.y === 0) s1.nextDir = DIR.UP;
    if (e.key === 's' && s1.dir.y === 0) s1.nextDir = DIR.DOWN;
    if (e.key === 'a' && s1.dir.x === 0) s1.nextDir = DIR.LEFT;
    if (e.key === 'd' && s1.dir.x === 0) s1.nextDir = DIR.RIGHT;
  }

  // Prevent page scroll
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
    e.preventDefault();
  }
});
