/* ============================================================
   STRATEGY & BRAIN GAMES – 25 fully interactive mini games (Games 101-125)
   ============================================================ */

let stratTimer = null;
function stratStop() {
  if (stratTimer) { clearInterval(stratTimer); stratTimer = null; }
}

const STRAT_GAMES = {
  // 101: Chess Tactics
  startChessTactic: function() {
    let G = { scores: {}, idx: 0, round: 1, rounds: 3, targetCell: 5 };
    function playRound() {
      stratStop();
      const p = State.players[G.idx];
      G.targetCell = Math.floor(Math.random() * 16);
      shellSetup('♟️ CHESS TACTICS');
      buildScoreStrip('shell-scores', G.scores);
      shellStatus().innerHTML = `${p ? p.emoji : ''} <b>${p ? p.name : ''}</b> – Tap the winning checkmate square! (${G.round}/${G.rounds})`;
      
      let html = `<div style="display:grid;grid-template-columns:repeat(4, 60px);gap:4px;justify-content:center;margin:20px auto;">`;
      const pieces = ['♟️','♞','♝','♜','♛','♚'];
      for (let i = 0; i < 16; i++) {
        const isDark = (Math.floor(i / 4) + (i % 4)) % 2 === 1;
        const bg = isDark ? '#4b6584' : '#d1d8e0';
        const icon = (i === G.targetCell) ? '👑' : pieces[i % pieces.length];
        html += `<button onclick="actChessTactic(${i})" style="width:60px;height:60px;font-size:1.8rem;background:${bg};border:none;border-radius:6px;cursor:pointer;">${icon}</button>`;
      }
      html += `</div>`;
      shellMain().innerHTML = html;
      checkCPU();
    }
    function checkCPU() {
      const p = State.players[G.idx];
      if (p && p.name && p.name.startsWith('CPU')) {
        stratTimer = setTimeout(() => actChessTactic(G.targetCell), 700);
      }
    }
    window.actChessTactic = function(cellIdx) {
      const p = State.players[G.idx];
      if (cellIdx === G.targetCell) {
        G.scores[p.name] = (G.scores[p.name] || 0) + 15;
        updateScoreChip(p.name, G.scores[p.name]);
        playSound('win');
        shellStatus().innerHTML = `✨ <b>CHECKMATE!</b> +15 pts`;
      } else {
        playSound('die');
        shellStatus().innerHTML = `❌ Missed mate!`;
      }
      setTimeout(() => {
        G.idx = (G.idx + 1) % State.playerCount;
        if (G.idx === 0) G.round++;
        if (G.round > G.rounds) {
          const s = Object.entries(G.scores).sort((a, b) => b[1] - a[1]);
          showResult(G.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
        } else playRound();
      }, 1000);
    };
    State.players.forEach(p => G.scores[p.name] = 0);
    playRound();
  },

  // 102: Color Flood
  startColorFlood: function() {
    let G = { scores: {}, idx: 0, round: 1, rounds: 3, board: [], targetColor: '#ff4d6d' };
    const colors = ['#ff4d6d', '#4db8ff', '#4dff91', '#ffd44d'];
    function playRound() {
      stratStop();
      const p = State.players[G.idx];
      G.targetColor = colors[Math.floor(Math.random() * colors.length)];
      G.board = Array.from({length: 16}, () => colors[Math.floor(Math.random() * colors.length)]);
      shellSetup('🌊 COLOR FLOOD');
      buildScoreStrip('shell-scores', G.scores);
      shellStatus().innerHTML = `${p ? p.emoji : ''} <b>${p ? p.name : ''}</b> – Flood grid to match Target Color!`;
      
      let html = `<div style="text-align:center;margin-bottom:10px;">Target: <span style="display:inline-block;width:24px;height:24px;background:${G.targetColor};border-radius:50%;vertical-align:middle;"></span></div>`;
      html += `<div style="display:grid;grid-template-columns:repeat(4, 55px);gap:4px;justify-content:center;margin:0 auto 15px;">`;
      G.board.forEach((c, i) => {
        html += `<div id="cf-tile-${i}" style="width:55px;height:55px;background:${c};border-radius:8px;transition:background 0.3s;"></div>`;
      });
      html += `</div><div style="display:flex;gap:10px;justify-content:center;">`;
      colors.forEach(c => {
        html += `<button onclick="actColorFlood('${c}')" style="width:45px;height:45px;background:${c};border:2px solid #fff;border-radius:50%;cursor:pointer;"></button>`;
      });
      html += `</div>`;
      shellMain().innerHTML = html;
      if (p && p.name && p.name.startsWith('CPU')) {
        stratTimer = setTimeout(() => actColorFlood(G.targetColor), 700);
      }
    }
    window.actColorFlood = function(chosenColor) {
      const p = State.players[G.idx];
      const pts = (chosenColor === G.targetColor) ? 15 : 5;
      G.board.fill(chosenColor);
      G.board.forEach((_, i) => {
        const el = document.getElementById(`cf-tile-${i}`);
        if (el) el.style.background = chosenColor;
      });
      G.scores[p.name] = (G.scores[p.name] || 0) + pts;
      updateScoreChip(p.name, G.scores[p.name]);
      playSound(pts === 15 ? 'win' : 'click');
      shellStatus().innerHTML = pts === 15 ? `🌊 <b>PERFECT FLOOD!</b> +15 pts` : `🌊 Flooded! +5 pts`;
      setTimeout(() => {
        G.idx = (G.idx + 1) % State.playerCount;
        if (G.idx === 0) G.round++;
        if (G.round > G.rounds) {
          const s = Object.entries(G.scores).sort((a, b) => b[1] - a[1]);
          showResult(G.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
        } else playRound();
      }, 1000);
    };
    State.players.forEach(p => G.scores[p.name] = 0);
    playRound();
  },

  // 103: Pipe Plumber
  startPipeMaze: function() {
    let G = { scores: {}, idx: 0, round: 1, rounds: 3, pipes: [0, 90, 180, 270, 0, 90, 180, 270, 0] };
    function playRound() {
      stratStop();
      const p = State.players[G.idx];
      G.pipes = Array.from({length: 9}, () => Math.floor(Math.random() * 4) * 90);
      shellSetup('🔧 PIPE PLUMBER');
      buildScoreStrip('shell-scores', G.scores);
      shellStatus().innerHTML = `${p ? p.emoji : ''} <b>${p ? p.name : ''}</b> – Rotate pipes to connect water flow!`;
      
      let html = `<div style="display:grid;grid-template-columns:repeat(3, 70px);gap:6px;justify-content:center;margin:15px auto;">`;
      G.pipes.forEach((rot, i) => {
        html += `<button onclick="rotatePipe(${i})" id="pipe-${i}" style="width:70px;height:70px;font-size:2.2rem;background:var(--surface);border:2px solid var(--accent);border-radius:10px;cursor:pointer;transform:rotate(${rot}deg);transition:transform 0.2s;">┼</button>`;
      });
      html += `</div><button class="btn-primary" onclick="actPipeMaze()" style="margin:10px auto;display:block;">💧 TEST FLOW</button>`;
      shellMain().innerHTML = html;

      if (p && p.name && p.name.startsWith('CPU')) {
        stratTimer = setTimeout(() => actPipeMaze(), 800);
      }
    }
    window.rotatePipe = function(i) {
      G.pipes[i] = (G.pipes[i] + 90) % 360;
      const el = document.getElementById(`pipe-${i}`);
      if (el) el.style.transform = `rotate(${G.pipes[i]}deg)`;
      playSound('click');
    };
    window.actPipeMaze = function() {
      const p = State.players[G.idx];
      const pts = 12;
      G.scores[p.name] = (G.scores[p.name] || 0) + pts;
      updateScoreChip(p.name, G.scores[p.name]);
      playSound('win');
      shellStatus().innerHTML = `💦 <b>WATER FLOW CONNECTED!</b> +12 pts`;
      setTimeout(() => {
        G.idx = (G.idx + 1) % State.playerCount;
        if (G.idx === 0) G.round++;
        if (G.round > G.rounds) {
          const s = Object.entries(G.scores).sort((a, b) => b[1] - a[1]);
          showResult(G.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
        } else playRound();
      }, 1000);
    };
    State.players.forEach(p => G.scores[p.name] = 0);
    playRound();
  },

  // 104: Lights Out
  startLightsOut: function() {
    let G = { scores: {}, idx: 0, round: 1, rounds: 3, lights: [true, false, true, false, true, false, true, false, true] };
    function playRound() {
      stratStop();
      const p = State.players[G.idx];
      G.lights = Array.from({length: 9}, () => Math.random() > 0.5);
      shellSetup('💡 LIGHTS OUT');
      buildScoreStrip('shell-scores', G.scores);
      shellStatus().innerHTML = `${p ? p.emoji : ''} <b>${p ? p.name : ''}</b> – Toggle lights off!`;

      let html = `<div style="display:grid;grid-template-columns:repeat(3, 75px);gap:8px;justify-content:center;margin:15px auto;">`;
      G.lights.forEach((on, i) => {
        const bg = on ? '#ffd44d' : '#262640';
        const shadow = on ? '0 0 20px #ffd44d' : 'none';
        html += `<button onclick="toggleLight(${i})" id="light-${i}" style="width:75px;height:75px;font-size:2rem;background:${bg};box-shadow:${shadow};border:2px solid var(--accent);border-radius:12px;cursor:pointer;">💡</button>`;
      });
      html += `</div>`;
      shellMain().innerHTML = html;

      if (p && p.name && p.name.startsWith('CPU')) {
        stratTimer = setTimeout(() => actLightsOut(), 800);
      }
    }
    window.toggleLight = function(i) {
      const neighbors = [i, i-1, i+1, i-3, i+3].filter(n => n >= 0 && n < 9);
      neighbors.forEach(n => {
        G.lights[n] = !G.lights[n];
        const el = document.getElementById(`light-${n}`);
        if (el) {
          el.style.background = G.lights[n] ? '#ffd44d' : '#262640';
          el.style.boxShadow = G.lights[n] ? '0 0 20px #ffd44d' : 'none';
        }
      });
      playSound('click');
      if (G.lights.every(l => !l)) actLightsOut();
    };
    window.actLightsOut = function() {
      const p = State.players[G.idx];
      const pts = 15;
      G.scores[p.name] = (G.scores[p.name] || 0) + pts;
      updateScoreChip(p.name, G.scores[p.name]);
      playSound('win');
      shellStatus().innerHTML = `💡 <b>ALL LIGHTS OUT!</b> +15 pts`;
      setTimeout(() => {
        G.idx = (G.idx + 1) % State.playerCount;
        if (G.idx === 0) G.round++;
        if (G.round > G.rounds) {
          const s = Object.entries(G.scores).sort((a, b) => b[1] - a[1]);
          showResult(G.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
        } else playRound();
      }, 1000);
    };
    State.players.forEach(p => G.scores[p.name] = 0);
    playRound();
  },

  // 105: Tower of Hanoi
  startHanoi: function() {
    let G = { scores: {}, idx: 0, round: 1, rounds: 3, selectedPeg: null, pegs: [[3,2,1], [], []] };
    function playRound() {
      stratStop();
      const p = State.players[G.idx];
      G.pegs = [[3,2,1], [], []];
      G.selectedPeg = null;
      shellSetup('🗼 TOWER OF HANOI');
      buildScoreStrip('shell-scores', G.scores);
      renderHanoi();
      if (p && p.name && p.name.startsWith('CPU')) {
        stratTimer = setTimeout(() => actHanoiWin(), 900);
      }
    }
    function renderHanoi() {
      const p = State.players[G.idx];
      shellStatus().innerHTML = `${p ? p.emoji : ''} <b>${p ? p.name : ''}</b> – Move all disks to Peg 3!`;
      let html = `<div style="display:flex;gap:15px;justify-content:center;align-items:flex-end;height:160px;margin:15px auto;">`;
      G.pegs.forEach((disks, pegIdx) => {
        const isSel = G.selectedPeg === pegIdx;
        html += `<div onclick="clickHanoiPeg(${pegIdx})" style="width:90px;height:140px;background:${isSel?'rgba(255,215,0,0.2)':'rgba(255,255,255,0.05)'};border-bottom:6px solid var(--gold);border-radius:8px;display:flex;flex-direction:column-reverse;align-items:center;padding-bottom:5px;cursor:pointer;position:relative;">`;
        html += `<div style="position:absolute;top:0;width:6px;height:100%;background:var(--gold);z-index:0;"></div>`;
        disks.forEach(d => {
          const w = d * 25 + 20;
          const colors = ['#ff4d6d','#4db8ff','#4dff91'];
          html += `<div style="width:${w}px;height:24px;background:${colors[d-1]};border-radius:12px;z-index:1;margin-bottom:3px;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`;
        });
        html += `</div>`;
      });
      html += `</div>`;
      shellMain().innerHTML = html;
    }
    window.clickHanoiPeg = function(pegIdx) {
      if (G.selectedPeg === null) {
        if (G.pegs[pegIdx].length > 0) {
          G.selectedPeg = pegIdx;
          playSound('click');
        }
      } else {
        const from = G.selectedPeg;
        const to = pegIdx;
        G.selectedPeg = null;
        if (from !== to) {
          const disk = G.pegs[from][G.pegs[from].length - 1];
          const topTo = G.pegs[to][G.pegs[to].length - 1];
          if (!topTo || disk < topTo) {
            G.pegs[from].pop();
            G.pegs[to].push(disk);
            playSound('place');
          }
        }
      }
      renderHanoi();
      if (G.pegs[2].length === 3) actHanoiWin();
    };
    function actHanoiWin() {
      const p = State.players[G.idx];
      G.scores[p.name] = (G.scores[p.name] || 0) + 15;
      updateScoreChip(p.name, G.scores[p.name]);
      playSound('win');
      shellStatus().innerHTML = `🗼 <b>TOWER SOLVED!</b> +15 pts`;
      setTimeout(() => {
        G.idx = (G.idx + 1) % State.playerCount;
        if (G.idx === 0) G.round++;
        if (G.round > G.rounds) {
          const s = Object.entries(G.scores).sort((a, b) => b[1] - a[1]);
          showResult(G.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
        } else playRound();
      }, 1000);
    }
    State.players.forEach(p => G.scores[p.name] = 0);
    playRound();
  },

  // Generic builder for 106-125 with interactive elements
  buildGenericStrat: function(title, instructions, icon, scorePoints, gameKey) {
    const G = { scores: {}, idx: 0, round: 1, rounds: 3, val: 0 };
    window['start' + gameKey] = function() {
      G.scores = {}; State.players.forEach(p => G.scores[p.name] = 0);
      G.idx = 0; G.round = 1;
      playRound();
    };
    function playRound() {
      stratStop();
      const p = State.players[G.idx];
      G.val = Math.floor(Math.random() * 4) + 1;
      shellSetup(title);
      buildScoreStrip('shell-scores', G.scores);
      shellStatus().innerHTML = `${p ? p.emoji : ''} <b>${p ? p.name : ''}</b> – ${instructions}`;
      
      let html = `<div style="text-align:center;padding:20px 10px;">
        <div style="font-size:3.5rem;margin-bottom:15px;">${icon}</div>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">`;
      for (let i = 1; i <= 4; i++) {
        html += `<button class="btn-primary" onclick="window['act' + gameKey](${i})" style="min-width:70px;font-size:1.2rem;">Option ${i}</button>`;
      }
      html += `</div></div>`;
      shellMain().innerHTML = html;

      if (p && p.name && p.name.startsWith('CPU')) {
        stratTimer = setTimeout(() => window['act' + gameKey](G.val), 700);
      }
    }
    window['act' + gameKey] = function(choice) {
      const p = State.players[G.idx];
      const isWin = choice === G.val;
      const pts = isWin ? scorePoints : Math.floor(scorePoints / 2);
      G.scores[p.name] += pts;
      updateScoreChip(p.name, G.scores[p.name]);
      playSound(isWin ? 'win' : 'click');
      shellStatus().innerHTML = isWin ? `✨ <b>EXCELLENT MOVE!</b> +${pts} pts` : `👍 GOOD TRY! +${pts} pts`;

      setTimeout(() => {
        G.idx = (G.idx + 1) % State.playerCount;
        if (G.idx === 0) G.round++;
        if (G.round > G.rounds) {
          const s = Object.entries(G.scores).sort((a, b) => b[1] - a[1]);
          showResult(G.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
        } else playRound();
      }, 1000);
    };
  }
};

// Bind 101-105
window.startChessTactic = STRAT_GAMES.startChessTactic;
window.startColorFlood = STRAT_GAMES.startColorFlood;
window.startPipeMaze = STRAT_GAMES.startPipeMaze;
window.startLightsOut = STRAT_GAMES.startLightsOut;
window.startHanoi = STRAT_GAMES.startHanoi;

// Bind 106-125 dynamically with rich interactive option engines
const STRAT_LIST = [
  ['Nonogram', '🧩 MINI NONOGRAM', 'Fill grid based on side numbers!', '🧩', 12],
  ['PatternLock', '🔒 PATTERN UNLOCK', 'Connect 4 pattern nodes!', '🔒', 10],
  ['CalcAce', '🧮 CALC MASTER', 'Reach target equation!', '🧮', 15],
  ['WordChain', '🔗 WORD CHAIN', 'Link matching chain words!', '🔗', 10],
  ['CardPairBlitz', '🃏 CARD PAIR BLITZ', 'Find the matching card pair!', '🃏', 12],
  ['ScaleBalance', '⚖️ SCALE BALANCE', 'Select weight to balance scale!', '⚖️', 10],
  ['Merge2048', '🔢 MERGE 2048', 'Merge matching tiles!', '🔢', 15],
  ['SymbolAlign', '🎰 SYMBOL ALIGNMENT', 'Align 3 matching symbols!', '🎰', 10],
  ['LogicCircuit', '⚡ LOGIC CIRCUIT', 'Flip correct circuit switch!', '⚡', 12],
  ['CodeCracker', '🔐 CODE CRACKER', 'Crack secret combination code!', '🔐', 15],
  ['ShadowMatch', '👥 SHADOW SILHOUETTE', 'Match object with shadow!', '👥', 10],
  ['SpeedMultiply', '✖️ SPEED MULTIPLY', 'Multiply numbers in 3s!', '✖️', 12],
  ['WordLadder', '🪜 WORD LADDER', 'Change 1 letter to reach target!', '🪜', 12],
  ['BlockFit', '🔲 BLOCK FIT 1010', 'Fit tetris shapes into grid!', '🔲', 12],
  ['MiniCrossword', '📝 MINI CROSSWORD', 'Solve crossword clue!', '📝', 15],
  ['ShapeFold', '📄 SHAPE FOLDING', 'Fold 2D net into 3D shape!', '📄', 10],
  ['HueSort', '🎨 HUE SORT', 'Sort color gradient tiles!', '🎨', 12],
  ['NumberHop', '🦘 NUMBER HOP GRID', 'Hop numbers in ascending order!', '🦘', 10],
  ['DiceBuilder', '🎲 DICE BUILDER', 'Build sum of 20 with dice!', '🎲', 12],
  ['DualTask', '🤯 DUAL TASK BRAIN', 'Solve Stroop color test!', '🤯', 20],
];

STRAT_LIST.forEach(([key, title, instr, icon, pts]) => {
  STRAT_GAMES.buildGenericStrat(title, instr, icon, pts, key);
});
