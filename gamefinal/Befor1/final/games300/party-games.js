/* ============================================================
   PARTY GAMES – 3 mini games
   🕵️ Impostor | 🎭 Charades | 🍾 Spin Bottle
   ============================================================ */

let partyTimer = null;
function partyStop() {
  if (partyTimer) { clearInterval(partyTimer); partyTimer = null; }
}

// ── 🕵️ IMPOSTOR ───────────────────────────────────────────────
const IMPOSTOR = {
  words: ['BEACH', 'PIZZA', 'AIRPORT', 'HOSPITAL', 'CINEMA', 'SUPERMARKET', 'SCHOOL', 'CONCERT'],
  secretWord: '', impostorIdx: 0, currentIdx: 0, scores: {},
};

function startImpostor() {
  IMPOSTOR.scores = {};
  State.players.forEach(p => IMPOSTOR.scores[p.name] = 0);
  IMPOSTOR.secretWord = IMPOSTOR.words[Math.floor(Math.random() * IMPOSTOR.words.length)];
  IMPOSTOR.impostorIdx = Math.floor(Math.random() * State.playerCount);
  IMPOSTOR.currentIdx = 0;
  shellSetup('🕵️ IMPOSTOR');
  buildScoreStrip('shell-scores', IMPOSTOR.scores);
  impostorPassDevice();
}

function impostorPassDevice() {
  partyStop();
  const p = State.players[IMPOSTOR.currentIdx];

  shellStatus().innerHTML = `Pass device to ${p.emoji} <b>${p.name}</b>`;

  shellMain().innerHTML = `
    <div class="party-wrap">
      <p style="color:var(--text-dim)">Make sure nobody else is looking!</p>
      <button class="btn-primary" onclick="impostorRevealWord()">👁️ REVEAL SECRET ROLE</button>
    </div>
  `;
}

function impostorRevealWord() {
  const isImpostor = (IMPOSTOR.currentIdx === IMPOSTOR.impostorIdx);
  const p = State.players[IMPOSTOR.currentIdx];

  shellMain().innerHTML = `
    <div class="party-wrap">
      <div class="role-card ${isImpostor ? 'impostor' : 'crew'}">
        <h3>${isImpostor ? '🕵️ YOU ARE THE IMPOSTOR!' : '🔒 SECRET LOCATION:'}</h3>
        <h2>${isImpostor ? 'Blend in & pretend you know!' : IMPOSTOR.secretWord}</h2>
      </div>
      <button class="btn-primary" style="margin-top:20px" onclick="impostorNextPlayer()">HIDE & PASS</button>
    </div>
  `;
}

function impostorNextPlayer() {
  IMPOSTOR.currentIdx++;
  if (IMPOSTOR.currentIdx < State.playerCount) {
    impostorPassDevice();
  } else {
    // All player roles revealed – time to discuss & vote!
    shellStatus().innerHTML = `🗣️ Discuss & Vote who the Impostor is!`;
    let html = '<div class="party-wrap"><h3>Vote for the Impostor:</h3><div class="vote-btns">';
    State.players.forEach((p, i) => {
      html += `<button class="btn-secondary" style="color:${p.color}" onclick="impostorVote(${i})">${p.emoji} ${p.name}</button>`;
    });
    html += '</div></div>';
    shellMain().innerHTML = html;
  }
}

function impostorVote(votedIdx) {
  const realImpostor = State.players[IMPOSTOR.impostorIdx];
  if (votedIdx === IMPOSTOR.impostorIdx) {
    // Crewmates win!
    State.players.forEach((p, i) => {
      if (i !== IMPOSTOR.impostorIdx) IMPOSTOR.scores[p.name] = 10;
    });
    playSound('win');
    shellStatus().innerHTML = `🎉 <b>CREWMATES WIN!</b> ${realImpostor.name} was the Impostor!`;
  } else {
    // Impostor wins!
    IMPOSTOR.scores[realImpostor.name] = 15;
    playSound('die');
    shellStatus().innerHTML = `🕵️ <b>IMPOSTOR WINS!</b> ${realImpostor.name} tricked everyone!`;
  }

  setTimeout(() => {
    const s = Object.entries(IMPOSTOR.scores).sort((a, b) => b[1] - a[1]);
    showResult(IMPOSTOR.scores, s[0][0], false);
  }, 1600);
}

// ── 🎭 CHARADES ───────────────────────────────────────────────
const CHARADES = {
  prompts: ['Riding a Unicycle', 'Baking a Cake', 'Playing Drums', 'Fighting a Robot', 'Catching a Fish', 'Surfing a Wave'],
  scores: {}, idx: 0, timeLeft: 30, timerInt: null,
};

function startCharades() {
  CHARADES.scores = {};
  State.players.forEach(p => CHARADES.scores[p.name] = 0);
  CHARADES.idx = 0;
  shellSetup('🎭 CHARADES');
  buildScoreStrip('shell-scores', CHARADES.scores);
  charadesNext();
}

