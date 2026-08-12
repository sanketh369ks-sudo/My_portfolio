/* ======================================================
   MATHS GAME – 1–4 players
   Each round: a random math question appears.
   First player to press their key AND give the right answer wins the point.
   
   Keys:
   P1: Z    P2: M    P3: Q    P4: P
   
   Then they type the answer using number keys.
   ====================================================== */

const MATH = {
  scores:      {},
  question:    null,
  answer:      0,
  round:       1,
  totalRounds: 8,
  buzzed:      null,   // player index who buzzed first
  buzzInput:   '',     // digits typed so far
  BUZZ_KEYS:   ['z', 'm', 'q', 'p'],
  state:       'idle', // idle | buzzed | reveal
  timer:       0,
  timerInt:    null,
  ANSWER_TIME: 8,     // seconds to answer after buzzing
};

// ── ENTRY ──────────────────────────────────────────────
function startMath() {
  MATH.scores      = {};
  State.players.forEach(p => MATH.scores[p.name] = 0);
  MATH.round  = 1;
  MATH.state  = 'idle';
  MATH.buzzed = null;

  buildScoreStrip('math-scores', MATH.scores);
  mathNewQuestion();
  mathUpdateRound();
  showScreen('screen-math');

  renderMultiplayerTouchBar('math-touch-buzzers', State.playerCount, (pIdx) => {
    mathBuzz(pIdx);
  });
}

// ── QUESTION GENERATOR ─────────────────────────────────
function mathNewQuestion() {
  clearInterval(MATH.timerInt);
  MATH.buzzed    = null;
  MATH.buzzInput = '';
  MATH.state     = 'idle';

  const difficulty = Math.floor(MATH.round / 3); // 0=easy,1=medium,2=hard
  let q, a;

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const type = rand(0, difficulty < 1 ? 1 : difficulty < 2 ? 3 : 5);

  switch (type) {
    case 0: { // Addition easy
      const x = rand(1, 20 + difficulty * 30);
      const y = rand(1, 20 + difficulty * 30);
      q = `${x} + ${y}`; a = x + y;
      break;
    }
    case 1: { // Subtraction
      const x = rand(5, 30 + difficulty * 30);
      const y = rand(1, x);
      q = `${x} − ${y}`; a = x - y;
      break;
    }
    case 2: { // Multiplication
      const x = rand(2, 6 + difficulty * 4);
      const y = rand(2, 6 + difficulty * 4);
      q = `${x} × ${y}`; a = x * y;
      break;
    }
    case 3: { // Division (clean)
      const y = rand(2, 9);
      const a_ = rand(1, 10);
      q = `${y * a_} ÷ ${y}`; a = a_;
      break;
    }
    case 4: { // Mixed: (a + b) × c
      const x = rand(1, 8); const y = rand(1, 8); const z = rand(2, 5);
      q = `(${x} + ${y}) × ${z}`; a = (x + y) * z;
      break;
    }
    case 5: { // Squares
      const x = rand(2, 10 + difficulty);
      q = `${x}²`; a = x * x;
      break;
    }
    default: {
      const x = rand(1, 50); const y = rand(1, 50);
      q = `${x} + ${y}`; a = x + y;
    }
  }

  MATH.question = q;
  MATH.answer   = a;

  mathRender();
  playSound('click');
}

// ── RENDER ─────────────────────────────────────────────
function mathRender() {
  const qEl  = document.getElementById('math-question');
  const subEl = document.getElementById('math-sub');
  const inputEl = document.getElementById('math-input-display');
  const timerEl = document.getElementById('math-timer-bar');

  if (qEl)  qEl.textContent  = MATH.question || '';
  if (inputEl) inputEl.textContent = MATH.buzzInput || '?';

  if (MATH.state === 'idle') {
    if (subEl) {
      subEl.innerHTML = State.players.slice(0, State.playerCount).map((p, i) =>
        `<span style="color:${p.color}">${p.emoji} <b>${MATH.BUZZ_KEYS[i].toUpperCase()}</b></span>`
      ).join('  ');
    }
    if (inputEl) inputEl.style.display = 'none';
    if (timerEl) timerEl.style.width = '100%';
    mathSetBoardStyle('');
    mathRenderTouchControls();
  } else if (MATH.state === 'buzzed') {
    const bp = State.players[MATH.buzzed];
    if (subEl) subEl.innerHTML = `<span style="color:${bp.color}">${bp.emoji} ${bp.name} BUZZED! Type your answer…</span>`;
    if (inputEl) { inputEl.style.display = 'block'; inputEl.style.color = bp.color; }
    mathSetBoardStyle(bp.color + '22');
    mathRenderTouchControls();
  } else if (MATH.state === 'reveal') {
    mathRenderTouchControls();
  }
}

