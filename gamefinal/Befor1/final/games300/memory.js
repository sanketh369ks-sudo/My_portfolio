/* ======================================================
   MEMORY GAME – 1–4 players, take turns matching pairs
   4x4 grid = 16 cards = 8 pairs of emojis
   ====================================================== */

const MEM = {
  EMOJIS: ['🎮','🚀','⭐','🎯','🔥','💎','🌈','🎸',
            '🦄','🍕','🎃','🌊','🎨','🏆','⚡','🎉'],
  cards:       [],
  flipped:     [],
  matched:     new Set(),
  scores:      {},
  currentIdx:  0,
  locked:      false,
  totalPairs:  8,
};

// ── ENTRY ──────────────────────────────────────────────
function startMem() {
  MEM.cards      = [];
  MEM.flipped    = [];
  MEM.matched    = new Set();
  MEM.currentIdx = 0;
  MEM.locked     = false;

  MEM.scores = {};
  State.players.forEach(p => MEM.scores[p.name] = 0);

  memBuildBoard();
  memUpdateHud();
  buildMemHud();
  showScreen('screen-mem');
}

function buildMemHud() {
  const hud = document.getElementById('mem-scores-hud');
  hud.innerHTML = '';
  State.players.forEach(p => {
    const div = document.createElement('div');
    div.className = 'wam-score-item';
    div.innerHTML = `
      <span class="wam-score-name" style="color:${p.color}">${p.emoji} ${p.name}</span>
      <span class="wam-score-val" id="mem-val-${p.name.replace(/\s/g,'_')}" style="color:${p.color}">0</span>
    `;
    hud.appendChild(div);
  });
}

// ── BUILD BOARD ────────────────────────────────────────
function memBuildBoard() {
  // Pick 8 pairs from emoji list
  const emojis = MEM.EMOJIS.slice(0, 8);
  const deck   = [...emojis, ...emojis];

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  MEM.cards = deck;

  const board = document.getElementById('mem-board');
  board.innerHTML = '';

  deck.forEach((emoji, i) => {
    const card = document.createElement('div');
    card.className   = 'mem-card';
    card.id          = `mem-card-${i}`;
    card.dataset.idx = i;
    card.innerHTML   = `
      <span class="card-back">🂠</span>
      <span class="card-front">${emoji}</span>
    `;
    card.addEventListener('click', () => memFlip(i));
    board.appendChild(card);
  });
}

// ── FLIP CARD ──────────────────────────────────────────
function memFlip(idx) {
  if (MEM.locked) return;
  if (MEM.matched.has(idx)) return;
  if (MEM.flipped.includes(idx)) return;
  if (MEM.flipped.length >= 2) return;

  const card = document.getElementById(`mem-card-${idx}`);
  card.classList.add('flipped');
  MEM.flipped.push(idx);
  playSound('flip');

  if (MEM.flipped.length === 2) {
    MEM.locked = true;
    const [a, b] = MEM.flipped;

    if (MEM.cards[a] === MEM.cards[b]) {
      // Match!
      setTimeout(() => {
        document.getElementById(`mem-card-${a}`).classList.add('matched');
        document.getElementById(`mem-card-${b}`).classList.add('matched');
        MEM.matched.add(a);
        MEM.matched.add(b);

        const p = State.players[MEM.currentIdx];
        MEM.scores[p.name]++;
        const scoreEl = document.getElementById(`mem-val-${p.name.replace(/\s/g,'_')}`);
        if (scoreEl) scoreEl.textContent = MEM.scores[p.name];

        playSound('match');
        MEM.flipped = [];
        MEM.locked  = false;

        // Stay on same player (matched = extra turn)
        memUpdateHud();

        if (MEM.matched.size === MEM.cards.length) {
          // All matched!
          setTimeout(() => {
            const sorted = Object.entries(MEM.scores).sort((a,b) => b[1]-a[1]);
            const isDraw  = sorted.length > 1 && sorted[0][1] === sorted[1][1];
            showResult(MEM.scores, sorted[0][0], isDraw);
          }, 600);
        }
      }, 400);
    } else {
      // No match – flip back
      setTimeout(() => {
        document.getElementById(`mem-card-${a}`).classList.remove('flipped');
        document.getElementById(`mem-card-${b}`).classList.remove('flipped');
        MEM.flipped = [];
        MEM.locked  = false;

        // Next player's turn
        MEM.currentIdx = (MEM.currentIdx + 1) % State.playerCount;
        memUpdateHud();
      }, 900);
    }
  }
}

// ── UPDATE HUD ─────────────────────────────────────────
function memUpdateHud() {
  const p   = State.players[MEM.currentIdx];
  const el  = document.getElementById('mem-turn-label');
  if (el && p) {
    el.textContent = `${p.emoji} ${p.name}`;
    el.style.color = p.color;
  }

  // CPU turn
  if (p && p.name && p.name.startsWith('CPU') && !MEM.locked && MEM.matched.size < MEM.cards.length) {
    setTimeout(() => {
      if (MEM.locked || MEM.matched.size >= MEM.cards.length) return;
      const unFlip = MEM.cards.map((_, i) => i).filter(i => !MEM.matched.has(i) && !MEM.flipped.includes(i));
      if (unFlip.length > 0) {
        const pick1 = unFlip[Math.floor(Math.random() * unFlip.length)];
        memFlip(pick1);
        setTimeout(() => {
          if (MEM.matched.size >= MEM.cards.length) return;
          const unFlip2 = MEM.cards.map((_, i) => i).filter(i => !MEM.matched.has(i) && !MEM.flipped.includes(i));
          if (unFlip2.length > 0) {
            const pick2 = unFlip2[Math.floor(Math.random() * unFlip2.length)];
            memFlip(pick2);
          }
        }, 600);
      }
    }, 700);
  }
}
