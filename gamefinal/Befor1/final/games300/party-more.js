/* ============================================================
   PARTY & EXTRA GAMES – 13 mini games (Games 88-100)
   ============================================================ */

let partyMoreTimer = null;
function partyMoreStop() {
  if (partyMoreTimer) { clearInterval(partyMoreTimer); partyMoreTimer = null; }
}

// ── 88. HOT POTATO ────────────────────────────────────────────
const HOTPOTATO = {
  scores: {}, idx: 0, timer: 5,
};

function startHotPotato() {
  HOTPOTATO.scores = {};
  State.players.forEach(p => HOTPOTATO.scores[p.name] = 0);
  HOTPOTATO.idx = 0;
  shellSetup('🥔 HOT POTATO');
  buildScoreStrip('shell-scores', HOTPOTATO.scores);
  potatoNext();
}

function potatoNext() {
  partyMoreStop();
  HOTPOTATO.timer = Math.floor(Math.random() * 4) + 3;
  const p = State.players[HOTPOTATO.idx];

  shellStatus().innerHTML = `Pass potato before bomb explodes! Currently holding: ${p.emoji} <b>${p.name}</b>`;

  shellMain().innerHTML = `
    <div class="word-wrap">
      <div class="word-target">🥔 💣</div>
      <button class="btn-primary" style="background:var(--p1)" onclick="potatoPass()">🥔 PASS POTATO!</button>
    </div>
  `;

  partyMoreTimer = setInterval(() => {
    HOTPOTATO.timer--;
    if (HOTPOTATO.timer <= 0) {
      clearInterval(partyMoreTimer);
      const holder = State.players[HOTPOTATO.idx];
      playSound('die');
      shellStatus().innerHTML = `💥 <b>BOOM! POTATO EXPLODED ON ${holder.emoji} ${holder.name}!</b>`;

      State.players.forEach(pl => {
        if (pl.name !== holder.name) HOTPOTATO.scores[pl.name] += 10;
      });

      setTimeout(() => {
        const s = Object.entries(HOTPOTATO.scores).sort((a, b) => b[1] - a[1]);
        showResult(HOTPOTATO.scores, s[0][0], false);
      }, 1400);
    }
  }, 1000);
}

function potatoPass() {
  HOTPOTATO.idx = (HOTPOTATO.idx + 1) % State.playerCount;
  const p = State.players[HOTPOTATO.idx];
  playSound('click');
  shellStatus().innerHTML = `Pass potato before bomb explodes! Currently holding: ${p.emoji} <b>${p.name}</b>`;
}

// ── 89. COMMANDER SAYS ────────────────────────────────────────
const COMMANDER = {
  scores: {}, idx: 0, command: '', isCmd: true,
};

function startCommander() {
  COMMANDER.scores = {};
  State.players.forEach(p => COMMANDER.scores[p.name] = 0);
  COMMANDER.idx = 0;
  shellSetup('👮 COMMANDER SAYS');
  buildScoreStrip('shell-scores', COMMANDER.scores);
  commanderNext();
}

