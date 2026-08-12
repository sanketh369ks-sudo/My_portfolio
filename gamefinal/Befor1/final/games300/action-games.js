/* ============================================================
   ACTION & SPORTS GAMES – 13 mini games (Games 75-87)
   ============================================================ */

let actionTimer = null;
function actionStop() {
  if (actionTimer) { clearInterval(actionTimer); actionTimer = null; }
}

// ── 75. NINJA SLICE ───────────────────────────────────────────
const NINJA = {
  scores: {}, idx: 0, sliced: 0,
};

function startNinjaSlice() {
  NINJA.scores = {};
  State.players.forEach(p => NINJA.scores[p.name] = 0);
  NINJA.idx = 0;
  shellSetup('🥷 NINJA SLICE');
  buildScoreStrip('shell-scores', NINJA.scores);
  ninjaNext();
}

function ninjaNext() {
  actionStop();
  NINJA.sliced = 0;
  const p = State.players[NINJA.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Slice the flying fruits!`;

  let html = '<div class="fw-wrap" id="ninja-area"></div>';
  shellMain().innerHTML = html;

  let count = 0;
  actionTimer = setInterval(() => {
    if (count >= 6) { clearInterval(actionTimer); return; }
    ninjaSpawn();
    count++;
  }, 650);
}

function ninjaSpawn() {
  const area = document.getElementById('ninja-area');
  if (!area) return;
  const btn = document.createElement('button');
  btn.className = 'fw-item';
  btn.textContent = ['🍉', '🍌', '🍎', '🍍'][Math.floor(Math.random() * 4)];
  btn.style.left = `${15 + Math.random() * 70}%`;
  btn.style.top = `${15 + Math.random() * 65}%`;
  btn.onclick = () => {
    const p = State.players[NINJA.idx];
    NINJA.scores[p.name] += 5;
    updateScoreChip(p.name, NINJA.scores[p.name]);
    playSound('match');
    btn.textContent = '💥';
    setTimeout(() => btn.remove(), 200);
    NINJA.sliced++;
    if (NINJA.sliced >= 6) {
      setTimeout(() => {
        NINJA.idx = (NINJA.idx + 1) % State.playerCount;
        if (NINJA.idx === 0) {
          const s = Object.entries(NINJA.scores).sort((a, b) => b[1] - a[1]);
          showResult(NINJA.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
        } else {
          ninjaNext();
        }
      }, 1000);
    }
  };
  area.appendChild(btn);
  setTimeout(() => { if (btn.parentNode) btn.remove(); }, 1100);
}

// ── 76. WHACK AN ALIEN ────────────────────────────────────────
const WHACKALIEN = {
  scores: {}, idx: 0,
};

function startWhackAlien() {
  WHACKALIEN.scores = {};
  State.players.forEach(p => WHACKALIEN.scores[p.name] = 0);
  WHACKALIEN.idx = 0;
  shellSetup('🛸 WHACK AN ALIEN');
  buildScoreStrip('shell-scores', WHACKALIEN.scores);
  whackAlienNext();
}

function whackAlienNext() {
  actionStop();
  const p = State.players[WHACKALIEN.idx];
  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Click UFO before it warps!`;

  shellMain().innerHTML = `
    <div class="word-wrap">
      <button class="btn-primary" style="font-size:3rem;padding:30px" onclick="whackAlienHit()">🛸</button>
    </div>
  `;
}

function whackAlienHit() {
  const p = State.players[WHACKALIEN.idx];
  WHACKALIEN.scores[p.name] += 10;
  updateScoreChip(p.name, WHACKALIEN.scores[p.name]);
  playSound('whack');
  shellStatus().innerHTML = `${p.emoji} <b>WARP INTERCEPTED!</b> +10 pts`;

  setTimeout(() => {
    WHACKALIEN.idx = (WHACKALIEN.idx + 1) % State.playerCount;
    if (WHACKALIEN.idx === 0) {
      const s = Object.entries(WHACKALIEN.scores).sort((a, b) => b[1] - a[1]);
      showResult(WHACKALIEN.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      whackAlienNext();
    }
  }, 1200);
}

// ── 77. DUCK HUNT ─────────────────────────────────────────────
const DUCKHUNT = {
  scores: {}, idx: 0,
};

function startDuckHunt() {
  DUCKHUNT.scores = {};
  State.players.forEach(p => DUCKHUNT.scores[p.name] = 0);
  DUCKHUNT.idx = 0;
  shellSetup('🦆 DUCK HUNT');
  buildScoreStrip('shell-scores', DUCKHUNT.scores);
  duckHuntNext();
}

function duckHuntNext() {
  actionStop();
  const p = State.players[DUCKHUNT.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Shoot flying ducks!`;

  shellMain().innerHTML = `
    <div class="fw-wrap" id="duck-area">
      <button class="fw-item" style="left:40%;top:30%;font-size:3rem" onclick="duckHit(this)">🦆</button>
    </div>
  `;
}

function duckHit(btn) {
  btn.textContent = '💥';
  const p = State.players[DUCKHUNT.idx];
  DUCKHUNT.scores[p.name] += 10;
  updateScoreChip(p.name, DUCKHUNT.scores[p.name]);
  playSound('win');
  shellStatus().innerHTML = `${p.emoji} <b>DIRECT HIT!</b> +10 pts`;

  setTimeout(() => {
    DUCKHUNT.idx = (DUCKHUNT.idx + 1) % State.playerCount;
    if (DUCKHUNT.idx === 0) {
      const s = Object.entries(DUCKHUNT.scores).sort((a, b) => b[1] - a[1]);
      showResult(DUCKHUNT.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      duckHuntNext();
    }
  }, 1200);
}

// ── 78. HAMMER TIME ───────────────────────────────────────────
const HAMMER = {
  scores: {}, idx: 0, power: 50, dir: 1,
};

function startHammer() {
  HAMMER.scores = {};
  State.players.forEach(p => HAMMER.scores[p.name] = 0);
  HAMMER.idx = 0;
  shellSetup('🔨 HAMMER TIME');
  buildScoreStrip('shell-scores', HAMMER.scores);
  hammerNext();
}

function hammerNext() {
  actionStop();
  HAMMER.power = 0; HAMMER.dir = 1;
  const p = State.players[HAMMER.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Time hammer swing at MAX power!`;
  shellFooter().innerHTML = `<button class="btn-primary" onclick="hammerSwing()">🔨 SWING HAMMER!</button>`;

  shellMain().innerHTML = `
    <div class="weight-wrap">
      <div class="weight-bar-track">
        <div class="weight-indicator" id="ham-ind"></div>
      </div>
    </div>
  `;

  actionTimer = setInterval(() => {
    HAMMER.power += HAMMER.dir * 5;
    if (HAMMER.power > 100 || HAMMER.power < 0) HAMMER.dir *= -1;
    const ind = document.getElementById('ham-ind');
    if (ind) ind.style.left = `${HAMMER.power}%`;
  }, 25);
}

function hammerSwing() {
  clearInterval(actionTimer);
  const p = State.players[HAMMER.idx];
  const pts = Math.round(HAMMER.power / 5);
  HAMMER.scores[p.name] += pts;
  updateScoreChip(p.name, HAMMER.scores[p.name]);
  playSound(pts > 15 ? 'win' : 'match');
  shellStatus().innerHTML = `${p.emoji} <b>HIT WITH ${HAMMER.power}% POWER!</b> +${pts} pts`;

  setTimeout(() => {
    HAMMER.idx = (HAMMER.idx + 1) % State.playerCount;
    if (HAMMER.idx === 0) {
      const s = Object.entries(HAMMER.scores).sort((a, b) => b[1] - a[1]);
      showResult(HAMMER.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      hammerNext();
    }
  }, 1200);
}

// ── 79. DODGEBALL ARENA ───────────────────────────────────────
const DODGEBALL = {
  scores: {}, idx: 0, dodged: 0,
};

function startDodgeball() {
  DODGEBALL.scores = {};
  State.players.forEach(p => DODGEBALL.scores[p.name] = 0);
  DODGEBALL.idx = 0;
  shellSetup('🤾 DODGEBALL ARENA');
  buildScoreStrip('shell-scores', DODGEBALL.scores);
  dodgeballNext();
}

function dodgeballNext() {
  actionStop();
  DODGEBALL.dodged = 0;
  const p = State.players[DODGEBALL.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Pick side to dodge incoming ball!`;

  shellMain().innerHTML = `
    <div class="word-wrap">
      <div class="color-btns">
        <button class="btn-primary" onclick="dodgeStep(true)">⬅ DODGE LEFT</button>
        <button class="btn-primary" onclick="dodgeStep(true)">DODGE RIGHT ➡</button>
      </div>
    </div>
  `;
}

function dodgeStep(ok) {
  const p = State.players[DODGEBALL.idx];
  if (ok) {
    DODGEBALL.scores[p.name] += 10;
    updateScoreChip(p.name, DODGEBALL.scores[p.name]);
    playSound('match');
    shellStatus().innerHTML = `${p.emoji} <b>DODGED BALL!</b> +10 pts`;
  } else {
    playSound('die');
    shellStatus().innerHTML = `💥 Hit by ball!`;
  }

  setTimeout(() => {
    DODGEBALL.idx = (DODGEBALL.idx + 1) % State.playerCount;
    if (DODGEBALL.idx === 0) {
      const s = Object.entries(DODGEBALL.scores).sort((a, b) => b[1] - a[1]);
      showResult(DODGEBALL.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      dodgeballNext();
    }
  }, 1200);
}

// ── 80. LASER DODGE ───────────────────────────────────────────
const LASERGRID = {
  scores: {}, idx: 0,
};

function startLaserGrid() {
  LASERGRID.scores = {};
  State.players.forEach(p => LASERGRID.scores[p.name] = 0);
  LASERGRID.idx = 0;
  shellSetup('⚡ LASER DODGE');
  buildScoreStrip('shell-scores', LASERGRID.scores);
  laserNext();
}

function laserNext() {
  actionStop();
  const p = State.players[LASERGRID.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Press JUMP when laser sweeps!`;
  shellFooter().innerHTML = `<button class="btn-primary" style="background:var(--p3);color:#000" onclick="laserJump()">🦘 JUMP LASER!</button>`;

  shellMain().innerHTML = `<div class="word-wrap"><div class="word-target">⚡ ⚡ ⚡</div></div>`;
}

function laserJump() {
  const p = State.players[LASERGRID.idx];
  LASERGRID.scores[p.name] += 10;
  updateScoreChip(p.name, LASERGRID.scores[p.name]);
  playSound('win');
  shellStatus().innerHTML = `${p.emoji} <b>JUMPED LASER PERFECTLY!</b> +10 pts`;

  setTimeout(() => {
    LASERGRID.idx = (LASERGRID.idx + 1) % State.playerCount;
    if (LASERGRID.idx === 0) {
      const s = Object.entries(LASERGRID.scores).sort((a, b) => b[1] - a[1]);
      showResult(LASERGRID.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      laserNext();
    }
  }, 1200);
}

// ── 81. LAVA ESCAPE ───────────────────────────────────────────
const VOLCANO = {
  scores: {}, idx: 0, level: 0,
};

function startLavaEscape() {
  VOLCANO.scores = {};
  State.players.forEach(p => VOLCANO.scores[p.name] = 0);
  VOLCANO.idx = 0;
  shellSetup('🌋 LAVA ESCAPE');
  buildScoreStrip('shell-scores', VOLCANO.scores);
  lavaNext();
}

function lavaNext() {
  actionStop();
  VOLCANO.level = 0;
  const p = State.players[VOLCANO.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Jump platforms as lava rises!`;
  shellFooter().innerHTML = `<button class="btn-primary" style="background:var(--p4);color:#000" onclick="lavaClimb()">🧗 CLIMB HIGHER</button>`;

  shellMain().innerHTML = `<div class="word-wrap"><div class="word-target" id="lava-val">Height: 0m</div></div>`;
}

function lavaClimb() {
  VOLCANO.level += 10;
  const el = document.getElementById('lava-val');
  if (el) el.textContent = `Height: ${VOLCANO.level}m`;
  playSound('match');

  if (VOLCANO.level >= 40) {
    const p = State.players[VOLCANO.idx];
    VOLCANO.scores[p.name] += 15;
    updateScoreChip(p.name, VOLCANO.scores[p.name]);
    playSound('win');
    shellStatus().innerHTML = `${p.emoji} <b>ESCAPED VOLCANO!</b> +15 pts`;

    setTimeout(() => {
      VOLCANO.idx = (VOLCANO.idx + 1) % State.playerCount;
      if (VOLCANO.idx === 0) {
        const s = Object.entries(VOLCANO.scores).sort((a, b) => b[1] - a[1]);
        showResult(VOLCANO.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
      } else {
        lavaNext();
      }
    }, 1200);
  }
}

// ── 82. TIC-TAC-TOE 4x4 ───────────────────────────────────────
const TTT4 = {
  scores: {}, board: Array(16).fill(null), idx: 0,
};

function startTTT4() {
  TTT4.scores = {};
  State.players.forEach(p => TTT4.scores[p.name] = 0);
  TTT4.board = Array(16).fill(null);
  TTT4.idx = 0;
  shellSetup('❌⭕ TIC-TAC-TOE 4x4');
  buildScoreStrip('shell-scores', TTT4.scores);
  ttt4Render();
}

function ttt4Render() {
  actionStop();
  const p = State.players[TTT4.idx];
  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Place symbol on 4x4 board!`;

  let html = '<div class="matrix-grid" style="grid-template-columns:repeat(4,1fr)">';
  TTT4.board.forEach((v, i) => {
    html += `<button class="matrix-tile" style="background:${v ? v.color : 'var(--surface2)'}" onclick="ttt4Click(${i})">${v ? v.emoji : ''}</button>`;
  });
  html += '</div>';

  shellMain().innerHTML = html;
}

function ttt4Click(i) {
  if (TTT4.board[i]) return;
  const p = State.players[TTT4.idx];
  TTT4.board[i] = p;
  TTT4.scores[p.name] += 3;
  updateScoreChip(p.name, TTT4.scores[p.name]);
  playSound('place');

  TTT4.idx = (TTT4.idx + 1) % State.playerCount;
  if (TTT4.board.every(v => v !== null)) {
    const s = Object.entries(TTT4.scores).sort((a, b) => b[1] - a[1]);
    showResult(TTT4.scores, s[0][0], false);
  } else {
    ttt4Render();
  }
}

// ── 83. TENNIS RALLY ──────────────────────────────────────────
const TENNIS = {
  scores: {}, idx: 0, rallies: 0,
};

function startTennis() {
  TENNIS.scores = {};
  State.players.forEach(p => TENNIS.scores[p.name] = 0);
  TENNIS.idx = 0;
  shellSetup('🎾 TENNIS RALLY');
  buildScoreStrip('shell-scores', TENNIS.scores);
  tennisNext();
}

function tennisNext() {
  actionStop();
  TENNIS.rallies = 0;
  const p = State.players[TENNIS.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Return 4 tennis serves!`;
  shellFooter().innerHTML = `<button class="btn-primary" onclick="tennisHit()">🎾 RETURN SERVE</button>`;

  shellMain().innerHTML = `<div class="word-wrap"><div class="word-target" id="ten-val">Rallies: 0/4</div></div>`;
}

function tennisHit() {
  TENNIS.rallies++;
  const el = document.getElementById('ten-val');
  if (el) el.textContent = `Rallies: ${TENNIS.rallies}/4`;
  playSound('match');

  if (TENNIS.rallies >= 4) {
    const p = State.players[TENNIS.idx];
    TENNIS.scores[p.name] += 12;
    updateScoreChip(p.name, TENNIS.scores[p.name]);
    playSound('win');
    shellStatus().innerHTML = `${p.emoji} <b>SET & MATCH VICTORY!</b> +12 pts`;

    setTimeout(() => {
      TENNIS.idx = (TENNIS.idx + 1) % State.playerCount;
      if (TENNIS.idx === 0) {
        const s = Object.entries(TENNIS.scores).sort((a, b) => b[1] - a[1]);
        showResult(TENNIS.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
      } else {
        tennisNext();
      }
    }, 1200);
  }
}

// ── 84. 100m HURDLES ──────────────────────────────────────────
const HURDLES = {
  scores: {}, idx: 0, pos: 0,
};

function startHurdles() {
  HURDLES.scores = {};
  State.players.forEach(p => HURDLES.scores[p.name] = 0);
  HURDLES.idx = 0;
  shellSetup('🏃 100m HURDLES');
  buildScoreStrip('shell-scores', HURDLES.scores);
  hurdlesNext();
}

function hurdlesNext() {
  actionStop();
  HURDLES.pos = 0;
  const p = State.players[HURDLES.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Mash RUN then JUMP hurdles!`;
  shellFooter().innerHTML = `
    <div class="color-btns">
      <button class="btn-primary" onclick="hurdleRun()">🏃 RUN</button>
      <button class="btn-primary" style="background:var(--p3);color:#000" onclick="hurdleJump()">🦘 JUMP</button>
    </div>
  `;

  shellMain().innerHTML = `<div class="word-wrap"><div class="word-target" id="hur-val">Distance: 0m</div></div>`;
}

function hurdleRun() {
  HURDLES.pos += 10;
  const el = document.getElementById('hur-val');
  if (el) el.textContent = `Distance: ${HURDLES.pos}m`;
  playSound('click');
  checkHurdlesWin();
}

function hurdleJump() {
  HURDLES.pos += 20;
  const el = document.getElementById('hur-val');
  if (el) el.textContent = `Distance: ${HURDLES.pos}m`;
  playSound('match');
  checkHurdlesWin();
}

function checkHurdlesWin() {
  if (HURDLES.pos >= 100) {
    const p = State.players[HURDLES.idx];
    HURDLES.scores[p.name] += 15;
    updateScoreChip(p.name, HURDLES.scores[p.name]);
    playSound('win');
    shellStatus().innerHTML = `${p.emoji} <b>GOLD MEDAL 100m!</b> +15 pts`;

    setTimeout(() => {
      HURDLES.idx = (HURDLES.idx + 1) % State.playerCount;
      if (HURDLES.idx === 0) {
        const s = Object.entries(HURDLES.scores).sort((a, b) => b[1] - a[1]);
        showResult(HURDLES.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
      } else {
        hurdlesNext();
      }
    }, 1200);
  }
}

// ── 85. SUMO PUSH ─────────────────────────────────────────────
const SUMO = {
  scores: {}, pos: 0,
};

function startSumoPush() {
  SUMO.scores = {};
  State.players.forEach(p => SUMO.scores[p.name] = 0);
  SUMO.pos = 0;
  shellSetup('🤼 SUMO PUSH');
  buildScoreStrip('shell-scores', SUMO.scores);
  sumoNext();
}

function sumoNext() {
  actionStop();
  SUMO.pos = 0;
  const p1 = State.players[0], p2 = State.players[1] || { name: 'Rival', emoji: '🤖', color: '#4db8ff' };

  shellStatus().innerHTML = `Mash key to push rival out of ring!`;

  shellMain().innerHTML = `
    <div class="word-wrap">
      <div class="word-target">🤼 RING TENSION</div>
      <div class="color-btns">
        <button class="btn-primary" style="background:${p1.color}" onclick="sumoPush(0)">${p1.emoji} PUSH (<kbd>Z</kbd>)</button>
        <button class="btn-primary" style="background:${p2.color}" onclick="sumoPush(1)">${p2.emoji} PUSH (<kbd>M</kbd>)</button>
      </div>
    </div>
  `;
}

function sumoPush(pIdx) {
  if (pIdx === 0) SUMO.pos += 15;
  else SUMO.pos -= 15;
  playSound('click');

  if (Math.abs(SUMO.pos) >= 60) {
    const winIdx = SUMO.pos > 0 ? 0 : 1;
    const winner = State.players[winIdx] || State.players[0];
    SUMO.scores[winner.name] = 10;
    updateScoreChip(winner.name, 10);
    playSound('win');
    shellStatus().innerHTML = `🤼 <b>${winner.emoji} ${winner.name} PUSHED RIVAL OUT!</b>`;

    setTimeout(() => {
      showResult(SUMO.scores, winner.name, false);
    }, 1200);
  }
}

// ── 86. AIR HOCKEY ────────────────────────────────────────────
const HOCKEY = {
  scores: {}, idx: 0,
};

function startAirHockey() {
  HOCKEY.scores = {};
  State.players.forEach(p => HOCKEY.scores[p.name] = 0);
  HOCKEY.idx = 0;
  shellSetup('🏒 AIR HOCKEY');
  buildScoreStrip('shell-scores', HOCKEY.scores);
  hockeyNext();
}

function hockeyNext() {
  actionStop();
  const p = State.players[HOCKEY.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Slap puck into goal!`;

  shellMain().innerHTML = `
    <div class="word-wrap">
      <div class="word-target">🏒 🥅</div>
      <button class="btn-primary" style="background:var(--p2)" onclick="hockeySlap()">🏒 SLAP PUCK!</button>
    </div>
  `;
}

function hockeySlap() {
  const p = State.players[HOCKEY.idx];
  HOCKEY.scores[p.name] += 10;
  updateScoreChip(p.name, HOCKEY.scores[p.name]);
  playSound('win');
  shellStatus().innerHTML = `${p.emoji} <b>GOAL SCORED!</b> +10 pts`;

  setTimeout(() => {
    HOCKEY.idx = (HOCKEY.idx + 1) % State.playerCount;
    if (HOCKEY.idx === 0) {
      const s = Object.entries(HOCKEY.scores).sort((a, b) => b[1] - a[1]);
      showResult(HOCKEY.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      hockeyNext();
    }
  }, 1200);
}

// ── 87. 8-BALL CUE ────────────────────────────────────────────
const BILLIARDS = {
  scores: {}, idx: 0,
};

function startBilliards() {
  BILLIARDS.scores = {};
  State.players.forEach(p => BILLIARDS.scores[p.name] = 0);
  BILLIARDS.idx = 0;
  shellSetup('🎱 8-BALL CUE');
  buildScoreStrip('shell-scores', BILLIARDS.scores);
  billiardsNext();
}

function billiardsNext() {
  actionStop();
  const p = State.players[BILLIARDS.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Aim cue stick & strike 8-ball!`;

  shellMain().innerHTML = `
    <div class="word-wrap">
      <div class="word-target">🎱 🏑</div>
      <button class="btn-primary" style="background:var(--accent)" onclick="billiardsStrike()">🎱 STRIKE CUE!</button>
    </div>
  `;
}

function billiardsStrike() {
  const p = State.players[BILLIARDS.idx];
  BILLIARDS.scores[p.name] += 10;
  updateScoreChip(p.name, BILLIARDS.scores[p.name]);
  playSound('win');
  shellStatus().innerHTML = `${p.emoji} <b>POTTED 8-BALL!</b> +10 pts`;

  setTimeout(() => {
    BILLIARDS.idx = (BILLIARDS.idx + 1) % State.playerCount;
    if (BILLIARDS.idx === 0) {
      const s = Object.entries(BILLIARDS.scores).sort((a, b) => b[1] - a[1]);
      showResult(BILLIARDS.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      billiardsNext();
    }
  }, 1200);
}
