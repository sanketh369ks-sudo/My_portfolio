/* ======================================================
   TIC-TAC-TOE – Up to 4 players, 3x3 board
   Each player has a unique symbol: ✕ ◯ △ □
   ====================================================== */

const TTT = {
  board:       Array(9).fill(null),
  scores:      {},
  currentIdx:  0,
  gameOver:    false,
  symbols:     ['✕', '◯', '△', '□'],
  WIN_LINES:   [
    [0,1,2],[3,4,5],[6,7,8],  // rows
    [0,3,6],[1,4,7],[2,5,8],  // cols
    [0,4,8],[2,4,6],          // diagonals
  ],
};

// ── ENTRY ──────────────────────────────────────────────
function startTTT() {
  TTT.board      = Array(9).fill(null);
  TTT.currentIdx = 0;
  TTT.gameOver   = false;

  // Reset round scores
  TTT.scores = {};
  State.players.forEach(p => TTT.scores[p.name] = 0);

  buildScoreStrip('ttt-scores', TTT.scores);
  tttRender();
  tttUpdateTurnBadge();
  showScreen('screen-ttt');
}

// ── CLICK ──────────────────────────────────────────────
function tttClick(idx) {
  if (TTT.board[idx] !== null || TTT.gameOver) return;

  const player = State.players[TTT.currentIdx];
  TTT.board[idx] = TTT.currentIdx;

  playSound('place');
  tttRender();

  const winner = tttCheckWinner();
  if (winner !== null) {
    TTT.gameOver = true;
    if (winner === -1) {
      // Draw
      setTimeout(() => {
        playSound('draw');
        showResult(TTT.scores, null, true);
      }, 500);
    } else {
      const wp = State.players[winner];
      TTT.scores[wp.name]++;
      updateScoreChip(wp.name, TTT.scores[wp.name]);
      tttHighlightWin(winner);
      setTimeout(() => {
        showResult(TTT.scores, wp.name, false);
      }, 900);
    }
    return;
  }

  // Next player
  TTT.currentIdx = (TTT.currentIdx + 1) % State.playerCount;
  tttUpdateTurnBadge();
}

// ── RENDER ─────────────────────────────────────────────
function tttRender() {
  for (let i = 0; i < 9; i++) {
    const cell = document.getElementById('c' + i);
    const val  = TTT.board[i];
    cell.textContent = '';
    cell.className   = 'ttt-cell';
    cell.classList.remove('taken');

    if (val !== null) {
      const sym = TTT.symbols[val];
      cell.textContent = sym;
      cell.classList.add('taken');
      // Add player color class
      const cls = ['ttt-symbol-x','ttt-symbol-o','ttt-symbol-a','ttt-symbol-b'][val];
      cell.classList.add(cls);
      cell.style.animation = 'pop-in 0.25s cubic-bezier(0.34,1.56,0.64,1)';
    }
  }
}

// ── UPDATE TURN BADGE ──────────────────────────────────
function tttUpdateTurnBadge() {
  const p     = State.players[TTT.currentIdx];
  const badge = document.getElementById('ttt-turn-badge');
  const icon  = document.getElementById('ttt-turn-icon');
  const label = document.getElementById('ttt-turn-label');

  if (p) {
    icon.textContent  = p.emoji;
    label.textContent = `${p.name}'s Turn (${TTT.symbols[TTT.currentIdx]})`;
    badge.style.borderColor = p.color;
    badge.style.color       = p.color;
    badge.style.background  = p.color + '18';
  }

  // CPU turn trigger
  if (p && p.name && p.name.startsWith('CPU') && !TTT.gameOver) {
    setTimeout(() => {
      if (TTT.gameOver) return;
      const empty = TTT.board.map((v, i) => v === null ? i : null).filter(v => v !== null);
      if (empty.length > 0) {
        const pick = empty[Math.floor(Math.random() * empty.length)];
        tttClick(pick);
      }
    }, 600);
  }
}

// ── CHECK WINNER ───────────────────────────────────────
function tttCheckWinner() {
  for (const [a,b,c] of TTT.WIN_LINES) {
    if (TTT.board[a] !== null &&
        TTT.board[a] === TTT.board[b] &&
        TTT.board[b] === TTT.board[c]) {
      return TTT.board[a]; // player index
    }
  }
  if (TTT.board.every(v => v !== null)) return -1; // draw
  return null;
}

// ── HIGHLIGHT WIN ──────────────────────────────────────
function tttHighlightWin(winner) {
  for (const [a,b,c] of TTT.WIN_LINES) {
    if (TTT.board[a] === winner &&
        TTT.board[b] === winner &&
        TTT.board[c] === winner) {
      [a,b,c].forEach(i => {
        document.getElementById('c' + i).classList.add('win-cell');
      });
      break;
    }
  }
  playSound('win');
}

// ── RESTART ────────────────────────────────────────────
function tttRestart() {
  TTT.board      = Array(9).fill(null);
  TTT.currentIdx = 0;
  TTT.gameOver   = false;
  tttRender();
  tttUpdateTurnBadge();
  playSound('click');
}
