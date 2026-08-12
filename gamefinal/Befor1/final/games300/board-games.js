/* ============================================================
   BOARD GAMES – 3 mini games
   🐍 Ladder | 🌀 Spin the Wheel | 🧩 Slide Puzzle
   ============================================================ */

let boardTimer = null;
function boardStop() {
  if (boardTimer) { clearInterval(boardTimer); boardTimer = null; }
}

// ── 🐍 LADDER (Snakes & Ladders) ─────────────────────────────
const SL = {
  pos: {}, scores: {}, idx: 0, winner: null,
  LADDERS: { 4: 14, 9: 31, 20: 38, 28: 84 },
  SNAKES: { 17: 7, 54: 34, 62: 19, 87: 24, 95: 75, 98: 79 },
};

function startSnakeLadder() {
  SL.scores = {}; SL.pos = {};
  State.players.forEach(p => { SL.scores[p.name] = 0; SL.pos[p.name] = 1; });
  SL.idx = 0; SL.winner = null;
  shellSetup('🐍 LADDER BOARD', { useCanvas: true, cw: 360, ch: 300 });
  buildScoreStrip('shell-scores', SL.scores);
  slRender();
}

function slRender() {
  boardStop();
  const p = State.players[SL.idx];
  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b>'s Turn – Roll the die!`;
  shellFooter().innerHTML = `<button class="btn-primary" onclick="slRoll()">🎲 ROLL DIE</button>`;
  slDrawBoard();
}

function slRoll() {
  const p = State.players[SL.idx];
  const roll = Math.floor(Math.random() * 6) + 1;
  playSound('start');
  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> rolled a <b>${roll}</b>!`;

  let newPos = (SL.pos[p.name] || 1) + roll;
  if (newPos > 100) newPos = SL.pos[p.name]; // Exact roll needed for 100

  if (SL.LADDERS[newPos]) {
    newPos = SL.LADDERS[newPos];
    playSound('match');
    shellStatus().innerHTML += ` &rarr; 🪜 Climbed to ${newPos}!`;
  } else if (SL.SNAKES[newPos]) {
    newPos = SL.SNAKES[newPos];
    playSound('die');
    shellStatus().innerHTML += ` &rarr; 🐍 Slid down to ${newPos}!`;
  }

  SL.pos[p.name] = newPos;
  SL.scores[p.name] = newPos;
  updateScoreChip(p.name, newPos);
  slDrawBoard();

  if (newPos >= 100) {
    SL.winner = p.name;
    setTimeout(() => {
      showResult(SL.scores, p.name, false);
    }, 1200);
    return;
  }

  setTimeout(() => {
    SL.idx = (SL.idx + 1) % State.playerCount;
    slRender();
  }, 1400);
}

function slDrawBoard() {
  const cv = shellCanvas(), ctx = shellCtx();
  if (!cv || !ctx) return;
  const W = cv.width, H = cv.height;

  ctx.fillStyle = '#0d0d1a'; ctx.fillRect(0, 0, W, H);

  // 10x10 Grid representation
  const size = 26; const offX = (W - size * 10) / 2; const offY = 10;
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const num = (9 - r) * 10 + (r % 2 === 0 ? c + 1 : 10 - c);
      const x = offX + c * size, y = offY + r * size;
      ctx.fillStyle = (r + c) % 2 === 0 ? '#1a1a35' : '#22224a';
      ctx.fillRect(x, y, size - 1, size - 1);
      ctx.fillStyle = '#555'; ctx.font = '8px Nunito'; ctx.textAlign = 'left';
      ctx.fillText(num, x + 2, y + 9);
    }
  }

  // Draw Player Tokens
  State.players.forEach((p, i) => {
    const pos = SL.pos[p.name] || 1;
    const numIdx = pos - 1;
    const r = 9 - Math.floor(numIdx / 10);
    const cRem = numIdx % 10;
    const c = r % 2 === 0 ? cRem : 9 - cRem;
    const x = offX + c * size + size / 2 + (i * 4 - 6);
    const y = offY + r * size + size / 2;

    ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fillStyle = p.color; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
  });
}

// ── 🌀 SPIN THE WHEEL ─────────────────────────────────────────
const WHEEL = {
  scores: {}, round: 1, rounds: 3, idx: 0, spinning: false, angle: 0,
  SLOTS: [10, 50, 0, 100, 20, 5, 200, 30],
};

function startSpinWheel() {
  WHEEL.scores = {};
  State.players.forEach(p => WHEEL.scores[p.name] = 0);
  WHEEL.round = 1; WHEEL.idx = 0; WHEEL.spinning = false; WHEEL.angle = 0;
  shellSetup('🌀 SPIN THE WHEEL', { useCanvas: true, cw: 340, ch: 280 });
  buildScoreStrip('shell-scores', WHEEL.scores);
  wheelRender();
}

function wheelRender() {
  boardStop();
  const p = State.players[WHEEL.idx];
  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Round ${WHEEL.round}/${WHEEL.rounds}`;
  shellFooter().innerHTML = `<button class="btn-primary" onclick="wheelSpin()">🌀 SPIN!</button>`;
  wheelDraw();
}

