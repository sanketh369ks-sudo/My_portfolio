/* ======================================================
   TUG OF WAR – 2 or 4 players
   P1 mashes Z  |  P2 mashes M
   (4P mode: P1+P3 vs P2+P4)
   
   A rope meter moves towards the faster masher.
   First team to pull 100% wins.
   ====================================================== */

const TUG = {
  pos:       0,      // -100 to +100, negative = P1 wins, positive = P2 wins
  WIN_POS:   90,
  keys:      {},
  tapCounts: [0, 0], // left team, right team
  running:   false,
  frame:     null,
  DECAY:     0.015,  // how fast the rope drifts back to center per frame
  lastTick:  0,
  scores:    {},
};

// ── ENTRY ──────────────────────────────────────────────
function startTug() {
  TUG.pos       = 0;
  TUG.keys      = {};
  TUG.tapCounts = [0, 0];
  TUG.running   = false;

  TUG.scores = {};
  State.players.forEach(p => TUG.scores[p.name] = 0);

  tugUpdateDisplay();
  tugUpdateInstruction();
  showScreen('screen-tug');

  const startBtn = document.getElementById('tug-start-btn');
  if (startBtn) startBtn.style.display = 'inline-flex';

  renderMultiplayerTouchBar('tug-touch-bar', State.playerCount, (playerIdx) => {
    if (!TUG.running) return;
    if (playerIdx === 0 || playerIdx === 2) {
      TUG.pos -= 5;
      TUG.tapCounts[0]++;
      tugRipple('left');
      playSound('click');
    } else {
      TUG.pos += 5;
      TUG.tapCounts[1]++;
      tugRipple('right');
      playSound('click');
    }
  });
}

function tugStop() {
  TUG.running = false;
  if (TUG.frame) { cancelAnimationFrame(TUG.frame); TUG.frame = null; }
}

// ── INSTRUCTION ────────────────────────────────────────
function tugUpdateInstruction() {
  const infoEl = document.getElementById('tug-info');
  if (!infoEl) return;

  const p1 = State.players[0];
  const p2 = State.players[1];

  if (State.playerCount <= 2) {
    infoEl.innerHTML = `
      <span style="color:${p1.color}">${p1.emoji} ${p1.name}: <b>Z</b></span>
      &nbsp;vs&nbsp;
      <span style="color:${p2.color}">${p2.emoji} ${p2.name}: <b>M</b></span>
    `;
  } else {
    const p3 = State.players[2];
    const p4 = State.players[3];
    infoEl.innerHTML = `
      <span style="color:${p1.color}">${p1.emoji}<b>Z</b></span>
      <span style="color:${p3.color}">${p3.emoji}<b>Q</b></span>
      &nbsp;⚔️&nbsp;
      <span style="color:${p2.color}">${p2.emoji}<b>M</b></span>
      <span style="color:${p4.color}">${p4.emoji}<b>P</b></span>
    `;
  }
}

// ── START ──────────────────────────────────────────────
function tugBegin() {
  TUG.pos       = 0;
  TUG.tapCounts = [0, 0];
  TUG.running   = true;
  TUG.lastTick  = performance.now();

  const startBtn = document.getElementById('tug-start-btn');
  if (startBtn) startBtn.style.display = 'none';

  playSound('start');
  tugLoop();
}

// ── GAME LOOP ──────────────────────────────────────────
function tugLoop() {
  if (!TUG.running) return;

  const now = performance.now();
  const dt  = (now - TUG.lastTick) / 1000;
  TUG.lastTick = now;

  // Decay toward center slightly
  if (Math.abs(TUG.pos) > 0.5) {
    TUG.pos *= (1 - TUG.DECAY);
  }

  // CPU pulling right side
  if (State.players[1] && State.players[1].name.startsWith('CPU')) {
    TUG.pos += 0.35 + Math.random() * 0.4;
    TUG.tapCounts[1]++;
  }

  tugUpdateDisplay();

  // Check win
  if (TUG.pos <= -TUG.WIN_POS) {
    tugEndGame(0); // Left team wins
    return;
  }
  if (TUG.pos >= TUG.WIN_POS) {
    tugEndGame(1); // Right team wins
    return;
  }

  TUG.frame = requestAnimationFrame(tugLoop);
}

// ── KEY HANDLER ────────────────────────────────────────
document.addEventListener('keydown', e => {
  const screen = document.getElementById('screen-tug');
  if (!screen || !screen.classList.contains('active')) return;

  const key = e.key.toLowerCase();

  // Left team: Z (P1) and Q (P3)
  if (key === 'z' || (key === 'q' && State.playerCount >= 3)) {
    if (!TUG.running) return;
    TUG.pos -= 5;
    TUG.tapCounts[0]++;
    tugRipple('left');
    playSound('click');
  }

  // Right team: M (P2) and P (P4)
  if (key === 'm' || (key === 'p' && State.playerCount >= 4)) {
    if (!TUG.running) return;
    TUG.pos += 5;
    TUG.tapCounts[1]++;
    tugRipple('right');
    playSound('click');
  }
});

// ── DISPLAY ────────────────────────────────────────────
function tugUpdateDisplay() {
  const bar  = document.getElementById('tug-bar-fill');
  const knot = document.getElementById('tug-knot');
  const p1el = document.getElementById('tug-p1-count');
  const p2el = document.getElementById('tug-p2-count');

  if (!bar || !knot) return;

  // Map pos (-90..+90) to 5%..95%
  const pct   = ((TUG.pos + TUG.WIN_POS) / (TUG.WIN_POS * 2)) * 90 + 5;
  const clamp = Math.max(5, Math.min(95, pct));

  bar.style.width = `${clamp}%`;

  // Bar color: blend between P1 (red) and P2 (blue) based on position
  const leftHue  = TUG.pos < 0 ? '#ff4d6d' : '#4db8ff';
  bar.style.background = `linear-gradient(90deg, var(--p1) 0%, ${leftHue} 50%, var(--p2) 100%)`;

  // Knot position
  knot.style.left = `${clamp}%`;

  // Tension color on knot
  const tension = Math.abs(TUG.pos) / TUG.WIN_POS;
  knot.style.background = `hsl(${30 + tension * 30}, 90%, 60%)`;
  knot.style.boxShadow  = `0 0 ${10 + tension * 20}px hsl(${30 + tension * 30}, 90%, 60%)`;

  if (p1el) p1el.textContent = TUG.tapCounts[0];
  if (p2el) p2el.textContent = TUG.tapCounts[1];
}

function tugRipple(side) {
  const id = side === 'left' ? 'tug-left-zone' : 'tug-right-zone';
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('tug-tap-flash');
  void el.offsetWidth; // force reflow
  el.classList.add('tug-tap-flash');
}

// ── END ────────────────────────────────────────────────
function tugEndGame(team) {
  tugStop();

  // Team 0 = P1 + P3, Team 1 = P2 + P4
  const winners = team === 0
    ? [State.players[0], State.players[2]].filter(Boolean)
    : [State.players[1], State.players[3]].filter(Boolean);

  const loserTeam = team === 0
    ? [State.players[1], State.players[3]].filter(Boolean)
    : [State.players[0], State.players[2]].filter(Boolean);

  winners.forEach(p  => TUG.scores[p.name] = 10);
  loserTeam.forEach(p => TUG.scores[p.name] = 2);

  playSound('win');

  setTimeout(() => {
    const sorted = Object.entries(TUG.scores).sort((a,b) => b[1]-a[1]);
    showResult(TUG.scores, winners[0].name, false);
  }, 400);
}