function mathRenderTouchControls() {
  const container = document.getElementById('math-touch-buzzers');
  if (!container) return;
  if (MATH.state === 'idle') {
    renderMultiplayerTouchBar(container, State.playerCount, (pIdx) => mathBuzz(pIdx));
  } else if (MATH.state === 'buzzed') {
    container.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;max-width:320px;margin:10px auto;">
        ${[1,2,3,4,5,6,7,8,9,0,'-','⌫'].map(k => `
          <button class="btn-secondary" style="font-size:1.2rem;font-weight:800;padding:10px 0;" onclick="mathKeyPad('${k}')">${k}</button>
        `).join('')}
        <button class="btn-primary" style="grid-column:span 4;padding:10px;font-size:1.1rem;" onclick="mathSubmit()">SUBMIT ANSWER ➔</button>
      </div>
    `;
  } else {
    container.innerHTML = '';
  }
}

function mathKeyPad(key) {
  if (MATH.state !== 'buzzed') return;
  if (key === '⌫') {
    MATH.buzzInput = MATH.buzzInput.slice(0, -1);
  } else if (MATH.buzzInput.length < 5) {
    MATH.buzzInput += key;
  }
  mathRender();
}

function mathSetBoardStyle(bg) {
  const board = document.getElementById('math-board');
  if (board) board.style.background = bg || 'var(--surface)';
}

function mathUpdateRound() {
  const el = document.getElementById('math-round');
  if (el) el.textContent = `Round ${MATH.round} / ${MATH.totalRounds}`;
}

// ── BUZZ IN ────────────────────────────────────────────
function mathBuzz(playerIdx) {
  if (MATH.state !== 'idle') return;
  MATH.state  = 'buzzed';
  MATH.buzzed = playerIdx;
  MATH.buzzInput = '';
  MATH.timer  = MATH.ANSWER_TIME;

  playSound('start');
  mathRender();

  // Countdown timer
  const timerEl = document.getElementById('math-timer-bar');
  MATH.timerInt = setInterval(() => {
    MATH.timer--;
    if (timerEl) {
      timerEl.style.width = `${(MATH.timer / MATH.ANSWER_TIME) * 100}%`;
      timerEl.style.background = MATH.timer <= 3 ? 'var(--p1)' : 'var(--accent)';
    }
    if (MATH.timer <= 0) mathTimeOut();
  }, 1000);
}

// ── SUBMIT ANSWER ──────────────────────────────────────
function mathSubmit() {
  if (MATH.state !== 'buzzed') return;
  clearInterval(MATH.timerInt);

  const guess = parseInt(MATH.buzzInput, 10);
  const p     = State.players[MATH.buzzed];
  const correct = !isNaN(guess) && guess === MATH.answer;

  MATH.state = 'reveal';

  const subEl = document.getElementById('math-sub');
  const qEl   = document.getElementById('math-question');

  if (correct) {
    MATH.scores[p.name]++;
    updateScoreChip(p.name, MATH.scores[p.name]);
    if (subEl) subEl.innerHTML = `<span style="color:var(--p3)">✅ CORRECT! +1 point to ${p.emoji} ${p.name}</span>`;
    if (qEl)   qEl.textContent = `${MATH.question} = ${MATH.answer}`;
    playSound('match');
  } else {
    if (subEl) subEl.innerHTML = `<span style="color:var(--p1)">❌ Wrong! The answer was ${MATH.answer}</span>`;
    playSound('die');
  }

  mathSetBoardStyle('');
  const inputEl = document.getElementById('math-input-display');
  if (inputEl) {
    inputEl.textContent = guess;
    inputEl.style.color = correct ? 'var(--p3)' : 'var(--p1)';
  }

  setTimeout(() => {
    MATH.round++;
    if (MATH.round > MATH.totalRounds) {
      // Game over
      const sorted = Object.entries(MATH.scores).sort((a,b) => b[1]-a[1]);
      const isDraw  = sorted.length > 1 && sorted[0][1] === sorted[1][1];
      showResult(MATH.scores, sorted[0][0], isDraw);
    } else {
      mathNewQuestion();
      mathUpdateRound();
      buildScoreStrip('math-scores', MATH.scores);
    }
  }, 1800);
}

function mathTimeOut() {
  clearInterval(MATH.timerInt);
  const p    = State.players[MATH.buzzed];
  const subEl = document.getElementById('math-sub');
  if (subEl) subEl.innerHTML = `<span style="color:var(--p1)">⏱️ Time's up! Answer was ${MATH.answer}</span>`;
  MATH.state = 'reveal';
  mathSetBoardStyle('');
  playSound('die');

  setTimeout(() => {
    MATH.round++;
    if (MATH.round > MATH.totalRounds) {
      const sorted = Object.entries(MATH.scores).sort((a,b) => b[1]-a[1]);
      const isDraw  = sorted.length > 1 && sorted[0][1] === sorted[1][1];
      showResult(MATH.scores, sorted[0][0], isDraw);
    } else {
      mathNewQuestion();
      mathUpdateRound();
    }
  }, 1800);
}

// ── KEYBOARD HANDLER ───────────────────────────────────
document.addEventListener('keydown', e => {
  const screen = document.getElementById('screen-math');
  if (!screen || !screen.classList.contains('active')) return;

  const key = e.key.toLowerCase();

  // Buzz in keys
  if (MATH.state === 'idle') {
    MATH.BUZZ_KEYS.slice(0, State.playerCount).forEach((bk, i) => {
      if (key === bk) mathBuzz(i);
    });
    return;
  }

  // Typing answer
  if (MATH.state === 'buzzed') {
    if (key >= '0' && key <= '9') {
      if (MATH.buzzInput.length < 5) {
        MATH.buzzInput += key;
        mathRender();
        playSound('click');
      }
    } else if (key === 'backspace') {
      MATH.buzzInput = MATH.buzzInput.slice(0, -1);
      mathRender();
    } else if (key === 'enter') {
      mathSubmit();
    } else if (key === '-' && MATH.buzzInput.length === 0) {
      MATH.buzzInput = '-';
      mathRender();
    }
  }
});
