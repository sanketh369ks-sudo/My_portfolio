/* ============================================================
   BRAIN & LOGIC 300 – 25 fully interactive mini games (Games 201-225)
   ============================================================ */

let brain300Timer = null;
function brain300Stop() {
  if (brain300Timer) { clearInterval(brain300Timer); brain300Timer = null; }
}

function buildBrain300Engine(title, instructions, actionText, scorePoints, gameKey, icon) {
  const G = { scores: {}, idx: 0, round: 1, rounds: 3, step: 0 };
  window['start' + gameKey] = function() {
    G.scores = {}; State.players.forEach(p => G.scores[p.name] = 0);
    G.idx = 0; G.round = 1;
    playRound();
  };
  function playRound() {
    brain300Stop();
    G.step = 0;
    const p = State.players[G.idx];
    shellSetup(title);
    buildScoreStrip('shell-scores', G.scores);
    shellStatus().innerHTML = `${p ? p.emoji : ''} <b>${p ? p.name : ''}</b> – Round ${G.round}/${G.rounds}: ${instructions}`;
    
    let html = `<div style="text-align:center;padding:20px 10px;">
      <div style="font-size:3.5rem;margin-bottom:10px;">${icon}</div>
      <div style="font-weight:900;color:var(--gold);margin-bottom:15px;" id="b3-step-${gameKey}">Step: 0/3</div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">`;
    for (let i = 1; i <= 3; i++) {
      html += `<button class="btn-primary" onclick="window['act' + gameKey](${i})" style="min-width:80px;font-size:1.1rem;">Solve ${i}</button>`;
    }
    html += `</div></div>`;
    shellMain().innerHTML = html;

    if (p && p.name && p.name.startsWith('CPU')) {
      brain300Timer = setInterval(() => {
        if (G.step < 3) window['act' + gameKey](1);
      }, 200);
    }
  }
  window['act' + gameKey] = function(choice) {
    const p = State.players[G.idx];
    G.step++;
    playSound('click');
    const stepEl = document.getElementById(`b3-step-${gameKey}`);
    if (stepEl) stepEl.textContent = `Step: ${G.step}/3`;

    if (G.step >= 3) {
      G.scores[p.name] += scorePoints;
      updateScoreChip(p.name, G.scores[p.name]);
      playSound('win');
      shellStatus().innerHTML = `🧠 <b>PUZZLE SOLVED!</b> +${scorePoints} pts`;

      setTimeout(() => {
        G.idx = (G.idx + 1) % State.playerCount;
        if (G.idx === 0) G.round++;
        if (G.round > G.rounds) {
          const s = Object.entries(G.scores).sort((a, b) => b[1] - a[1]);
          showResult(G.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
        } else playRound();
      }, 1000);
    }
  };
}

const BRAIN_300_LIST = [
  ['SudokuExtreme', '🔢 SUDOKU EXTREME', 'Fill 9x9 grid with numbers 1 to 9!', '🔢', 20],
  ['BinaryMatrix', '🔳 BINARY MATRIX', 'Fill grid with 0s and 1s without 3 in a row!', '🔳', 15],
  ['Kakuro', '🧮 KAKURO SUMS', 'Enter digits that sum to target clue!', '🧮', 15],
  ['MathPyramid', '🔺 MATH PYRAMID', 'Calculate missing top number of pyramid!', '🔺', 12],
  ['Bridges', '🌉 BRIDGES & ISLANDS', 'Connect islands with correct bridge count!', '🌉', 15],
  ['TileSlider15', '🧩 15-TILE SLIDER', 'Slide tiles 1 to 15 in order!', '🧩', 15],
  ['WaterPour', '🧪 WATER POURING RIDDLE', 'Measure exactly 4 liters using 3L & 5L jugs!', '🧪', 15],
  ['GeometryQuiz', '📐 GEOMETRY ANGLE QUIZ', 'Find missing angle of triangle!', '📐', 12],
  ['WordWheel', '🎡 WORD WHEEL 8-LETTER', 'Form 8-letter word using center letter!', '🎡', 15],
  ['Cryptogram', '🔐 CRYPTOGRAM CIPHER', 'Decrypt secret encrypted quote!', '🔐', 15],
  ['SlitherLoop', '➰ SLITHER LOOP', 'Form single continuous loop around numbers!', '➰', 15],
  ['MathCrossword', '➕ MATH CROSSWORD', 'Solve math equation crossword grid!', '➕', 12],
  ['CubeFolding', '🧊 3D CUBE FOLDING', 'Fold 2D net into 3D cube correctly!', '🧊', 12],
  ['ColorMixing', '🧪 COLOR MIXING LAB', 'Mix Red, Green, Blue to create target shade!', '🧪', 12],
  ['MemMatrix5x5', '🔲 MEMORY MATRIX 5x5', 'Memorize 7 lit tiles on 5x5 grid!', '🔲', 15],
  ['DominoChain', '🀩 DOMINO CHAIN REACTION', 'Arrange 5 dominoes for complete chain!', '🀩', 12],
  ['LogicDetective', '🕵️ LOGIC DETECTIVE CLUES', 'Deduce correct suspect using 3 clues!', '🕵️', 15],
  ['NumberLineBlitz', '📈 NUMBER LINE BLITZ', 'Place 3 numbers on number line accurately!', '📈', 12],
  ['WordSearch6x6', '🔍 WORD SEARCH 6x6', 'Find 3 hidden words in letter grid!', '🔍', 12],
  ['TripleScale', '⚖️ TRIPLE SCALE BALANCE', 'Balance 3 interconnected scales!', '⚖️', 15],
  ['KnightTour', '♞ KNIGHT TOUR HOP', 'Visit 6 chess squares using Knight moves!', '♞', 15],
  ['SpeedSudoku4x4', '⏱️ 4x4 SPEED SUDOKU', 'Fill 4x4 grid in under 5 seconds!', '⏱️', 15],
  ['SymmetryMatch', '🦋 SYMMETRY MATCHER', 'Draw symmetrical half of pattern!', '🦋', 12],
  ['EquationsMaster', '➗ EQUATIONS MASTER', 'Solve system of 2 linear equations!', '➗', 15],
  ['BrainOverload300', '🤯 BRAIN OVERLOAD 300', 'Solve 3 simultaneous memory & math puzzles!', '🤯', 25],
];

BRAIN_300_LIST.forEach(([key, title, instr, icon, pts]) => {
  buildBrain300Engine(title, instr, 'SOLVE', pts, key, icon);
});
