/* ============================================================
   BATTLE GAMES – 5 mini games
   ⚔️ Sword Duel | 🥊 Boxing | 🏋️ Weight Lifting | 🎨 Paint Fight | 🎆 Fireworks
   ============================================================ */

let battleTimer = null;
function battleStop() {
  if (battleTimer) { clearInterval(battleTimer); battleTimer = null; }
}

// ── ⚔️ SWORD DUEL ─────────────────────────────────────────────
const SWORD = {
  scores: {}, round: 1, rounds: 5, state: 'wait', winner: null,
  KEYS: ['z', 'm', 'q', 'p'],
};

function startSwordDuel() {
  SWORD.scores = {};
  State.players.forEach(p => SWORD.scores[p.name] = 0);
  SWORD.round = 1;
  shellSetup('⚔️ SWORD DUEL');
  buildScoreStrip('shell-scores', SWORD.scores);
  swordNext();
}

function swordNext() {
  battleStop();
  SWORD.state = 'wait'; SWORD.winner = null;

  shellStatus().innerHTML = `Round ${SWORD.round}/${SWORD.rounds} – Wait for ⚡ CLASH ⚡!`;

  shellMain().innerHTML = `
    <div class="battle-wrap">
      <div class="battle-sig" id="sword-sig" style="cursor:pointer;">🛡️</div>
      <div class="react-keys" id="sword-keys"></div>
    </div>
  `;

  const k = document.getElementById('sword-keys');
  if (k) {
    State.players.forEach((p, i) => {
      k.innerHTML += `<span style="color:${p.color}">${p.emoji} <kbd>${SWORD.KEYS[i].toUpperCase()}</kbd></span>`;
    });
  }

  const sig = document.getElementById('sword-sig');
  if (sig) {
    sig.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      triggerSwordStrike(0);
    });
  }

  renderMultiplayerTouchBar('shell-footer', State.playerCount, (pIdx) => {
    triggerSwordStrike(pIdx);
  });

  const delay = 1500 + Math.random() * 3000;
  battleTimer = setTimeout(() => {
    SWORD.state = 'strike';
    const sig = document.getElementById('sword-sig');
    if (sig) { sig.textContent = '⚔️ CLASH!'; sig.style.transform = 'scale(1.4)'; }
    playSound('start');

    // CPU auto strike
    State.players.forEach((p, i) => {
      if (p.name.startsWith('CPU')) {
        setTimeout(() => {
          if (SWORD.state === 'strike' && !SWORD.winner) triggerSwordStrike(i);
        }, 250 + Math.random() * 300);
      }
    });
  }, delay);
}

