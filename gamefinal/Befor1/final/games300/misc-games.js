/* ============================================================
   MISC GAMES – 7 mini games
   ❄️ Ice Block | 🚀 Rocket Launch | 🧲 Magnet Match | 🤹 Circus Catch | 🦘 Hop Scotch | 📍 Darts | 🂠 Solitaire
   ============================================================ */

let miscTimer = null;
function miscStop() {
  if (miscTimer) { clearInterval(miscTimer); miscTimer = null; }
}

// ── ❄️ ICE BLOCK ──────────────────────────────────────────────
const ICE = {
  scores: {}, idx: 0, round: 1, rounds: 4, grid: [], crackCount: 0,
};

function startIceBlock() {
  ICE.scores = {};
  State.players.forEach(p => ICE.scores[p.name] = 0);
  ICE.idx = 0; ICE.round = 1;
  shellSetup('❄️ ICE BLOCK');
  buildScoreStrip('shell-scores', ICE.scores);
  iceNext();
}

function iceNext() {
  miscStop();
  // 12 ice blocks, 2 trap blocks
  ICE.grid = Array.from({ length: 12 }, () => Math.random() < 0.25 ? 'trap' : 'safe');
  const p = State.players[ICE.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Tap safe ice blocks! Round ${ICE.round}/${ICE.rounds}`;

  let html = '<div class="ice-grid">';
  ICE.grid.forEach((type, i) => {
    html += `<button class="ice-tile" id="ice-${i}" onclick="iceClick(${i})">🧊</button>`;
  });
  html += '</div>';

  shellMain().innerHTML = html;
}

function iceClick(idx) {
  const btn = document.getElementById(`ice-${idx}`);
  if (!btn || btn.disabled) return;

  const type = ICE.grid[idx];
  const p = State.players[ICE.idx];

  if (type === 'trap') {
    btn.textContent = '🌊';
    btn.style.background = '#0055ff';
    playSound('die');
    shellStatus().innerHTML = `💥 <b>FELL THROUGH ICE!</b>`;

    setTimeout(() => {
      ICE.idx = (ICE.idx + 1) % State.playerCount;
      if (ICE.idx === 0) ICE.round++;
      if (ICE.round > ICE.rounds) {
        const s = Object.entries(ICE.scores).sort((a, b) => b[1] - a[1]);
        showResult(ICE.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
      } else {
        iceNext();
      }
    }, 1200);
  } else {
    btn.textContent = '❄️';
    btn.disabled = true;
    ICE.scores[p.name] += 3;
    updateScoreChip(p.name, ICE.scores[p.name]);
    playSound('match');
  }
}

// ── 🚀 ROCKET LAUNCH ──────────────────────────────────────────
const ROCKET = {
  scores: {}, idx: 0, round: 1, rounds: 3, thrust: 0, launched: false,
};

function startRocket() {
  ROCKET.scores = {};
  State.players.forEach(p => ROCKET.scores[p.name] = 0);
  ROCKET.idx = 0; ROCKET.round = 1;
  shellSetup('🚀 ROCKET LAUNCH');
  buildScoreStrip('shell-scores', ROCKET.scores);
  rocketNext();
}

function rocketNext() {
  miscStop();
  ROCKET.thrust = 0; ROCKET.launched = false;
  const p = State.players[ROCKET.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Hold THRUST then LAUNCH!`;

  shellMain().innerHTML = `
    <div class="rocket-wrap">
      <div class="rocket-disp" id="rkt-icon">🚀</div>
      <div class="thrust-bar-track"><div class="thrust-bar-fill" id="rkt-fill"></div></div>
      <div class="color-btns" style="margin-top:16px">
        <button class="btn-primary" style="background:var(--accent)" onclick="rocketThrust()">🔥 CHARGE</button>
        <button class="btn-primary" style="background:var(--p3);color:#000" onclick="rocketLaunch()">🚀 LAUNCH!</button>
      </div>
    </div>
  `;
}

function rocketThrust() {
  if (ROCKET.launched) return;
  ROCKET.thrust = Math.min(100, ROCKET.thrust + 15);
  const fill = document.getElementById('rkt-fill');
  if (fill) fill.style.width = `${ROCKET.thrust}%`;
  playSound('click');
}

function rocketLaunch() {
  if (ROCKET.launched) return;
  ROCKET.launched = true;
  const icon = document.getElementById('rkt-icon');
  const p = State.players[ROCKET.idx];

  if (ROCKET.thrust > 90) {
    // Overheated explosion
    if (icon) icon.textContent = '💥';
    playSound('die');
    shellStatus().innerHTML = `💥 <b>ENGINE OVERHEATED!</b>`;
  } else {
    // Good launch
    if (icon) icon.style.transform = 'translateY(-120px) scale(1.4)';
    const pts = Math.round(ROCKET.thrust / 5);
    ROCKET.scores[p.name] += pts;
    updateScoreChip(p.name, ROCKET.scores[p.name]);
    playSound('win');
    shellStatus().innerHTML = `🚀 <b>LAUNCHED TO ${ROCKET.thrust * 10}m!</b> +${pts} pts`;
  }

  setTimeout(() => {
    ROCKET.idx = (ROCKET.idx + 1) % State.playerCount;
    if (ROCKET.idx === 0) ROCKET.round++;
    if (ROCKET.round > ROCKET.rounds) {
      const s = Object.entries(ROCKET.scores).sort((a, b) => b[1] - a[1]);
      showResult(ROCKET.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      rocketNext();
    }
  }, 1400);
}

// ── 🧲 MAGNET MATCH ──────────────────────────────────────────
const MAGNET = {
  scores: {}, idx: 0, round: 1, rounds: 4, polarity: 'N',
};

function startMagnet() {
  MAGNET.scores = {};
  State.players.forEach(p => MAGNET.scores[p.name] = 0);
  MAGNET.idx = 0; MAGNET.round = 1;
  shellSetup('🧲 MAGNET MATCH');
  buildScoreStrip('shell-scores', MAGNET.scores);
  magnetNext();
}

function magnetNext() {
  miscStop();
  MAGNET.polarity = Math.random() > 0.5 ? 'N' : 'S';
  const target = Math.random() > 0.5 ? 'N' : 'S';
  const p = State.players[MAGNET.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Match opposite poles (N & S attract)!`;

  shellMain().innerHTML = `
    <div class="magnet-wrap">
      <div class="mag-node red" id="mag-target">${target}</div>
      <div class="mag-node blue" id="mag-user">${MAGNET.polarity}</div>
      <button class="btn-primary" style="margin-top:20px" onclick="magnetFlip()">FLIP POLE</button>
      <button class="btn-primary" style="background:var(--p3);color:#000" onclick="magnetConnect('${target}')">CONNECT</button>
    </div>
  `;
}

function magnetFlip() {
  MAGNET.polarity = MAGNET.polarity === 'N' ? 'S' : 'N';
  const userEl = document.getElementById('mag-user');
  if (userEl) userEl.textContent = MAGNET.polarity;
  playSound('click');
}

function magnetConnect(target) {
  const p = State.players[MAGNET.idx];
  if (MAGNET.polarity !== target) {
    // Opposite poles attract!
    MAGNET.scores[p.name] += 10;
    updateScoreChip(p.name, MAGNET.scores[p.name]);
    playSound('match');
    shellStatus().innerHTML = `🧲 <b>ATTRACTED!</b> +10 pts`;
  } else {
    // Same poles repel!
    playSound('die');
    shellStatus().innerHTML = `💥 <b>REPELLED!</b>`;
  }

  setTimeout(() => {
    MAGNET.idx = (MAGNET.idx + 1) % State.playerCount;
    if (MAGNET.idx === 0) MAGNET.round++;
    if (MAGNET.round > MAGNET.rounds) {
      const s = Object.entries(MAGNET.scores).sort((a, b) => b[1] - a[1]);
      showResult(MAGNET.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      magnetNext();
    }
  }, 1200);
}

// ── 🤹 CIRCUS CATCH ──────────────────────────────────────────
const CIRCUS = {
  scores: {}, idx: 0, round: 1, rounds: 3, basketX: 180, items: [], score: 0, running: false, frame: null,
};

function startCircus() {
  CIRCUS.scores = {};
  State.players.forEach(p => CIRCUS.scores[p.name] = 0);
  CIRCUS.idx = 0; CIRCUS.round = 1;
  shellSetup('🤹 CIRCUS CATCH', { useCanvas: true, cw: 360, ch: 280 });
  buildScoreStrip('shell-scores', CIRCUS.scores);
  circusNext();
}

function circusNext() {
  miscStop();
  CIRCUS.basketX = 180; CIRCUS.items = []; CIRCUS.score = 0; CIRCUS.running = true;
  const p = State.players[CIRCUS.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Move mouse / touch to catch items!`;

  const cv = shellCanvas();
  if (cv) {
    cv.onmousemove = (e) => {
      const rect = cv.getBoundingClientRect();
      CIRCUS.basketX = e.clientX - rect.left;
    };
  }

  let count = 0;
  miscTimer = setInterval(() => {
    if (count >= 12) { clearInterval(miscTimer); return; }
    CIRCUS.items.push({ x: 20 + Math.random() * 320, y: 0, icon: ['🎾', '🍎', '⭐'][Math.floor(Math.random() * 3)] });
    count++;
  }, 500);

  circusLoop();
}

function circusLoop() {
  if (!CIRCUS.running) return;
  const cv = shellCanvas(), ctx = shellCtx();
  if (!cv || !ctx) return;

  ctx.fillStyle = '#0d0d1a'; ctx.fillRect(0, 0, cv.width, cv.height);

  // Basket
  ctx.fillStyle = State.players[CIRCUS.idx].color;
  ctx.fillRect(CIRCUS.basketX - 25, cv.height - 20, 50, 15);

  // Items
  CIRCUS.items.forEach(item => {
    item.y += 3;
    ctx.font = '20px serif'; ctx.textAlign = 'center';
    ctx.fillText(item.icon, item.x, item.y);

    if (item.y >= cv.height - 25 && Math.abs(item.x - CIRCUS.basketX) < 30) {
      item.y = 999;
      CIRCUS.score += 5;
      playSound('match');
    }
  });

  CIRCUS.items = CIRCUS.items.filter(i => i.y < cv.height + 10);

  if (CIRCUS.items.length === 0 && !miscTimer) {
    CIRCUS.running = false;
    const p = State.players[CIRCUS.idx];
    CIRCUS.scores[p.name] += CIRCUS.score;
    updateScoreChip(p.name, CIRCUS.scores[p.name]);

    setTimeout(() => {
      CIRCUS.idx = (CIRCUS.idx + 1) % State.playerCount;
      if (CIRCUS.idx === 0) CIRCUS.round++;
      if (CIRCUS.round > CIRCUS.rounds) {
        const s = Object.entries(CIRCUS.scores).sort((a, b) => b[1] - a[1]);
        showResult(CIRCUS.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
      } else {
        circusNext();
      }
    }, 1000);
    return;
  }

  CIRCUS.frame = requestAnimationFrame(circusLoop);
}

// ── 🦘 HOPSCOTCH ──────────────────────────────────────────────
const HOPSCOTCH = {
  scores: {}, idx: 0, round: 1, rounds: 4, currentHop: 1,
};

function startHopscotch() {
  HOPSCOTCH.scores = {};
  State.players.forEach(p => HOPSCOTCH.scores[p.name] = 0);
  HOPSCOTCH.idx = 0; HOPSCOTCH.round = 1;
  shellSetup('🦘 HOPSCOTCH');
  buildScoreStrip('shell-scores', HOPSCOTCH.scores);
  hopNext();
}

function hopNext() {
  miscStop();
  HOPSCOTCH.currentHop = 1;
  const p = State.players[HOPSCOTCH.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Hop 1 to 6 in order!`;

  let html = '<div class="hop-grid">';
  for (let i = 1; i <= 6; i++) {
    html += `<button class="hop-tile" id="hop-${i}" onclick="hopClick(${i})">${i}</button>`;
  }
  html += '</div>';

  shellMain().innerHTML = html;
}

function hopClick(n) {
  if (n !== HOPSCOTCH.currentHop) {
    playSound('die');
    shellStatus().innerHTML = `💥 <b>Tripped!</b>`;
    setTimeout(() => {
      HOPSCOTCH.idx = (HOPSCOTCH.idx + 1) % State.playerCount;
      if (HOPSCOTCH.idx === 0) HOPSCOTCH.round++;
      if (HOPSCOTCH.round > HOPSCOTCH.rounds) {
        const s = Object.entries(HOPSCOTCH.scores).sort((a, b) => b[1] - a[1]);
        showResult(HOPSCOTCH.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
      } else {
        hopNext();
      }
    }, 1000);
    return;
  }

  const btn = document.getElementById(`hop-${n}`);
  if (btn) btn.style.background = State.players[HOPSCOTCH.idx].color;
  HOPSCOTCH.currentHop++;
  playSound('match');

  if (HOPSCOTCH.currentHop > 6) {
    const p = State.players[HOPSCOTCH.idx];
    HOPSCOTCH.scores[p.name] += 10;
    updateScoreChip(p.name, HOPSCOTCH.scores[p.name]);
    playSound('win');
    shellStatus().innerHTML = `🎉 <b>COMPLETED COURSE!</b> +10 pts`;

    setTimeout(() => {
      HOPSCOTCH.idx = (HOPSCOTCH.idx + 1) % State.playerCount;
      if (HOPSCOTCH.idx === 0) HOPSCOTCH.round++;
      if (HOPSCOTCH.round > HOPSCOTCH.rounds) {
        const s = Object.entries(HOPSCOTCH.scores).sort((a, b) => b[1] - a[1]);
        showResult(HOPSCOTCH.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
      } else {
        hopNext();
      }
    }, 1200);
  }
}

// ── 📍 DARTS ──────────────────────────────────────────────────
const DARTS = {
  scores: {}, idx: 0, round: 1, rounds: 3, dartX: 180, dartY: 140, dirX: 1, dirY: 1, phase: 'aimX',
};

function startDarts() {
  DARTS.scores = {};
  State.players.forEach(p => DARTS.scores[p.name] = 0);
  DARTS.idx = 0; DARTS.round = 1;
  shellSetup('📍 DARTS', { useCanvas: true, cw: 360, ch: 280 });
  buildScoreStrip('shell-scores', DARTS.scores);
  dartsNext();
}

function dartsNext() {
  miscStop();
  DARTS.dartX = 180; DARTS.dartY = 140; DARTS.dirX = 1; DARTS.dirY = 1; DARTS.phase = 'aimX';
  const p = State.players[DARTS.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Lock Horizontal Aim!`;
  shellFooter().innerHTML = `<button class="btn-primary" id="dart-btn" onclick="dartsAction()">📍 LOCK AIM</button>`;

  miscTimer = setInterval(() => {
    if (DARTS.phase === 'aimX') {
      DARTS.dartX += DARTS.dirX * 5;
      if (DARTS.dartX > 320 || DARTS.dartX < 40) DARTS.dirX *= -1;
    } else if (DARTS.phase === 'aimY') {
      DARTS.dartY += DARTS.dirY * 5;
      if (DARTS.dartY > 240 || DARTS.dartY < 40) DARTS.dirY *= -1;
    }
    dartsDraw();
  }, 25);
}

function dartsAction() {
  if (DARTS.phase === 'aimX') {
    DARTS.phase = 'aimY';
    shellStatus().innerHTML = `Lock Vertical Aim!`;
  } else if (DARTS.phase === 'aimY') {
    clearInterval(miscTimer);
    DARTS.phase = 'thrown';

    const dist = Math.hypot(DARTS.dartX - 180, DARTS.dartY - 140);
    let pts = 0;
    if (dist < 15) pts = 50;
    else if (dist < 40) pts = 25;
    else if (dist < 80) pts = 10;

    const p = State.players[DARTS.idx];
    DARTS.scores[p.name] += pts;
    updateScoreChip(p.name, DARTS.scores[p.name]);
    playSound(pts > 20 ? 'win' : 'match');
    shellStatus().innerHTML = `🎯 <b>THREW ${pts} PTS!</b>`;

    setTimeout(() => {
      DARTS.idx = (DARTS.idx + 1) % State.playerCount;
      if (DARTS.idx === 0) DARTS.round++;
      if (DARTS.round > DARTS.rounds) {
        const s = Object.entries(DARTS.scores).sort((a, b) => b[1] - a[1]);
        showResult(DARTS.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
      } else {
        dartsNext();
      }
    }, 1400);
  }
}

function dartsDraw() {
  const cv = shellCanvas(), ctx = shellCtx();
  if (!cv || !ctx) return;
  const cx = 180, cy = 140;

  ctx.fillStyle = '#0d0d1a'; ctx.fillRect(0, 0, cv.width, cv.height);

  // Target rings
  [120, 80, 40, 15].forEach((r, i) => {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = ['#1a1a35', '#4db8ff33', '#ffd44d44', '#ff4d6d'][i];
    ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
  });

  // Crosshairs / Dart
  ctx.strokeStyle = State.players[DARTS.idx].color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(DARTS.dartX, DARTS.dartY, 8, 0, Math.PI * 2); ctx.stroke();
}

// ── 🂠 SOLITAIRE ──────────────────────────────────────────────
const SOLITAIRE = {
  scores: {}, cards: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], expected: 1,
};

function startSolitaire() {
  SOLITAIRE.scores = {};
  State.players.forEach(p => SOLITAIRE.scores[p.name] = 0);
  SOLITAIRE.expected = 1;
  shellSetup('🂠 SOLITAIRE');
  buildScoreStrip('shell-scores', SOLITAIRE.scores);
  solitaireNext();
}

function solitaireNext() {
  miscStop();
  SOLITAIRE.cards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].sort(() => Math.random() - 0.5);
  const p = State.players[0];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Click cards 1 → 10 in order!`;

  let html = '<div class="sol-grid">';
  SOLITAIRE.cards.forEach(val => {
    html += `<button class="playing-card sol-card" id="sol-${val}" onclick="solClick(${val})">${val}</button>`;
  });
  html += '</div>';

  shellMain().innerHTML = html;
}

function solClick(val) {
  if (val !== SOLITAIRE.expected) {
    playSound('die');
    return;
  }
  const btn = document.getElementById(`sol-${val}`);
  if (btn) btn.disabled = true;
  SOLITAIRE.expected++;
  playSound('match');

  if (SOLITAIRE.expected > 10) {
    const p = State.players[0];
    SOLITAIRE.scores[p.name] = 20;
    updateScoreChip(p.name, 20);
    playSound('win');
    shellStatus().innerHTML = `🎉 <b>SOLITAIRE CLEARED!</b>`;

    setTimeout(() => {
      showResult(SOLITAIRE.scores, p.name, false);
    }, 1200);
  }
}