function wheelSpin() {
  if (WHEEL.spinning) return;
  WHEEL.spinning = true;
  playSound('start');

  const addRot = Math.PI * 6 + Math.random() * Math.PI * 2;
  const startAng = WHEEL.angle;
  let t = 0;

  boardTimer = setInterval(() => {
    t += 0.04;
    const ease = 1 - Math.pow(1 - Math.min(1, t / 3), 3);
    WHEEL.angle = startAng + addRot * ease;
    wheelDraw();

    if (t >= 3) {
      clearInterval(boardTimer);
      WHEEL.spinning = false;
      const numSlots = WHEEL.SLOTS.length;
      const normalized = (WHEEL.angle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      const slotIdx = Math.floor(((Math.PI * 2 - normalized + Math.PI / 2) % (Math.PI * 2)) / (Math.PI * 2 / numSlots));
      const pts = WHEEL.SLOTS[slotIdx % numSlots];

      const p = State.players[WHEEL.idx];
      WHEEL.scores[p.name] += pts;
      updateScoreChip(p.name, WHEEL.scores[p.name]);
      playSound(pts > 50 ? 'win' : 'match');
      shellStatus().innerHTML = `${p.emoji} <b>Landed on ${pts} pts!</b>`;

      setTimeout(() => {
        WHEEL.idx = (WHEEL.idx + 1) % State.playerCount;
        if (WHEEL.idx === 0) WHEEL.round++;
        if (WHEEL.round > WHEEL.rounds) {
          const s = Object.entries(WHEEL.scores).sort((a, b) => b[1] - a[1]);
          showResult(WHEEL.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
        } else {
          wheelRender();
        }
      }, 1400);
    }
  }, 30);
}

function wheelDraw() {
  const cv = shellCanvas(), ctx = shellCtx();
  if (!cv || !ctx) return;
  const W = cv.width, H = cv.height;
  const cx = W / 2, cy = H / 2, r = 110;
  const numSlots = WHEEL.SLOTS.length;
  const arc = (Math.PI * 2) / numSlots;

  ctx.fillStyle = '#0d0d1a'; ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(WHEEL.angle);

  const colors = ['#ff4d6d', '#4db8ff', '#4dff91', '#ffd44d', '#c86ef5', '#7c6af7', '#ff914d', '#00f5d4'];

  for (let i = 0; i < numSlots; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, i * arc, (i + 1) * arc);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();

    ctx.save();
    ctx.rotate(i * arc + arc / 2);
    ctx.fillStyle = '#000'; ctx.font = 'bold 14px Nunito'; ctx.textAlign = 'right';
    ctx.fillText(WHEEL.SLOTS[i], r - 15, 5);
    ctx.restore();
  }
  ctx.restore();

  // Pointer indicator
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy - r - 10);
  ctx.lineTo(cx + 12, cy - r - 10);
  ctx.lineTo(cx, cy - r + 10);
  ctx.fillStyle = '#fff'; ctx.fill();
}

// ── 🧩 SLIDE PUZZLE ───────────────────────────────────────────
const PUZZLE = {
  board: [1, 2, 3, 4, 5, 6, 7, 8, 0], scores: {}, idx: 0, startTime: 0,
};

function startSlidePuzz() {
  PUZZLE.scores = {};
  State.players.forEach(p => PUZZLE.scores[p.name] = 0);
  PUZZLE.idx = 0;
  shellSetup('🧩 SLIDE PUZZLE');
  buildScoreStrip('shell-scores', PUZZLE.scores);
  puzzNext();
}

function puzzNext() {
  boardStop();
  PUZZLE.board = [1, 2, 3, 4, 5, 6, 7, 8, 0].sort(() => Math.random() - 0.5);
  PUZZLE.startTime = performance.now();
  const p = State.players[PUZZLE.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Slide tiles in order 1–8!`;
  puzzRenderGrid();
}

function puzzRenderGrid() {
  let html = '<div class="puzz-grid">';
  PUZZLE.board.forEach((val, i) => {
    if (val === 0) {
      html += `<div class="puzz-tile empty"></div>`;
    } else {
      html += `<button class="puzz-tile" onclick="puzzClick(${i})">${val}</button>`;
    }
  });
  html += '</div>';
  shellMain().innerHTML = html;
}

function puzzClick(idx) {
  const emptyIdx = PUZZLE.board.indexOf(0);
  const row = Math.floor(idx / 3), col = idx % 3;
  const eRow = Math.floor(emptyIdx / 3), eCol = emptyIdx % 3;

  if (Math.abs(row - eRow) + Math.abs(col - eCol) === 1) {
    // Swap
    PUZZLE.board[emptyIdx] = PUZZLE.board[idx];
    PUZZLE.board[idx] = 0;
    playSound('flip');
    puzzRenderGrid();

    // Check Win
    const win = PUZZLE.board.slice(0, 8).every((v, i) => v === i + 1);
    if (win) {
      const p = State.players[PUZZLE.idx];
      const time = ((performance.now() - PUZZLE.startTime) / 1000).toFixed(1);
      const pts = Math.max(5, Math.round(50 - parseFloat(time)));
      PUZZLE.scores[p.name] += pts;
      updateScoreChip(p.name, PUZZLE.scores[p.name]);
      playSound('win');
      shellStatus().innerHTML = `${p.emoji} <b>Solved in ${time}s!</b> +${pts} pts`;

      setTimeout(() => {
        PUZZLE.idx = (PUZZLE.idx + 1) % State.playerCount;
        if (PUZZLE.idx === 0) {
          const s = Object.entries(PUZZLE.scores).sort((a, b) => b[1] - a[1]);
          showResult(PUZZLE.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
        } else {
          puzzNext();
        }
      }, 1400);
    }
  }
}