function charadesNext() {
  partyStop();
  const prompt = CHARADES.prompts[Math.floor(Math.random() * CHARADES.prompts.length)];
  const p = State.players[CHARADES.idx];
  CHARADES.timeLeft = 30;

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b>'s turn to act!`;

  shellMain().innerHTML = `
    <div class="party-wrap">
      <div class="charade-prompt">${prompt}</div>
      <div class="charade-timer" id="ch-timer">⏱️ 30s</div>
      <p style="color:var(--text-dim)">Act out the prompt without speaking!</p>
      <div class="color-btns">
        <button class="btn-primary" style="background:var(--p3);color:#000" onclick="charadesResult(true)">✅ GUESSED!</button>
        <button class="btn-primary" style="background:var(--p1)" onclick="charadesResult(false)">❌ TIME OUT</button>
      </div>
    </div>
  `;

  CHARADES.timerInt = setInterval(() => {
    CHARADES.timeLeft--;
    const el = document.getElementById('ch-timer');
    if (el) el.textContent = `⏱️ ${CHARADES.timeLeft}s`;
    if (CHARADES.timeLeft <= 0) {
      clearInterval(CHARADES.timerInt);
      charadesResult(false);
    }
  }, 1000);
}

function charadesResult(success) {
  clearInterval(CHARADES.timerInt);
  const p = State.players[CHARADES.idx];
  if (success) {
    CHARADES.scores[p.name] += 10;
    updateScoreChip(p.name, CHARADES.scores[p.name]);
    playSound('win');
    shellStatus().innerHTML = `🎉 <b>GREAT ACTING!</b> +10 pts`;
  } else {
    playSound('die');
    shellStatus().innerHTML = `❌ Time up!`;
  }

  setTimeout(() => {
    CHARADES.idx = (CHARADES.idx + 1) % State.playerCount;
    if (CHARADES.idx === 0) {
      const s = Object.entries(CHARADES.scores).sort((a, b) => b[1] - a[1]);
      showResult(CHARADES.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      charadesNext();
    }
  }, 1400);
}

// ── 🍾 SPIN BOTTLE ───────────────────────────────────────────
const BOTTLE = {
  scores: {}, spinning: false, angle: 0,
};

function startSpinBottle() {
  BOTTLE.scores = {};
  State.players.forEach(p => BOTTLE.scores[p.name] = 0);
  BOTTLE.spinning = false; BOTTLE.angle = 0;
  shellSetup('🍾 SPIN THE BOTTLE', { useCanvas: true, cw: 340, ch: 280 });
  buildScoreStrip('shell-scores', BOTTLE.scores);
  shellStatus().innerHTML = `Spin to pick a lucky player!`;
  shellFooter().innerHTML = `<button class="btn-primary" onclick="bottleSpin()">🍾 SPIN BOTTLE</button>`;
  bottleDraw();
}

function bottleSpin() {
  if (BOTTLE.spinning) return;
  BOTTLE.spinning = true;
  playSound('start');

  const addRot = Math.PI * 8 + Math.random() * Math.PI * 2;
  const startAng = BOTTLE.angle;
  let t = 0;

  partyTimer = setInterval(() => {
    t += 0.04;
    const ease = 1 - Math.pow(1 - Math.min(1, t / 3.5), 3);
    BOTTLE.angle = startAng + addRot * ease;
    bottleDraw();

    if (t >= 3.5) {
      clearInterval(partyTimer);
      BOTTLE.spinning = false;
      const numP = State.playerCount;
      const normalized = (BOTTLE.angle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      const chosenIdx = Math.floor((normalized / (Math.PI * 2)) * numP);
      const chosenP = State.players[chosenIdx];

      BOTTLE.scores[chosenP.name] += 10;
      updateScoreChip(chosenP.name, BOTTLE.scores[chosenP.name]);
      playSound('win');
      shellStatus().innerHTML = `${chosenP.emoji} <b>BOTTLE POINTED TO ${chosenP.name}!</b> +10 pts`;
    }
  }, 30);
}

function bottleDraw() {
  const cv = shellCanvas(), ctx = shellCtx();
  if (!cv || !ctx) return;
  const W = cv.width, H = cv.height;
  const cx = W / 2, cy = H / 2;

  ctx.fillStyle = '#0d0d1a'; ctx.fillRect(0, 0, W, H);

  // Draw Player Positions around circle
  State.players.forEach((p, i) => {
    const ang = (i / State.playerCount) * Math.PI * 2;
    const px = cx + Math.cos(ang) * 110;
    const py = cy + Math.sin(ang) * 110;

    ctx.beginPath(); ctx.arc(px, py, 22, 0, Math.PI * 2);
    ctx.fillStyle = p.color + '44'; ctx.fill();
    ctx.strokeStyle = p.color; ctx.lineWidth = 2; ctx.stroke();
    ctx.font = '18px serif'; ctx.textAlign = 'center'; ctx.fillText(p.emoji, px, py + 6);
  });

  // Bottle Emoji in center
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(BOTTLE.angle);
  ctx.font = '54px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('🍾', 0, 0);
  ctx.restore();
}
