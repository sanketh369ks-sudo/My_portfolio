/* ============================================================
   MUSIC GAMES – 2 mini games
   🎵 Simon Says | 🎸 Note Rush
   ============================================================ */

let musicTimer = null;
function musicStop() {
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
}

// ── 🎵 SIMON SAYS ────────────────────────────────────────────
const SIMON = {
  colors: ['red', 'blue', 'green', 'yellow'],
  sequence: [], playerSeq: [], scores: {}, round: 1, rounds: 4, idx: 0, userTurn: false,
};

function startSimon() {
  SIMON.scores = {};
  State.players.forEach(p => SIMON.scores[p.name] = 0);
  SIMON.round = 1; SIMON.idx = 0;
  shellSetup('🎵 SIMON SAYS');
  buildScoreStrip('shell-scores', SIMON.scores);
  simonRoundStart();
}

function simonRoundStart() {
  musicStop();
  SIMON.sequence = [];
  for (let i = 0; i < 3 + SIMON.round; i++) {
    SIMON.sequence.push(Math.floor(Math.random() * 4));
  }
  SIMON.playerSeq = [];
  SIMON.userTurn = false;

  const p = State.players[SIMON.idx];
  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Watch the sequence!`;

  shellMain().innerHTML = `
    <div class="simon-board">
      <button class="simon-btn red" id="simon-0" onclick="simonPress(0)"></button>
      <button class="simon-btn blue" id="simon-1" onclick="simonPress(1)"></button>
      <button class="simon-btn green" id="simon-2" onclick="simonPress(2)"></button>
      <button class="simon-btn yellow" id="simon-3" onclick="simonPress(3)"></button>
    </div>
  `;

  setTimeout(simonPlaySeq, 800);
}

function simonPlaySeq() {
  let step = 0;
  musicTimer = setInterval(() => {
    if (step >= SIMON.sequence.length) {
      clearInterval(musicTimer);
      SIMON.userTurn = true;
      const p = State.players[SIMON.idx];
      shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Your turn to repeat!`;
      return;
    }
    const colorIdx = SIMON.sequence[step];
    simonFlash(colorIdx);
    step++;
  }, 600);
}

function simonFlash(idx) {
  const btn = document.getElementById(`simon-${idx}`);
  if (!btn) return;
  btn.classList.add('lit');
  playSound('place');
  setTimeout(() => btn.classList.remove('lit'), 300);
}

function simonPress(idx) {
  if (!SIMON.userTurn) return;
  simonFlash(idx);
  SIMON.playerSeq.push(idx);

  const curStep = SIMON.playerSeq.length - 1;
  if (SIMON.playerSeq[curStep] !== SIMON.sequence[curStep]) {
    // Mistake
    SIMON.userTurn = false;
    playSound('die');
    shellStatus().innerHTML = `❌ Wrong sequence!`;
    setTimeout(simonAdvance, 1000);
    return;
  }

  if (SIMON.playerSeq.length === SIMON.sequence.length) {
    // Success
    SIMON.userTurn = false;
    const p = State.players[SIMON.idx];
    const pts = SIMON.sequence.length * 2;
    SIMON.scores[p.name] += pts;
    updateScoreChip(p.name, SIMON.scores[p.name]);
    playSound('win');
    shellStatus().innerHTML = `${p.emoji} <b>PERFECT!</b> +${pts} pts`;
    setTimeout(simonAdvance, 1200);
  }
}

function simonAdvance() {
  SIMON.idx = (SIMON.idx + 1) % State.playerCount;
  if (SIMON.idx === 0) SIMON.round++;
  if (SIMON.round > SIMON.rounds) {
    const s = Object.entries(SIMON.scores).sort((a, b) => b[1] - a[1]);
    showResult(SIMON.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
  } else {
    simonRoundStart();
  }
}

// ── 🎸 NOTE RUSH ──────────────────────────────────────────────
const NOTER = {
  scores: {}, round: 1, rounds: 4, idx: 0, notes: [], running: false, frame: null,
};

function startNoter() {
  NOTER.scores = {};
  State.players.forEach(p => NOTER.scores[p.name] = 0);
  NOTER.round = 1; NOTER.idx = 0;
  shellSetup('🎸 NOTE RUSH', { useCanvas: true, cw: 360, ch: 300 });
  buildScoreStrip('shell-scores', NOTER.scores);
  noterNext();
}

function noterNext() {
  musicStop();
  NOTER.notes = [];
  NOTER.running = true;

  const p = State.players[NOTER.idx];
  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Tap key when note hits bottom line!`;
  shellFooter().innerHTML = `<div class="noter-keys"><button class="btn-primary" onclick="noterHit(0)">Key 1</button><button class="btn-primary" onclick="noterHit(1)">Key 2</button><button class="btn-primary" onclick="noterHit(2)">Key 3</button></div>`;

  let spawned = 0;
  musicTimer = setInterval(() => {
    if (spawned >= 10) { clearInterval(musicTimer); return; }
    NOTER.notes.push({ lane: Math.floor(Math.random() * 3), y: 0, hit: false });
    spawned++;
  }, 700);

  noterLoop();
}

function noterLoop() {
  if (!NOTER.running) return;
  const cv = shellCanvas(), ctx = shellCtx();
  if (!cv || !ctx) return;

  ctx.fillStyle = '#0a0a1e';
  ctx.fillRect(0, 0, cv.width, cv.height);

  // Lanes
  const laneW = cv.width / 3;
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 2;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(i * laneW, 0); ctx.lineTo(i * laneW, cv.height); ctx.stroke();
  }

  // Hit bar
  const hitY = cv.height - 40;
  ctx.fillStyle = 'rgba(124,106,247,0.3)';
  ctx.fillRect(0, hitY - 10, cv.width, 20);
  ctx.strokeStyle = 'var(--accent)';
  ctx.strokeRect(0, hitY - 10, cv.width, 20);

  // Notes
  const colors = ['#ff4d6d', '#4db8ff', '#4dff91'];
  NOTER.notes.forEach(n => {
    if (n.hit) return;
    n.y += 3.5;
    ctx.beginPath();
    ctx.arc(n.lane * laneW + laneW / 2, n.y, 16, 0, Math.PI * 2);
    ctx.fillStyle = colors[n.lane];
    ctx.fill();
    ctx.shadowColor = colors[n.lane];
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  });

  NOTER.notes = NOTER.notes.filter(n => n.y < cv.height + 20);

  if (NOTER.notes.length === 0 && !musicTimer) {
    NOTER.running = false;
    setTimeout(() => {
      NOTER.idx = (NOTER.idx + 1) % State.playerCount;
      if (NOTER.idx === 0) NOTER.round++;
      if (NOTER.round > NOTER.rounds) {
        const s = Object.entries(NOTER.scores).sort((a, b) => b[1] - a[1]);
        showResult(NOTER.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
      } else {
        noterNext();
      }
    }, 1000);
    return;
  }

  NOTER.frame = requestAnimationFrame(noterLoop);
}

function noterHit(lane) {
  if (!NOTER.running) return;
  const cv = shellCanvas();
  const hitY = cv.height - 40;
  const p = State.players[NOTER.idx];

  const note = NOTER.notes.find(n => !n.hit && n.lane === lane && Math.abs(n.y - hitY) < 30);
  if (note) {
    note.hit = true;
    NOTER.scores[p.name] += 5;
    updateScoreChip(p.name, NOTER.scores[p.name]);
    playSound('match');
  } else {
    playSound('click');
  }
}