function commanderNext() {
  partyMoreStop();
  COMMANDER.isCmd = Math.random() > 0.4;
  COMMANDER.command = COMMANDER.isCmd ? 'Commander says: JUMP!' : 'JUMP!';
  const p = State.players[COMMANDER.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Follow order ONLY if Commander says!`;

  shellMain().innerHTML = `
    <div class="word-wrap">
      <div class="word-target">${COMMANDER.command}</div>
      <div class="color-btns">
        <button class="btn-primary" style="background:var(--p3);color:#000" onclick="commanderAct(true)">OBEY (Jump)</button>
        <button class="btn-primary" style="background:var(--p1)" onclick="commanderAct(false)">IGNORE</button>
      </div>
    </div>
  `;
}

function commanderAct(obeyed) {
  const p = State.players[COMMANDER.idx];
  if (obeyed === COMMANDER.isCmd) {
    COMMANDER.scores[p.name] += 10;
    updateScoreChip(p.name, COMMANDER.scores[p.name]);
    playSound('match');
    shellStatus().innerHTML = `${p.emoji} <b>CORRECT!</b> +10 pts`;
  } else {
    playSound('die');
    shellStatus().innerHTML = `❌ Wrong action!`;
  }

  setTimeout(() => {
    COMMANDER.idx = (COMMANDER.idx + 1) % State.playerCount;
    if (COMMANDER.idx === 0) {
      const s = Object.entries(COMMANDER.scores).sort((a, b) => b[1] - a[1]);
      showResult(COMMANDER.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      commanderNext();
    }
  }, 1200);
}

// ── 90. MUSICAL CHAIRS ────────────────────────────────────────
const MUSICALCHAIRS = {
  scores: {}, idx: 0,
};

function startMusicalChairs() {
  MUSICALCHAIRS.scores = {};
  State.players.forEach(p => MUSICALCHAIRS.scores[p.name] = 0);
  MUSICALCHAIRS.idx = 0;
  shellSetup('🪑 MUSICAL CHAIRS');
  buildScoreStrip('shell-scores', MUSICALCHAIRS.scores);
  chairsNext();
}

function chairsNext() {
  partyMoreStop();
  const p = State.players[MUSICALCHAIRS.idx];
  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Tap CHAIR when music stops!`;

  shellMain().innerHTML = `<div class="word-wrap"><div class="word-target">🎵 MUSIC PLAYING…</div></div>`;

  partyMoreTimer = setTimeout(() => {
    playSound('start');
    shellStatus().innerHTML = `🛑 <b>MUSIC STOPPED! TAP CHAIR NOW!</b>`;
    shellMain().innerHTML = `
      <div class="word-wrap">
        <button class="btn-primary" style="font-size:3rem;padding:24px" onclick="chairsSit()">🪑</button>
      </div>
    `;
  }, 1500 + Math.random() * 2000);
}

function chairsSit() {
  const p = State.players[MUSICALCHAIRS.idx];
  MUSICALCHAIRS.scores[p.name] += 10;
  updateScoreChip(p.name, MUSICALCHAIRS.scores[p.name]);
  playSound('win');
  shellStatus().innerHTML = `${p.emoji} <b>GRABBED CHAIR!</b> +10 pts`;

  setTimeout(() => {
    MUSICALCHAIRS.idx = (MUSICALCHAIRS.idx + 1) % State.playerCount;
    if (MUSICALCHAIRS.idx === 0) {
      const s = Object.entries(MUSICALCHAIRS.scores).sort((a, b) => b[1] - a[1]);
      showResult(MUSICALCHAIRS.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      chairsNext();
    }
  }, 1200);
}

// ── 91. PIN TAIL ──────────────────────────────────────────────
const PINTAIL = {
  scores: {}, idx: 0,
};

function startPinTail() {
  PINTAIL.scores = {};
  State.players.forEach(p => PINTAIL.scores[p.name] = 0);
  PINTAIL.idx = 0;
  shellSetup('🐴 PIN THE TAIL');
  buildScoreStrip('shell-scores', PINTAIL.scores);
  pinTailNext();
}

function pinTailNext() {
  partyMoreStop();
  const p = State.players[PINTAIL.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Click target area to pin tail!`;

  shellMain().innerHTML = `
    <div class="fw-wrap" style="background:#2a1a0a" onclick="pinTailClick()">
      <div style="font-size:5rem;text-align:center;margin-top:40px">🐴</div>
    </div>
  `;
}

function pinTailClick() {
  const p = State.players[PINTAIL.idx];
  PINTAIL.scores[p.name] += 10;
  updateScoreChip(p.name, PINTAIL.scores[p.name]);
  playSound('match');
  shellStatus().innerHTML = `${p.emoji} <b>PINNED TAIL!</b> +10 pts`;

  setTimeout(() => {
    PINTAIL.idx = (PINTAIL.idx + 1) % State.playerCount;
    if (PINTAIL.idx === 0) {
      const s = Object.entries(PINTAIL.scores).sort((a, b) => b[1] - a[1]);
      showResult(PINTAIL.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      pinTailNext();
    }
  }, 1200);
}

// ── 92. JENGA TOWER ───────────────────────────────────────────
const JENGA = {
  scores: {}, idx: 0, blocks: 10,
};

function startJenga() {
  JENGA.scores = {};
  State.players.forEach(p => JENGA.scores[p.name] = 0);
  JENGA.idx = 0;
  shellSetup('🧱 JENGA TOWER');
  buildScoreStrip('shell-scores', JENGA.scores);
  jengaNext();
}

function jengaNext() {
  partyMoreStop();
  JENGA.blocks = 10;
  const p = State.players[JENGA.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Pull blocks carefully!`;
  shellFooter().innerHTML = `<button class="btn-primary" onclick="jengaPull()">🧱 PULL BLOCK</button>`;

  shellMain().innerHTML = `<div class="word-wrap"><div class="word-target" id="jng-val">Tower Stability: 100%</div></div>`;
}

function jengaPull() {
  JENGA.blocks--;
  const el = document.getElementById('jng-val');
  if (el) el.textContent = `Tower Stability: ${JENGA.blocks * 10}%`;
  playSound('place');

  if (JENGA.blocks <= 3) {
    const p = State.players[JENGA.idx];
    JENGA.scores[p.name] += 12;
    updateScoreChip(p.name, JENGA.scores[p.name]);
    playSound('win');
    shellStatus().innerHTML = `${p.emoji} <b>TOWER STABLE!</b> +12 pts`;

    setTimeout(() => {
      JENGA.idx = (JENGA.idx + 1) % State.playerCount;
      if (JENGA.idx === 0) {
        const s = Object.entries(JENGA.scores).sort((a, b) => b[1] - a[1]);
        showResult(JENGA.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
      } else {
        jengaNext();
      }
    }, 1200);
  }
}

// ── 93. BALLOON PUMP ──────────────────────────────────────────
const BALLOONPOP = {
  scores: {}, idx: 0, size: 20,
};

function startBalloonPop() {
  BALLOONPOP.scores = {};
  State.players.forEach(p => BALLOONPOP.scores[p.name] = 0);
  BALLOONPOP.idx = 0;
  shellSetup('🎈 BALLOON PUMP');
  buildScoreStrip('shell-scores', BALLOONPOP.scores);
  balloonNext();
}

function balloonNext() {
  partyMoreStop();
  BALLOONPOP.size = 20;
  const p = State.players[BALLOONPOP.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Pump balloon as big as possible!`;

  shellMain().innerHTML = `
    <div class="word-wrap">
      <div id="bal-icon" style="font-size:3rem;transition:font-size 0.15s">🎈</div>
      <div class="color-btns">
        <button class="btn-primary" style="background:var(--p1)" onclick="balloonPump()">🎈 PUMP</button>
        <button class="btn-primary" style="background:var(--p3);color:#000" onclick="balloonCash()">💰 BANK PTS</button>
      </div>
    </div>
  `;
}

function balloonPump() {
  BALLOONPOP.size += 15;
  const el = document.getElementById('bal-icon');
  if (el) el.style.fontSize = `${BALLOONPOP.size / 10 + 2}rem`;
  playSound('click');

  if (BALLOONPOP.size > 90) {
    if (el) el.textContent = '💥';
    playSound('die');
    shellStatus().innerHTML = `💥 <b>BALLOON POPPED!</b>`;
    setTimeout(balloonAdvance, 1200);
  }
}

function balloonCash() {
  const p = State.players[BALLOONPOP.idx];
  const pts = Math.round(BALLOONPOP.size / 5);
  BALLOONPOP.scores[p.name] += pts;
  updateScoreChip(p.name, BALLOONPOP.scores[p.name]);
  playSound('win');
  shellStatus().innerHTML = `${p.emoji} <b>BANKED ${pts} PTS!</b>`;
  setTimeout(balloonAdvance, 1200);
}

function balloonAdvance() {
  BALLOONPOP.idx = (BALLOONPOP.idx + 1) % State.playerCount;
  if (BALLOONPOP.idx === 0) {
    const s = Object.entries(BALLOONPOP.scores).sort((a, b) => b[1] - a[1]);
    showResult(BALLOONPOP.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
  } else {
    balloonNext();
  }
}

// ── 94. COIN STREAK ───────────────────────────────────────────
const COINFLIP = {
  scores: {}, idx: 0,
};

function startCoinFlip() {
  COINFLIP.scores = {};
  State.players.forEach(p => COINFLIP.scores[p.name] = 0);
  COINFLIP.idx = 0;
  shellSetup('🪙 COIN STREAK');
  buildScoreStrip('shell-scores', COINFLIP.scores);
  coinNext();
}

function coinNext() {
  partyMoreStop();
  const p = State.players[COINFLIP.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Predict Heads or Tails!`;

  shellMain().innerHTML = `
    <div class="word-wrap">
      <div class="word-target">🪙</div>
      <div class="color-btns">
        <button class="btn-primary" onclick="coinGuess('HEADS')">HEADS</button>
        <button class="btn-primary" onclick="coinGuess('TAILS')">TAILS</button>
      </div>
    </div>
  `;
}

function coinGuess(choice) {
  const p = State.players[COINFLIP.idx];
  const actual = Math.random() > 0.5 ? 'HEADS' : 'TAILS';

  if (choice === actual) {
    COINFLIP.scores[p.name] += 10;
    updateScoreChip(p.name, COINFLIP.scores[p.name]);
    playSound('win');
    shellStatus().innerHTML = `${p.emoji} <b>CORRECT (${actual})!</b> +10 pts`;
  } else {
    playSound('die');
    shellStatus().innerHTML = `❌ Was ${actual}`;
  }

  setTimeout(() => {
    COINFLIP.idx = (COINFLIP.idx + 1) % State.playerCount;
    if (COINFLIP.idx === 0) {
      const s = Object.entries(COINFLIP.scores).sort((a, b) => b[1] - a[1]);
      showResult(COINFLIP.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      coinNext();
    }
  }, 1200);
}

// ── 95. FORTUNE COOKIE ────────────────────────────────────────
const FORTUNE = {
  scores: {}, idx: 0,
};

function startFortune() {
  FORTUNE.scores = {};
  State.players.forEach(p => FORTUNE.scores[p.name] = 0);
  FORTUNE.idx = 0;
  shellSetup('🥠 FORTUNE COOKIE');
  buildScoreStrip('shell-scores', FORTUNE.scores);
  fortuneNext();
}

function fortuneNext() {
  partyMoreStop();
  const p = State.players[FORTUNE.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Pick a lucky fortune cookie!`;

  shellMain().innerHTML = `
    <div class="color-btns">
      <button class="btn-primary" style="font-size:2rem" onclick="fortunePick()">🥠 1</button>
      <button class="btn-primary" style="font-size:2rem" onclick="fortunePick()">🥠 2</button>
      <button class="btn-primary" style="font-size:2rem" onclick="fortunePick()">🥠 3</button>
    </div>
  `;
}

function fortunePick() {
  const p = State.players[FORTUNE.idx];
  const pts = [5, 10, 15, 20][Math.floor(Math.random() * 4)];
  FORTUNE.scores[p.name] += pts;
  updateScoreChip(p.name, FORTUNE.scores[p.name]);
  playSound('win');
  shellStatus().innerHTML = `${p.emoji} <b>FORTUNE REVEALED: +${pts} PTS!</b>`;

  setTimeout(() => {
    FORTUNE.idx = (FORTUNE.idx + 1) % State.playerCount;
    if (FORTUNE.idx === 0) {
      const s = Object.entries(FORTUNE.scores).sort((a, b) => b[1] - a[1]);
      showResult(FORTUNE.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      fortuneNext();
    }
  }, 1200);
}

// ── 96. PARTY QUIZ ────────────────────────────────────────────
const TRIVIA = {
  scores: {}, idx: 0, q: '', a: 0,
};

function startTrivia() {
  TRIVIA.scores = {};
  State.players.forEach(p => TRIVIA.scores[p.name] = 0);
  TRIVIA.idx = 0;
  shellSetup('❓ PARTY QUIZ');
  buildScoreStrip('shell-scores', TRIVIA.scores);
  triviaNext();
}

function triviaNext() {
  partyMoreStop();
  const qList = [
    { q: 'How many sides does a hexagon have?', a: '6', options: ['5', '6', '7', '8'] },
    { q: 'What planet is known as Red Planet?', a: 'Mars', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'] },
    { q: 'Which is fastest land animal?', a: 'Cheetah', options: ['Cheetah', 'Lion', 'Horse', 'Falcon'] },
  ];
  const pick = qList[Math.floor(Math.random() * qList.length)];
  TRIVIA.q = pick.q; TRIVIA.a = pick.a;
  const p = State.players[TRIVIA.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – ${TRIVIA.q}`;

  let html = '<div class="vote-btns">';
  pick.options.forEach(opt => {
    html += `<button class="btn-secondary" onclick="triviaAns('${opt}')">${opt}</button>`;
  });
  html += '</div>';

  shellMain().innerHTML = html;
}

function triviaAns(opt) {
  const p = State.players[TRIVIA.idx];
  if (opt === TRIVIA.a) {
    TRIVIA.scores[p.name] += 10;
    updateScoreChip(p.name, TRIVIA.scores[p.name]);
    playSound('win');
    shellStatus().innerHTML = `${p.emoji} <b>QUIZ MASTER!</b> +10 pts`;
  } else {
    playSound('die');
    shellStatus().innerHTML = `❌ Correct answer was ${TRIVIA.a}`;
  }

  setTimeout(() => {
    TRIVIA.idx = (TRIVIA.idx + 1) % State.playerCount;
    if (TRIVIA.idx === 0) {
      const s = Object.entries(TRIVIA.scores).sort((a, b) => b[1] - a[1]);
      showResult(TRIVIA.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      triviaNext();
    }
  }, 1200);
}

// ── 97. POWER PUNCH ───────────────────────────────────────────
const POWERPUNCH = {
  scores: {}, idx: 0,
};

function startPowerPunch() {
  POWERPUNCH.scores = {};
  State.players.forEach(p => POWERPUNCH.scores[p.name] = 0);
  POWERPUNCH.idx = 0;
  shellSetup('🥊 POWER PUNCH');
  buildScoreStrip('shell-scores', POWERPUNCH.scores);
  powerPunchNext();
}

function powerPunchNext() {
  partyMoreStop();
  const p = State.players[POWERPUNCH.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Hit punching machine!`;

  shellMain().innerHTML = `
    <div class="word-wrap">
      <div class="word-target">🥊 🎯</div>
      <button class="btn-primary" style="background:var(--p1)" onclick="powerPunchHit()">🥊 MAX PUNCH!</button>
    </div>
  `;
}

function powerPunchHit() {
  const p = State.players[POWERPUNCH.idx];
  const pts = Math.floor(Math.random() * 15) + 10;
  POWERPUNCH.scores[p.name] += pts;
  updateScoreChip(p.name, POWERPUNCH.scores[p.name]);
  playSound('win');
  shellStatus().innerHTML = `${p.emoji} <b>PUNCH SCORE: ${pts * 50}!</b> +${pts} pts`;

  setTimeout(() => {
    POWERPUNCH.idx = (POWERPUNCH.idx + 1) % State.playerCount;
    if (POWERPUNCH.idx === 0) {
      const s = Object.entries(POWERPUNCH.scores).sort((a, b) => b[1] - a[1]);
      showResult(POWERPUNCH.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      powerPunchNext();
    }
  }, 1200);
}

// ── 98. SEA BATTLE ────────────────────────────────────────────
const SEABATTLE = {
  scores: {}, idx: 0,
};

function startSeaBattle() {
  SEABATTLE.scores = {};
  State.players.forEach(p => SEABATTLE.scores[p.name] = 0);
  SEABATTLE.idx = 0;
  shellSetup('🚢 SEA BATTLE');
  buildScoreStrip('shell-scores', SEABATTLE.scores);
  seaNext();
}

function seaNext() {
  partyMoreStop();
  const shipIdx = Math.floor(Math.random() * 6);
  const p = State.players[SEABATTLE.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Strike coordinate to sink enemy ship!`;

  let html = '<div class="emoji-grid" style="grid-template-columns:repeat(3,1fr)">';
  for (let i = 0; i < 6; i++) {
    html += `<button class="emoji-cell" onclick="seaStrike(${i === shipIdx})">🌊</button>`;
  }
  html += '</div>';

  shellMain().innerHTML = html;
}

function seaStrike(hit) {
  const p = State.players[SEABATTLE.idx];
  if (hit) {
    SEABATTLE.scores[p.name] += 15;
    updateScoreChip(p.name, SEABATTLE.scores[p.name]);
    playSound('win');
    shellStatus().innerHTML = `${p.emoji} <b>BATTLESHIP SUNK!</b> +15 pts`;
  } else {
    playSound('die');
    shellStatus().innerHTML = `🌊 Splash! Missed ship.`;
  }

  setTimeout(() => {
    SEABATTLE.idx = (SEABATTLE.idx + 1) % State.playerCount;
    if (SEABATTLE.idx === 0) {
      const s = Object.entries(SEABATTLE.scores).sort((a, b) => b[1] - a[1]);
      showResult(SEABATTLE.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      seaNext();
    }
  }, 1200);
}

// ── 99. SKATE RAMP ────────────────────────────────────────────
const SKATING = {
  scores: {}, idx: 0,
};

function startSkating() {
  SKATING.scores = {};
  State.players.forEach(p => SKATING.scores[p.name] = 0);
  SKATING.idx = 0;
  shellSetup('🛹 SKATE RAMP');
  buildScoreStrip('shell-scores', SKATING.scores);
  skateNext();
}

function skateNext() {
  partyMoreStop();
  const p = State.players[SKATING.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Launch off ramp and pull trick!`;

  shellMain().innerHTML = `
    <div class="word-wrap">
      <div class="word-target">🛹 🏁</div>
      <button class="btn-primary" style="background:var(--accent)" onclick="skateTrick()">🛹 KICKFLIP!</button>
    </div>
  `;
}

function skateTrick() {
  const p = State.players[SKATING.idx];
  SKATING.scores[p.name] += 12;
  updateScoreChip(p.name, SKATING.scores[p.name]);
  playSound('win');
  shellStatus().innerHTML = `${p.emoji} <b>LANDED KICKFLIP!</b> +12 pts`;

  setTimeout(() => {
    SKATING.idx = (SKATING.idx + 1) % State.playerCount;
    if (SKATING.idx === 0) {
      const s = Object.entries(SKATING.scores).sort((a, b) => b[1] - a[1]);
      showResult(SKATING.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      skateNext();
    }
  }, 1200);
}

// ── 100. THE FINAL CLASH ──────────────────────────────────────
const FINALCLASH = {
  scores: {}, idx: 0,
};

function startFinalClash() {
  FINALCLASH.scores = {};
  State.players.forEach(p => FINALCLASH.scores[p.name] = 0);
  FINALCLASH.idx = 0;
  shellSetup('🏆 THE ULTIMATE CLASH');
  buildScoreStrip('shell-scores', FINALCLASH.scores);
  finalNext();
}

function finalNext() {
  partyMoreStop();
  const p = State.players[FINALCLASH.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Press MEGA CLASH for final points!`;

  shellMain().innerHTML = `
    <div class="word-wrap">
      <div class="word-target" style="font-size:3rem">👑 🏆 👑</div>
      <button class="btn-primary pulse-glow" style="font-size:1.5rem;padding:20px 40px" onclick="finalClashHit()">🏆 MEGA CLASH!</button>
    </div>
  `;
}

function finalClashHit() {
  const p = State.players[FINALCLASH.idx];
  const pts = 25;
  FINALCLASH.scores[p.name] += pts;
  updateScoreChip(p.name, FINALCLASH.scores[p.name]);
  playSound('win');
  shellStatus().innerHTML = `${p.emoji} <b>VICTORY CLASH!</b> +${pts} pts`;

  setTimeout(() => {
    FINALCLASH.idx = (FINALCLASH.idx + 1) % State.playerCount;
    if (FINALCLASH.idx === 0) {
      const s = Object.entries(FINALCLASH.scores).sort((a, b) => b[1] - a[1]);
      showResult(FINALCLASH.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      finalNext();
    }
  }, 1400);
}