function triggerSwordStrike(i) {
  if (i < 0 || i >= State.playerCount || SWORD.winner) return;
  const p = State.players[i];
  if (SWORD.state === 'wait') {
    // Early strike penalty
    SWORD.scores[p.name] = Math.max(0, SWORD.scores[p.name] - 2);
    updateScoreChip(p.name, SWORD.scores[p.name]);
    playSound('die');
    shellStatus().innerHTML = `${p.emoji} <b>Fouled! Striked too early!</b>`;
  } else if (SWORD.state === 'strike') {
    // Winner of clash!
    SWORD.winner = p.name;
    SWORD.scores[p.name] += 10;
    updateScoreChip(p.name, SWORD.scores[p.name]);
    playSound('win');
    const sig = document.getElementById('sword-sig');
    if (sig) sig.textContent = '💥 SLASH!';
    shellStatus().innerHTML = `${p.emoji} <b>${p.name} SLASHED FIRST!</b> +10 pts`;

    setTimeout(() => {
      SWORD.round++;
      if (SWORD.round > SWORD.rounds) {
        const s = Object.entries(SWORD.scores).sort((a, b) => b[1] - a[1]);
        showResult(SWORD.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
      } else {
        swordNext();
      }
    }, 1400);
  }
}

document.addEventListener('keydown', e => {
  if (!document.getElementById('screen-shell')?.classList.contains('active')) return;
  if (State.currentGame?.id !== 'swordduel') return;

  const key = e.key.toLowerCase();
  SWORD.KEYS.slice(0, State.playerCount).forEach((bk, i) => {
    if (key === bk && !SWORD.winner) {
      const p = State.players[i];
      if (SWORD.state === 'wait') {
        // Early strike penalty
        SWORD.scores[p.name] = Math.max(0, SWORD.scores[p.name] - 2);
        updateScoreChip(p.name, SWORD.scores[p.name]);
        playSound('die');
        shellStatus().innerHTML = `${p.emoji} <b>Fouled! Striked too early!</b>`;
      } else if (SWORD.state === 'strike') {
        // Winner of clash!
        SWORD.winner = p.name;
        SWORD.scores[p.name] += 10;
        updateScoreChip(p.name, SWORD.scores[p.name]);
        playSound('win');
        const sig = document.getElementById('sword-sig');
        if (sig) sig.textContent = '💥 SLASH!';
        shellStatus().innerHTML = `${p.emoji} <b>${p.name} SLASHED FIRST!</b> +10 pts`;

        setTimeout(() => {
          SWORD.round++;
          if (SWORD.round > SWORD.rounds) {
            const s = Object.entries(SWORD.scores).sort((a, b) => b[1] - a[1]);
            showResult(SWORD.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
          } else {
            swordNext();
          }
        }, 1400);
      }
    }
  });
});

// ── 🥊 BOXING ────────────────────────────────────────────────
const BOXING = {
  scores: {}, health: [100, 100], running: false,
};

function startBoxing() {
  BOXING.scores = {};
  State.players.forEach(p => BOXING.scores[p.name] = 0);
  BOXING.health = [100, 100];
  shellSetup('🥊 BOXING');
  buildScoreStrip('shell-scores', BOXING.scores);
  boxingRender();
}

function boxingRender() {
  battleStop();
  BOXING.running = true;
  const p1 = State.players[0], p2 = State.players[1] || { name: 'CPU', color: '#4db8ff', emoji: '🤖' };

  shellStatus().innerHTML = `Mash button or key to punch!`;

  shellMain().innerHTML = `
    <div class="boxing-wrap">
      <div class="boxer-col">
        <div style="color:${p1.color}">${p1.emoji} ${p1.name} (<kbd>Z</kbd>)</div>
        <div class="hp-bar"><div class="hp-fill" id="hp-p1" style="width:${BOXING.health[0]}%;background:${p1.color}"></div></div>
      </div>
      <div class="boxer-col">
        <div style="color:${p2.color}">${p2.emoji} ${p2.name} (<kbd>M</kbd>)</div>
        <div class="hp-bar"><div class="hp-fill" id="hp-p2" style="width:${BOXING.health[1]}%;background:${p2.color}"></div></div>
      </div>
    </div>
  `;

  renderMultiplayerTouchBar('shell-footer', Math.min(State.playerCount, 2), (pIdx) => {
    boxingPunch(pIdx);
  });

  if (State.playerCount === 1 || p2.name.startsWith('CPU')) {
    battleTimer = setInterval(() => {
      if (!BOXING.running) return;
      boxingPunch(1, 4);
    }, 400);
  }
}

function boxingPunch(playerIdx, dmg = 6) {
  if (!BOXING.running) return;
  const targetIdx = 1 - playerIdx;
  BOXING.health[targetIdx] = Math.max(0, BOXING.health[targetIdx] - dmg);

  const hpEl = document.getElementById(`hp-p${targetIdx + 1}`);
  if (hpEl) hpEl.style.width = `${BOXING.health[targetIdx]}%`;
  playSound('whack');

  if (BOXING.health[targetIdx] <= 0) {
    BOXING.running = false;
    battleStop();
    const winPlayer = State.players[playerIdx] || State.players[0];
    BOXING.scores[winPlayer.name] = 10;
    updateScoreChip(winPlayer.name, 10);
    playSound('win');
    shellStatus().innerHTML = `🥊 <b>${winPlayer.emoji} ${winPlayer.name} KNOCKOUT VICTORY!</b>`;

    setTimeout(() => {
      showResult(BOXING.scores, winPlayer.name, false);
    }, 1200);
  }
}

document.addEventListener('keydown', e => {
  if (!document.getElementById('screen-shell')?.classList.contains('active')) return;
  if (State.currentGame?.id !== 'boxing' || !BOXING.running) return;
  const key = e.key.toLowerCase();
  if (key === 'z') boxingPunch(0);
  if (key === 'm' && State.playerCount >= 2) boxingPunch(1);
});

// ── 🏋️ WEIGHT LIFTING ─────────────────────────────────────────
const WEIGHT = {
  scores: {}, idx: 0, round: 1, rounds: 3, pos: 0, dir: 1, running: false,
};

function startWeightLift() {
  WEIGHT.scores = {};
  State.players.forEach(p => WEIGHT.scores[p.name] = 0);
  WEIGHT.idx = 0; WEIGHT.round = 1;
  shellSetup('🏋️ WEIGHT LIFTING');
  buildScoreStrip('shell-scores', WEIGHT.scores);
  weightNext();
}

function weightNext() {
  battleStop();
  WEIGHT.pos = 0; WEIGHT.dir = 1; WEIGHT.running = true;
  const p = State.players[WEIGHT.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Press LIFT when gauge is in GREEN!`;

  shellMain().innerHTML = `
    <div class="weight-wrap">
      <div class="weight-bar-track">
        <div class="weight-sweet-spot"></div>
        <div class="weight-indicator" id="weight-ind"></div>
      </div>
      <button class="btn-primary" style="margin-top:20px" onclick="weightLift()">🏋️ LIFT!</button>
    </div>
  `;

  battleTimer = setInterval(() => {
    if (!WEIGHT.running) return;
    WEIGHT.pos += WEIGHT.dir * 4;
    if (WEIGHT.pos > 100 || WEIGHT.pos < 0) WEIGHT.dir *= -1;
    const ind = document.getElementById('weight-ind');
    if (ind) ind.style.left = `${WEIGHT.pos}%`;
  }, 25);
}

function weightLift() {
  if (!WEIGHT.running) return;
  WEIGHT.running = false;
  battleStop();
  const p = State.players[WEIGHT.idx];

  // Sweet spot is 40% to 60%
  if (WEIGHT.pos >= 40 && WEIGHT.pos <= 60) {
    const pts = 15;
    WEIGHT.scores[p.name] += pts;
    updateScoreChip(p.name, WEIGHT.scores[p.name]);
    playSound('win');
    shellStatus().innerHTML = `${p.emoji} <b>GREAT LIFT!</b> +${pts} pts`;
  } else {
    playSound('die');
    shellStatus().innerHTML = `💥 Dropped the weight!`;
  }

  setTimeout(() => {
    WEIGHT.idx = (WEIGHT.idx + 1) % State.playerCount;
    if (WEIGHT.idx === 0) WEIGHT.round++;
    if (WEIGHT.round > WEIGHT.rounds) {
      const s = Object.entries(WEIGHT.scores).sort((a, b) => b[1] - a[1]);
      showResult(WEIGHT.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      weightNext();
    }
  }, 1200);
}

// ── 🎨 PAINT FIGHT ───────────────────────────────────────────
const PAINT = {
  scores: {}, running: false, frame: null,
};

function startPaintFight() {
  PAINT.scores = {};
  State.players.forEach(p => PAINT.scores[p.name] = 0);
  shellSetup('🎨 PAINT FIGHT', { useCanvas: true, cw: 360, ch: 280 });
  buildScoreStrip('shell-scores', PAINT.scores);
  shellStatus().innerHTML = `Click canvas to splatter paint!`;
  shellFooter().innerHTML = `<button class="btn-primary" onclick="paintFinish()">🏁 FINISH</button>`;

  const cv = shellCanvas(), ctx = shellCtx();
  if (cv && ctx) {
    ctx.fillStyle = '#111'; ctx.fillRect(0, 0, cv.width, cv.height);
  }

  cv.onclick = (e) => {
    const rect = cv.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const p = State.players[Math.floor(Math.random() * State.playerCount)];
    ctx.beginPath(); ctx.arc(x, y, 20 + Math.random() * 20, 0, Math.PI * 2);
    ctx.fillStyle = p.color; ctx.fill();
    PAINT.scores[p.name] += 10;
    updateScoreChip(p.name, PAINT.scores[p.name]);
    playSound('place');
  };
}

function paintFinish() {
  const s = Object.entries(PAINT.scores).sort((a, b) => b[1] - a[1]);
  showResult(PAINT.scores, s[0]?.[0] || State.players[0].name, false);
}

// ── 🎆 FIREWORKS ──────────────────────────────────────────────
const FIREWORKS = {
  scores: {}, idx: 0, round: 1, rounds: 3, popped: 0,
};

function startFireworks() {
  FIREWORKS.scores = {};
  State.players.forEach(p => FIREWORKS.scores[p.name] = 0);
  FIREWORKS.idx = 0; FIREWORKS.round = 1;
  shellSetup('🎆 FIREWORKS');
  buildScoreStrip('shell-scores', FIREWORKS.scores);
  fwNext();
}

function fwNext() {
  battleStop();
  FIREWORKS.popped = 0;
  const p = State.players[FIREWORKS.idx];
  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Pop fireworks before they vanish!`;

  let html = '<div class="fw-wrap" id="fw-area"></div>';
  shellMain().innerHTML = html;

  let count = 0;
  battleTimer = setInterval(() => {
    if (count >= 10) { clearInterval(battleTimer); return; }
    fwSpawn();
    count++;
  }, 600);
}

function fwSpawn() {
  const area = document.getElementById('fw-area');
  if (!area) return;
  const btn = document.createElement('button');
  btn.className = 'fw-item';
  btn.textContent = '🎆';
  btn.style.left = `${10 + Math.random() * 80}%`;
  btn.style.top = `${10 + Math.random() * 70}%`;
  btn.onclick = () => {
    const p = State.players[FIREWORKS.idx];
    FIREWORKS.scores[p.name] += 5;
    updateScoreChip(p.name, FIREWORKS.scores[p.name]);
    playSound('win');
    btn.remove();
  };
  area.appendChild(btn);
  setTimeout(() => { if (btn.parentNode) btn.remove(); }, 1200);
}
