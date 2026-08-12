/* ============================================================
   PUZZLE GAMES – 12 mini games (Games 51-62)
   ============================================================ */

let puzzleTimer = null;
function puzzleStop() {
  if (puzzleTimer) { clearInterval(puzzleTimer); puzzleTimer = null; }
}

// ── 51. MATH DASH ─────────────────────────────────────────────
const MATHDASH = {
  scores: {}, idx: 0, round: 1, rounds: 5, q: '', a: true,
};

function startMathDash() {
  MATHDASH.scores = {};
  State.players.forEach(p => MATHDASH.scores[p.name] = 0);
  MATHDASH.idx = 0; MATHDASH.round = 1;
  shellSetup('➗ MATH DASH');
  buildScoreStrip('shell-scores', MATHDASH.scores);
  mathDashNext();
}

function mathDashNext() {
  puzzleStop();
  const a1 = Math.floor(Math.random() * 15) + 1;
  const a2 = Math.floor(Math.random() * 15) + 1;
  const correctSum = a1 + a2;
  const showCorrect = Math.random() > 0.5;
  const dispSum = showCorrect ? correctSum : correctSum + (Math.random() > 0.5 ? 2 : -2);
  MATHDASH.q = `${a1} + ${a2} = ${dispSum}`;
  MATHDASH.a = showCorrect;

  const p = State.players[MATHDASH.idx];
  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Is this equation TRUE or FALSE?`;

  shellMain().innerHTML = `
    <div class="word-wrap">
      <div class="word-target">${MATHDASH.q}</div>
      <div class="color-btns">
        <button class="btn-primary" style="background:var(--p3);color:#000" onclick="mathDashAns(true)">TRUE ✅</button>
        <button class="btn-primary" style="background:var(--p1)" onclick="mathDashAns(false)">FALSE ❌</button>
      </div>
    </div>
  `;
}

function mathDashAns(userAns) {
  const p = State.players[MATHDASH.idx];
  if (userAns === MATHDASH.a) {
    MATHDASH.scores[p.name] += 5;
    updateScoreChip(p.name, MATHDASH.scores[p.name]);
    playSound('match');
    shellStatus().innerHTML = `${p.emoji} <b>CORRECT!</b> +5 pts`;
  } else {
    playSound('die');
    shellStatus().innerHTML = `❌ WRONG!`;
  }

  setTimeout(() => {
    MATHDASH.idx = (MATHDASH.idx + 1) % State.playerCount;
    if (MATHDASH.idx === 0) MATHDASH.round++;
    if (MATHDASH.round > MATHDASH.rounds) {
      const s = Object.entries(MATHDASH.scores).sort((a, b) => b[1] - a[1]);
      showResult(MATHDASH.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      mathDashNext();
    }
  }, 1000);
}

// ── 52. MEMORY MATRIX ─────────────────────────────────────────
const MEMMATRIX = {
  scores: {}, idx: 0, round: 1, rounds: 4, pattern: [], userPattern: [],
};

function startMemMatrix() {
  MEMMATRIX.scores = {};
  State.players.forEach(p => MEMMATRIX.scores[p.name] = 0);
  MEMMATRIX.idx = 0; MEMMATRIX.round = 1;
  shellSetup('🔲 MEMORY MATRIX');
  buildScoreStrip('shell-scores', MEMMATRIX.scores);
  memMatrixNext();
}

function memMatrixNext() {
  puzzleStop();
  MEMMATRIX.pattern = [];
  while (MEMMATRIX.pattern.length < 4) {
    const r = Math.floor(Math.random() * 9);
    if (!MEMMATRIX.pattern.includes(r)) MEMMATRIX.pattern.push(r);
  }
  MEMMATRIX.userPattern = [];
  const p = State.players[MEMMATRIX.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Memorize the highlighted tiles!`;

  let html = '<div class="matrix-grid">';
  for (let i = 0; i < 9; i++) {
    const isLit = MEMMATRIX.pattern.includes(i);
    html += `<button class="matrix-tile ${isLit ? 'lit' : ''}" id="mt-${i}">${i + 1}</button>`;
  }
  html += '</div>';
  shellMain().innerHTML = html;

  puzzleTimer = setTimeout(() => {
    for (let i = 0; i < 9; i++) {
      const btn = document.getElementById(`mt-${i}`);
      if (btn) {
        btn.classList.remove('lit');
        btn.onclick = () => memMatrixClick(i);
      }
    }
    shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Tap the tiles you remembered!`;
  }, 1500);
}

function memMatrixClick(i) {
  const btn = document.getElementById(`mt-${i}`);
  if (!btn || MEMMATRIX.userPattern.includes(i)) return;
  MEMMATRIX.userPattern.push(i);

  if (MEMMATRIX.pattern.includes(i)) {
    btn.classList.add('lit');
    playSound('match');
    if (MEMMATRIX.userPattern.length === MEMMATRIX.pattern.length) {
      const p = State.players[MEMMATRIX.idx];
      MEMMATRIX.scores[p.name] += 10;
      updateScoreChip(p.name, MEMMATRIX.scores[p.name]);
      playSound('win');
      shellStatus().innerHTML = `${p.emoji} <b>PERFECT MEMORY!</b> +10 pts`;
      setTimeout(memMatrixAdvance, 1200);
    }
  } else {
    btn.style.background = 'var(--p1)';
    playSound('die');
    shellStatus().innerHTML = `❌ Wrong tile!`;
    setTimeout(memMatrixAdvance, 1000);
  }
}

function memMatrixAdvance() {
  MEMMATRIX.idx = (MEMMATRIX.idx + 1) % State.playerCount;
  if (MEMMATRIX.idx === 0) MEMMATRIX.round++;
  if (MEMMATRIX.round > MEMMATRIX.rounds) {
    const s = Object.entries(MEMMATRIX.scores).sort((a, b) => b[1] - a[1]);
    showResult(MEMMATRIX.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
  } else {
    memMatrixNext();
  }
}

// ── 53. ODD ONE OUT ───────────────────────────────────────────
const ODDONE = {
  scores: {}, idx: 0, round: 1, rounds: 4,
};

function startOddOneOut() {
  ODDONE.scores = {};
  State.players.forEach(p => ODDONE.scores[p.name] = 0);
  ODDONE.idx = 0; ODDONE.round = 1;
  shellSetup('👁️ ODD ONE OUT');
  buildScoreStrip('shell-scores', ODDONE.scores);
  oddOneNext();
}

function oddOneNext() {
  puzzleStop();
  const base = ['🔴', '🔵', '🟢', '🟡'][Math.floor(Math.random() * 4)];
  const odd = ['🟣', '🟠', '⚪', '🟤'][Math.floor(Math.random() * 4)];
  const oddIdx = Math.floor(Math.random() * 9);
  const p = State.players[ODDONE.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Tap the symbol that doesn't fit!`;

  let html = '<div class="matrix-grid">';
  for (let i = 0; i < 9; i++) {
    const sym = i === oddIdx ? odd : base;
    html += `<button class="matrix-tile" onclick="oddOneClick(${i === oddIdx})">${sym}</button>`;
  }
  html += '</div>';
  shellMain().innerHTML = html;
}

function oddOneClick(isOdd) {
  const p = State.players[ODDONE.idx];
  if (isOdd) {
    ODDONE.scores[p.name] += 5;
    updateScoreChip(p.name, ODDONE.scores[p.name]);
    playSound('match');
    shellStatus().innerHTML = `${p.emoji} <b>SPOTTED!</b> +5 pts`;
  } else {
    playSound('die');
    shellStatus().innerHTML = `❌ Wrong symbol!`;
  }

  setTimeout(() => {
    ODDONE.idx = (ODDONE.idx + 1) % State.playerCount;
    if (ODDONE.idx === 0) ODDONE.round++;
    if (ODDONE.round > ODDONE.rounds) {
      const s = Object.entries(ODDONE.scores).sort((a, b) => b[1] - a[1]);
      showResult(ODDONE.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      oddOneNext();
    }
  }, 1000);
}

// ── 54. ANAGRAM HUNT ──────────────────────────────────────────
const ANAGRAM = {
  scores: {}, idx: 0, round: 1, rounds: 4, current: '', answer: '',
  words: ['EARTH', 'SOLAR', 'PLANET', 'GALAXY', 'SHADOW', 'SILVER', 'MAGIC', 'DRAGON'],
};

function startAnagram() {
  ANAGRAM.scores = {};
  State.players.forEach(p => ANAGRAM.scores[p.name] = 0);
  ANAGRAM.idx = 0; ANAGRAM.round = 1;
  shellSetup('🔤 ANAGRAM HUNT');
  buildScoreStrip('shell-scores', ANAGRAM.scores);
  anagramNext();
}

function anagramNext() {
  puzzleStop();
  const word = ANAGRAM.words[Math.floor(Math.random() * ANAGRAM.words.length)];
  ANAGRAM.answer = word;
  ANAGRAM.current = word.split('').sort(() => Math.random() - 0.5).join('');
  const p = State.players[ANAGRAM.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Solve the anagram!`;

  shellMain().innerHTML = `
    <div class="word-wrap">
      <div class="word-scrambled">${ANAGRAM.current}</div>
      <input type="text" class="word-input" id="ana-input" placeholder="Type word..." autocomplete="off" autofocus />
      <button class="btn-primary" onclick="anagramSubmit()">SUBMIT</button>
    </div>
  `;

  const input = document.getElementById('ana-input');
  if (input) {
    input.focus();
    input.onkeyup = (e) => { if (e.key === 'Enter') anagramSubmit(); };
  }
}

function anagramSubmit() {
  const input = document.getElementById('ana-input');
  if (!input) return;
  const val = input.value.trim().toUpperCase();
  const p = State.players[ANAGRAM.idx];

  if (val === ANAGRAM.answer) {
    ANAGRAM.scores[p.name] += 10;
    updateScoreChip(p.name, ANAGRAM.scores[p.name]);
    playSound('win');
    shellStatus().innerHTML = `${p.emoji} <b>SOLVED!</b> +10 pts`;
  } else {
    playSound('die');
    shellStatus().innerHTML = `❌ Word was <b>${ANAGRAM.answer}</b>`;
  }

  setTimeout(() => {
    ANAGRAM.idx = (ANAGRAM.idx + 1) % State.playerCount;
    if (ANAGRAM.idx === 0) ANAGRAM.round++;
    if (ANAGRAM.round > ANAGRAM.rounds) {
      const s = Object.entries(ANAGRAM.scores).sort((a, b) => b[1] - a[1]);
      showResult(ANAGRAM.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      anagramNext();
    }
  }, 1200);
}

// ── 55. MINI SUDOKU 4x4 ───────────────────────────────────────
const SUDOKU = {
  scores: {}, idx: 0, missingVal: 0,
};

function startMiniSudoku() {
  SUDOKU.scores = {};
  State.players.forEach(p => SUDOKU.scores[p.name] = 0);
  SUDOKU.idx = 0;
  shellSetup('🔢 MINI SUDOKU');
  buildScoreStrip('shell-scores', SUDOKU.scores);
  sudokuNext();
}

function sudokuNext() {
  puzzleStop();
  SUDOKU.missingVal = Math.floor(Math.random() * 4) + 1;
  const p = State.players[SUDOKU.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Which number fills the <b>?</b> cell?`;

  const gridVals = [1, 2, 3, 4].sort(() => Math.random() - 0.5);
  let html = '<div class="sudoku-grid">';
  gridVals.forEach(v => {
    if (v === SUDOKU.missingVal) {
      html += `<div class="sudoku-cell missing">?</div>`;
    } else {
      html += `<div class="sudoku-cell">${v}</div>`;
    }
  });
  html += '</div><div class="color-btns" style="margin-top:16px">';
  for (let num = 1; num <= 4; num++) {
    html += `<button class="btn-primary" style="min-width:60px" onclick="sudokuAns(${num})">${num}</button>`;
  }
  html += '</div>';

  shellMain().innerHTML = html;
}

function sudokuAns(num) {
  const p = State.players[SUDOKU.idx];
  if (num === SUDOKU.missingVal) {
    SUDOKU.scores[p.name] += 10;
    updateScoreChip(p.name, SUDOKU.scores[p.name]);
    playSound('match');
    shellStatus().innerHTML = `${p.emoji} <b>CORRECT!</b> +10 pts`;
  } else {
    playSound('die');
    shellStatus().innerHTML = `❌ Missing number was ${SUDOKU.missingVal}`;
  }

  setTimeout(() => {
    SUDOKU.idx = (SUDOKU.idx + 1) % State.playerCount;
    if (SUDOKU.idx === 0) {
      const s = Object.entries(SUDOKU.scores).sort((a, b) => b[1] - a[1]);
      showResult(SUDOKU.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      sudokuNext();
    }
  }, 1200);
}

// ── 56. SHAPE MATCHER ────────────────────────────────────────
const SHAPEFIT = {
  scores: {}, idx: 0, round: 1, rounds: 4, target: '',
  shapes: ['⭐ Star', '💎 Diamond', '🔺 Triangle', '🔴 Circle', '🟩 Square'],
};

function startShapeFit() {
  SHAPEFIT.scores = {};
  State.players.forEach(p => SHAPEFIT.scores[p.name] = 0);
  SHAPEFIT.idx = 0; SHAPEFIT.round = 1;
  shellSetup('📐 SHAPE MATCHER');
  buildScoreStrip('shell-scores', SHAPEFIT.scores);
  shapeFitNext();
}

function shapeFitNext() {
  puzzleStop();
  SHAPEFIT.target = SHAPEFIT.shapes[Math.floor(Math.random() * SHAPEFIT.shapes.length)];
  const p = State.players[SHAPEFIT.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Pick shape: <b>${SHAPEFIT.target.split(' ')[1]}</b>!`;

  let html = '<div class="color-btns" style="flex-wrap:wrap;justify-content:center">';
  SHAPEFIT.shapes.forEach(s => {
    html += `<button class="btn-primary" style="min-width:120px" onclick="shapeFitAns('${s}')">${s.split(' ')[0]}</button>`;
  });
  html += '</div>';

  shellMain().innerHTML = html;
}

function shapeFitAns(chosen) {
  const p = State.players[SHAPEFIT.idx];
  if (chosen === SHAPEFIT.target) {
    SHAPEFIT.scores[p.name] += 5;
    updateScoreChip(p.name, SHAPEFIT.scores[p.name]);
    playSound('match');
    shellStatus().innerHTML = `${p.emoji} <b>MATCHED!</b> +5 pts`;
  } else {
    playSound('die');
    shellStatus().innerHTML = `❌ Wrong shape!`;
  }

  setTimeout(() => {
    SHAPEFIT.idx = (SHAPEFIT.idx + 1) % State.playerCount;
    if (SHAPEFIT.idx === 0) SHAPEFIT.round++;
    if (SHAPEFIT.round > SHAPEFIT.rounds) {
      const s = Object.entries(SHAPEFIT.scores).sort((a, b) => b[1] - a[1]);
      showResult(SHAPEFIT.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      shapeFitNext();
    }
  }, 1000);
}

// ── 57. NUMBER SEQUENCE ───────────────────────────────────────
const SEQUENCE = {
  scores: {}, idx: 0, ans: 0,
};

function startSequence() {
  SEQUENCE.scores = {};
  State.players.forEach(p => SEQUENCE.scores[p.name] = 0);
  SEQUENCE.idx = 0;
  shellSetup('🔢 NUMBER SEQUENCE');
  buildScoreStrip('shell-scores', SEQUENCE.scores);
  sequenceNext();
}

function sequenceNext() {
  puzzleStop();
  const step = Math.floor(Math.random() * 4) + 2;
  const start = Math.floor(Math.random() * 10) + 1;
  const seq = [start, start + step, start + step * 2, '?'];
  SEQUENCE.ans = start + step * 3;
  const p = State.players[SEQUENCE.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Complete sequence: <b>${seq.join(', ')}</b>`;

  const choices = [SEQUENCE.ans, SEQUENCE.ans + step, SEQUENCE.ans - 1, SEQUENCE.ans + 2].sort(() => Math.random() - 0.5);

  let html = '<div class="color-btns">';
  choices.forEach(c => {
    html += `<button class="btn-primary" style="min-width:70px" onclick="sequenceAns(${c})">${c}</button>`;
  });
  html += '</div>';

  shellMain().innerHTML = html;
}

function sequenceAns(choice) {
  const p = State.players[SEQUENCE.idx];
  if (choice === SEQUENCE.ans) {
    SEQUENCE.scores[p.name] += 10;
    updateScoreChip(p.name, SEQUENCE.scores[p.name]);
    playSound('match');
    shellStatus().innerHTML = `${p.emoji} <b>CORRECT!</b> +10 pts`;
  } else {
    playSound('die');
    shellStatus().innerHTML = `❌ Answer was ${SEQUENCE.ans}`;
  }

  setTimeout(() => {
    SEQUENCE.idx = (SEQUENCE.idx + 1) % State.playerCount;
    if (SEQUENCE.idx === 0) {
      const s = Object.entries(SEQUENCE.scores).sort((a, b) => b[1] - a[1]);
      showResult(SEQUENCE.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      sequenceNext();
    }
  }, 1200);
}

// ── 58. COLOR BLIND TEST ──────────────────────────────────────
const COLORBLIND = {
  scores: {}, idx: 0, ans: 7,
};

function startColorBlind() {
  COLORBLIND.scores = {};
  State.players.forEach(p => COLORBLIND.scores[p.name] = 0);
  COLORBLIND.idx = 0;
  shellSetup('👁️ COLOR MATRIX TEST', { useCanvas: true, cw: 280, ch: 240 });
  buildScoreStrip('shell-scores', COLORBLIND.scores);
  cbNext();
}

function cbNext() {
  puzzleStop();
  COLORBLIND.ans = Math.floor(Math.random() * 9) + 1;
  const p = State.players[COLORBLIND.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Read hidden number in dots!`;
  shellFooter().innerHTML = `<div class="color-btns">${[3, COLORBLIND.ans, 8, 5].filter((v, i, a) => a.indexOf(v) === i).map(n => `<button class="btn-primary" style="min-width:60px" onclick="cbAns(${n})">${n}</button>`).join('')}</div>`;

  cbDraw();
}

function cbDraw() {
  const cv = shellCanvas(), ctx = shellCtx();
  if (!cv || !ctx) return;
  const W = cv.width, H = cv.height;

  ctx.fillStyle = '#1a1a35'; ctx.fillRect(0, 0, W, H);

  // Dot matrix pattern
  for (let i = 0; i < 120; i++) {
    const x = Math.random() * W, y = Math.random() * H;
    const r = 6 + Math.random() * 8;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = Math.random() > 0.5 ? '#ff4d6d88' : '#4dff9188';
    ctx.fill();
  }

  // Draw number in center
  ctx.font = 'bold 90px Fredoka One, cursive';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#4db8ffbb';
  ctx.fillText(COLORBLIND.ans, W / 2, H / 2);
}

function cbAns(n) {
  const p = State.players[COLORBLIND.idx];
  if (n === COLORBLIND.ans) {
    COLORBLIND.scores[p.name] += 10;
    updateScoreChip(p.name, COLORBLIND.scores[p.name]);
    playSound('match');
    shellStatus().innerHTML = `${p.emoji} <b>SPOTTED IT!</b> +10 pts`;
  } else {
    playSound('die');
    shellStatus().innerHTML = `❌ Hidden number was ${COLORBLIND.ans}`;
  }

  setTimeout(() => {
    COLORBLIND.idx = (COLORBLIND.idx + 1) % State.playerCount;
    if (COLORBLIND.idx === 0) {
      const s = Object.entries(COLORBLIND.scores).sort((a, b) => b[1] - a[1]);
      showResult(COLORBLIND.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      cbNext();
    }
  }, 1200);
}

// ── 59. BLACKJACK 21 ─────────────────────────────────────────
const BLACKJACK = {
  scores: {}, idx: 0, playerTotal: 0,
};

function startBlackjack() {
  BLACKJACK.scores = {};
  State.players.forEach(p => BLACKJACK.scores[p.name] = 0);
  BLACKJACK.idx = 0;
  shellSetup('🃏 BLACKJACK 21');
  buildScoreStrip('shell-scores', BLACKJACK.scores);
  bjNext();
}

function bjNext() {
  puzzleStop();
  BLACKJACK.playerTotal = Math.floor(Math.random() * 8) + 10;
  const p = State.players[BLACKJACK.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Total: <b>${BLACKJACK.playerTotal}</b>. HIT or STAND?`;

  shellMain().innerHTML = `
    <div class="word-wrap">
      <div class="word-target">🃏 ${BLACKJACK.playerTotal}</div>
      <div class="color-btns">
        <button class="btn-primary" style="background:var(--p3);color:#000" onclick="bjHit()">🃏 HIT (+Card)</button>
        <button class="btn-primary" style="background:var(--p2)" onclick="bjStand()">✋ STAND</button>
      </div>
    </div>
  `;
}

function bjHit() {
  const card = Math.floor(Math.random() * 10) + 1;
  BLACKJACK.playerTotal += card;
  const p = State.players[BLACKJACK.idx];
  playSound('click');

  if (BLACKJACK.playerTotal > 21) {
    playSound('die');
    shellStatus().innerHTML = `💥 <b>BUST! (${BLACKJACK.playerTotal})</b>`;
    setTimeout(bjAdvance, 1200);
  } else {
    shellStatus().innerHTML = `${p.emoji} Total: <b>${BLACKJACK.playerTotal}</b> (+${card})`;
  }
}

function bjStand() {
  const p = State.players[BLACKJACK.idx];
  const pts = BLACKJACK.playerTotal;
  BLACKJACK.scores[p.name] += pts;
  updateScoreChip(p.name, BLACKJACK.scores[p.name]);
  playSound('win');
  shellStatus().innerHTML = `${p.emoji} <b>STOOD AT ${pts}!</b> +${pts} pts`;
  setTimeout(bjAdvance, 1200);
}

function bjAdvance() {
  BLACKJACK.idx = (BLACKJACK.idx + 1) % State.playerCount;
  if (BLACKJACK.idx === 0) {
    const s = Object.entries(BLACKJACK.scores).sort((a, b) => b[1] - a[1]);
    showResult(BLACKJACK.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
  } else {
    bjNext();
  }
}

// ── 60. DOMINO MATCH ──────────────────────────────────────────
const DOMINO = {
  scores: {}, idx: 0, target: 5,
};

function startDomino() {
  DOMINO.scores = {};
  State.players.forEach(p => DOMINO.scores[p.name] = 0);
  DOMINO.idx = 0;
  shellSetup('🀩 DOMINO MATCH');
  buildScoreStrip('shell-scores', DOMINO.scores);
  dominoNext();
}

function dominoNext() {
  puzzleStop();
  DOMINO.target = Math.floor(Math.random() * 6) + 1;
  const p = State.players[DOMINO.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Pick tile matching number <b>${DOMINO.target}</b>!`;

  const tiles = [
    { a: DOMINO.target, b: 2 },
    { a: 1, b: 4 },
    { a: 3, b: 6 },
    { a: DOMINO.target, b: 5 },
  ].sort(() => Math.random() - 0.5);

  let html = '<div class="color-btns">';
  tiles.forEach(t => {
    html += `<button class="btn-primary" style="min-width:80px" onclick="dominoAns(${t.a === DOMINO.target || t.b === DOMINO.target})">🀩 [${t.a}|${t.b}]</button>`;
  });
  html += '</div>';

  shellMain().innerHTML = html;
}

function dominoAns(ok) {
  const p = State.players[DOMINO.idx];
  if (ok) {
    DOMINO.scores[p.name] += 10;
    updateScoreChip(p.name, DOMINO.scores[p.name]);
    playSound('match');
    shellStatus().innerHTML = `${p.emoji} <b>MATCHED!</b> +10 pts`;
  } else {
    playSound('die');
    shellStatus().innerHTML = `❌ Didn't match ${DOMINO.target}`;
  }

  setTimeout(() => {
    DOMINO.idx = (DOMINO.idx + 1) % State.playerCount;
    if (DOMINO.idx === 0) {
      const s = Object.entries(DOMINO.scores).sort((a, b) => b[1] - a[1]);
      showResult(DOMINO.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      dominoNext();
    }
  }, 1200);
}

// ── 61. CONNECT FOUR ──────────────────────────────────────────
const CONNECT4 = {
  scores: {}, grid: Array(16).fill(null), idx: 0,
};

function startConnect4() {
  CONNECT4.scores = {};
  State.players.forEach(p => CONNECT4.scores[p.name] = 0);
  CONNECT4.grid = Array(16).fill(null);
  CONNECT4.idx = 0;
  shellSetup('🔴 CONNECT FOUR');
  buildScoreStrip('shell-scores', CONNECT4.scores);
  c4Render();
}

function c4Render() {
  puzzleStop();
  const p = State.players[CONNECT4.idx];
  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Drop your coin!`;

  let html = '<div class="matrix-grid" style="grid-template-columns:repeat(4,1fr)">';
  CONNECT4.grid.forEach((v, i) => {
    html += `<button class="matrix-tile" style="background:${v ? v.color : 'var(--surface2)'}" onclick="c4Drop(${i})">${v ? v.emoji : ''}</button>`;
  });
  html += '</div>';

  shellMain().innerHTML = html;
}

function c4Drop(i) {
  if (CONNECT4.grid[i]) return;
  const p = State.players[CONNECT4.idx];
  CONNECT4.grid[i] = p;
  CONNECT4.scores[p.name] += 5;
  updateScoreChip(p.name, CONNECT4.scores[p.name]);
  playSound('place');

  CONNECT4.idx = (CONNECT4.idx + 1) % State.playerCount;
  if (CONNECT4.grid.every(v => v !== null)) {
    const s = Object.entries(CONNECT4.scores).sort((a, b) => b[1] - a[1]);
    showResult(CONNECT4.scores, s[0][0], false);
  } else {
    c4Render();
  }
}

// ── 62. WORD BOGGLE ───────────────────────────────────────────
const BOGGLE = {
  scores: {}, idx: 0, target: 'CAT',
  words: ['DOG', 'CAT', 'SUN', 'STAR', 'MOON', 'FISH', 'LION'],
};

function startBoggle() {
  BOGGLE.scores = {};
  State.players.forEach(p => BOGGLE.scores[p.name] = 0);
  BOGGLE.idx = 0;
  shellSetup('🔤 WORD BOGGLE');
  buildScoreStrip('shell-scores', BOGGLE.scores);
  boggleNext();
}

function boggleNext() {
  puzzleStop();
  BOGGLE.target = BOGGLE.words[Math.floor(Math.random() * BOGGLE.words.length)];
  const p = State.players[BOGGLE.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Type the word shown: <b>${BOGGLE.target}</b>`;

  shellMain().innerHTML = `
    <div class="word-wrap">
      <input type="text" class="word-input" id="bog-input" placeholder="Type here..." autocomplete="off" autofocus />
      <button class="btn-primary" onclick="boggleSubmit()">SUBMIT</button>
    </div>
  `;

  const input = document.getElementById('bog-input');
  if (input) {
    input.focus();
    input.onkeyup = (e) => { if (e.key === 'Enter') boggleSubmit(); };
  }
}

function boggleSubmit() {
  const input = document.getElementById('bog-input');
  if (!input) return;
  const val = input.value.trim().toUpperCase();
  const p = State.players[BOGGLE.idx];

  if (val === BOGGLE.target) {
    BOGGLE.scores[p.name] += 10;
    updateScoreChip(p.name, BOGGLE.scores[p.name]);
    playSound('win');
    shellStatus().innerHTML = `${p.emoji} <b>MATCHED!</b> +10 pts`;
  } else {
    playSound('die');
    shellStatus().innerHTML = `❌ Word was ${BOGGLE.target}`;
  }

  setTimeout(() => {
    BOGGLE.idx = (BOGGLE.idx + 1) % State.playerCount;
    if (BOGGLE.idx === 0) {
      const s = Object.entries(BOGGLE.scores).sort((a, b) => b[1] - a[1]);
      showResult(BOGGLE.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      boggleNext();
    }
  }, 1200);
}
