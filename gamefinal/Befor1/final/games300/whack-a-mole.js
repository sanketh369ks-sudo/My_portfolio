/* ======================================================
   WHACK-A-MOLE – 1–4 players, each takes a turn
   30 seconds per player. Most whacks wins.
   ====================================================== */

const WAM = {
  scores:       {},
  currentIdx:   0,
  timer:        30,
  timerInt:     null,
  moleInt:      null,
  moleHoles:    [0,1,2,3,4,5,6,7,8],
  activeMoles:  new Set(),
  running:      false,
  moleEmojis:   ['🐹','🐭','🦔'],
};

// ── ENTRY ──────────────────────────────────────────────
function startWAM() {
  WAM.scores = {};
  State.players.forEach(p => WAM.scores[p.name] = 0);
  WAM.currentIdx = 0;
  WAM.running    = false;

  buildWAMHud();
  buildWAMGrid();
  showWAMInstructions();
  showScreen('screen-wam');
}

function buildWAMHud() {
  const hud = document.getElementById('wam-scores-hud');
  hud.innerHTML = '';
  State.players.forEach(p => {
    const div = document.createElement('div');
    div.className = 'wam-score-item';
    div.innerHTML = `
      <span class="wam-score-name" style="color:${p.color}">${p.emoji} ${p.name}</span>
      <span class="wam-score-val" id="wam-val-${p.name.replace(/\s/g,'_')}" style="color:${p.color}">0</span>
    `;
    hud.appendChild(div);
  });
}

function buildWAMGrid() {
  const grid = document.getElementById('wam-grid');
  grid.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const hole = document.createElement('div');
    hole.className   = 'wam-hole';
    hole.id          = `wam-hole-${i}`;
    hole.dataset.idx = i;
    hole.textContent = '🕳️';
    hole.addEventListener('click', () => wamClick(i));
    grid.appendChild(hole);
  }
}

function showWAMInstructions() {
  const p = State.players[WAM.currentIdx];
  document.getElementById('wam-instructions').style.display = 'flex';
  document.getElementById('wam-grid').style.display = 'none';
  document.getElementById('wam-player-instruction').textContent =
    `${p ? p.emoji : '🎮'} ${p ? p.name : 'Player'} – Get ready! You have 30 seconds.`;
  document.getElementById('wam-timer').textContent = '30';

  if (p && p.name && p.name.startsWith('CPU')) {
    setTimeout(() => {
      if (!WAM.running) wamStart();
    }, 800);
  }
}

// ── START TURN ─────────────────────────────────────────
function wamStart() {
  const p         = State.players[WAM.currentIdx];
  WAM.timer       = 30;
  WAM.running     = true;
  WAM.activeMoles = new Set();

  document.getElementById('wam-instructions').style.display = 'none';
  document.getElementById('wam-grid').style.display         = 'grid';

  playSound('start');
  wamResetGrid();

  // Countdown timer
  WAM.timerInt = setInterval(() => {
    WAM.timer--;
    document.getElementById('wam-timer').textContent = WAM.timer;
    if (WAM.timer <= 0) wamEndTurn();
  }, 1000);

  // Spawn moles
  wamSpawnMole();
  WAM.moleInt = setInterval(wamSpawnMole, 900);
}

function wamResetGrid() {
  for (let i = 0; i < 9; i++) {
    const hole = document.getElementById(`wam-hole-${i}`);
    if (hole) {
      hole.textContent = '🕳️';
      hole.classList.remove('mole-active','whacked');
    }
  }
}

// ── SPAWN MOLE ─────────────────────────────────────────
function wamSpawnMole() {
  if (!WAM.running) return;

  // Clear old moles that have been up too long
  WAM.activeMoles.forEach(idx => {
    const hole = document.getElementById(`wam-hole-${idx}`);
    if (hole && hole.classList.contains('mole-active')) {
      // 30% chance to hide naturally
      if (Math.random() < 0.3) {
        hole.textContent = '🕳️';
        hole.classList.remove('mole-active');
        WAM.activeMoles.delete(idx);
      }
    }
  });

  // Pick random empty hole
  const empty = WAM.moleHoles.filter(i => !WAM.activeMoles.has(i));
  if (empty.length === 0) return;

  const idx  = empty[Math.floor(Math.random() * empty.length)];
  const hole = document.getElementById(`wam-hole-${idx}`);
  if (!hole) return;

  const emoji = WAM.moleEmojis[Math.floor(Math.random() * WAM.moleEmojis.length)];
  hole.textContent = emoji;
  hole.classList.add('mole-active');
  WAM.activeMoles.add(idx);

  // CPU Auto hit
  const p = State.players[WAM.currentIdx];
  if (p && p.name && p.name.startsWith('CPU') && Math.random() < 0.75) {
    setTimeout(() => {
      if (WAM.running && hole.classList.contains('mole-active')) {
        wamClick(idx);
      }
    }, 200 + Math.random() * 400);
  }

  // Auto-hide after 1.2s
  setTimeout(() => {
    if (hole.classList.contains('mole-active')) {
      hole.textContent = '🕳️';
      hole.classList.remove('mole-active');
      WAM.activeMoles.delete(idx);
    }
  }, 1200);
}

// ── CLICK HANDLER ──────────────────────────────────────
function wamClick(idx) {
  if (!WAM.running) return;
  const hole = document.getElementById(`wam-hole-${idx}`);
  if (!hole || !hole.classList.contains('mole-active')) return;

  // Hit!
  const p = State.players[WAM.currentIdx];
  WAM.scores[p.name]++;

  const scoreEl = document.getElementById(`wam-val-${p.name.replace(/\s/g,'_')}`);
  if (scoreEl) scoreEl.textContent = WAM.scores[p.name];

  hole.textContent = '💥';
  hole.classList.remove('mole-active');
  hole.classList.add('whacked');
  WAM.activeMoles.delete(idx);

  setTimeout(() => {
    hole.textContent = '🕳️';
    hole.classList.remove('whacked');
  }, 300);

  playSound('whack');
}

// ── END TURN ───────────────────────────────────────────
function wamEndTurn() {
  clearInterval(WAM.timerInt);
  clearInterval(WAM.moleInt);
  WAM.running = false;
  wamResetGrid();

  WAM.currentIdx++;

  if (WAM.currentIdx >= State.playerCount) {
    // All players done – show results
    setTimeout(() => {
      const sorted = Object.entries(WAM.scores).sort((a,b) => b[1]-a[1]);
      const isDraw = sorted.length > 1 && sorted[0][1] === sorted[1][1];
      showResult(WAM.scores, sorted[0][0], isDraw);
    }, 400);
  } else {
    // Next player's turn
    showWAMInstructions();
  }
}

// ── STOP (when quitting) ───────────────────────────────
function wamStop() {
  clearInterval(WAM.timerInt);
  clearInterval(WAM.moleInt);
  WAM.running = false;
}
