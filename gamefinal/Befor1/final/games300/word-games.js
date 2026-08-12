/* ============================================================
   WORD GAMES – 4 mini games
   🔤 Word Scramble | ⌨️ Typing Race | 🔍 Find the Emoji | 🎨 Color Match
   ============================================================ */

let wordTimer = null;
function wordStop() {
  if (wordTimer) { clearInterval(wordTimer); wordTimer = null; }
}

// ── 🔤 WORD SCRAMBLE ─────────────────────────────────────────
const SCRAMBLE = {
  words: ['PARTY', 'CLASH', 'GAMING', 'VICTORY', 'CHAMPION', 'TURBO', 'ARCADE', 'ROCKET', 'DRAGON', 'LEGEND', 'MASTER', 'GUITAR'],
  scores: {}, round: 1, rounds: 5, currentWord: '', scrambled: '', idx: 0,
};

function startScramble() {
  SCRAMBLE.scores = {};
  State.players.forEach(p => SCRAMBLE.scores[p.name] = 0);
  SCRAMBLE.round = 1; SCRAMBLE.idx = 0;
  shellSetup('🔤 WORD SCRAMBLE');
  buildScoreStrip('shell-scores', SCRAMBLE.scores);
  scrambleNext();
}

function scrambleNext() {
  wordStop();
  const word = SCRAMBLE.words[Math.floor(Math.random() * SCRAMBLE.words.length)];
  SCRAMBLE.currentWord = word;
  SCRAMBLE.scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
  if (SCRAMBLE.scrambled === word) SCRAMBLE.scrambled = word.split('').reverse().join('');

  const p = State.players[SCRAMBLE.idx];
  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Round ${SCRAMBLE.round}/${SCRAMBLE.rounds}`;

  shellMain().innerHTML = `
    <div class="word-wrap">
      <div class="word-scrambled">${SCRAMBLE.scrambled}</div>
      <input type="text" class="word-input" id="scramble-input" placeholder="Type answer..." autocomplete="off" autofocus />
      <button class="btn-primary" onclick="scrambleSubmit()">SUBMIT</button>
    </div>
  `;

  const input = document.getElementById('scramble-input');
  if (input) {
    input.focus();
    input.onkeyup = (e) => { if (e.key === 'Enter') scrambleSubmit(); };
  }
}

function scrambleSubmit() {
  const input = document.getElementById('scramble-input');
  if (!input) return;
  const val = input.value.trim().toUpperCase();
  const p = State.players[SCRAMBLE.idx];

  if (val === SCRAMBLE.currentWord) {
    SCRAMBLE.scores[p.name] += 10;
    updateScoreChip(p.name, SCRAMBLE.scores[p.name]);
    playSound('match');
    shellStatus().innerHTML = `${p.emoji} <b>CORRECT!</b> +10 pts`;
  } else {
    playSound('die');
    shellStatus().innerHTML = `❌ Wrong! Word was <b>${SCRAMBLE.currentWord}</b>`;
  }

  setTimeout(() => {
    SCRAMBLE.idx = (SCRAMBLE.idx + 1) % State.playerCount;
    if (SCRAMBLE.idx === 0) SCRAMBLE.round++;
    if (SCRAMBLE.round > SCRAMBLE.rounds) {
      const s = Object.entries(SCRAMBLE.scores).sort((a, b) => b[1] - a[1]);
      showResult(SCRAMBLE.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      scrambleNext();
    }
  }, 1200);
}

// ── ⌨️ TYPING RACE ───────────────────────────────────────────
const TYPERACE = {
  phrases: ['SPEED RUN', 'SUPER JUMP', 'LIGHTNING FAST', 'POWER UP', 'EPIC WIN', 'GOLD MEDAL'],
  scores: {}, round: 1, rounds: 4, idx: 0, target: '', startTime: 0,
};

function startTypeRace() {
  TYPERACE.scores = {};
  State.players.forEach(p => TYPERACE.scores[p.name] = 0);
  TYPERACE.round = 1; TYPERACE.idx = 0;
  shellSetup('⌨️ TYPING RACE');
  buildScoreStrip('shell-scores', TYPERACE.scores);
  typeRaceNext();
}

function typeRaceNext() {
  wordStop();
  TYPERACE.target = TYPERACE.phrases[Math.floor(Math.random() * TYPERACE.phrases.length)];
  TYPERACE.startTime = performance.now();
  const p = State.players[TYPERACE.idx];

  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Type as fast as you can! Round ${TYPERACE.round}/${TYPERACE.rounds}`;

  shellMain().innerHTML = `
    <div class="word-wrap">
      <div class="word-target" id="tr-target">${TYPERACE.target}</div>
      <input type="text" class="word-input" id="tr-input" placeholder="Type phrase exactly..." autocomplete="off" autofocus />
    </div>
  `;

  const input = document.getElementById('tr-input');
  if (input) {
    input.focus();
    input.oninput = () => {
      if (input.value.toUpperCase() === TYPERACE.target) {
        const time = ((performance.now() - TYPERACE.startTime) / 1000).toFixed(2);
        const pts = Math.max(2, Math.round(15 - parseFloat(time)));
        TYPERACE.scores[p.name] += pts;
        updateScoreChip(p.name, TYPERACE.scores[p.name]);
        playSound('win');
        shellStatus().innerHTML = `${p.emoji} <b>Finished in ${time}s!</b> +${pts} pts`;
        input.disabled = true;
        setTimeout(() => {
          TYPERACE.idx = (TYPERACE.idx + 1) % State.playerCount;
          if (TYPERACE.idx === 0) TYPERACE.round++;
          if (TYPERACE.round > TYPERACE.rounds) {
            const s = Object.entries(TYPERACE.scores).sort((a, b) => b[1] - a[1]);
            showResult(TYPERACE.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
          } else {
            typeRaceNext();
          }
        }, 1200);
      }
    };
  }
}

// ── 🔍 FIND THE EMOJI ─────────────────────────────────────────
const FINDEMOJI = {
  sets: [
    { target: '🐱', distractors: ['🐶', '🦊', '🐻', '🐼'] },
    { target: '💎', distractors: ['🪙', '👑', '💍', '💰'] },
    { target: '🍕', distractors: ['🍔', '🍟', '🌭', '🥪'] },
    { target: '🚀', distractors: ['🛸', '✈️', '🚁', '🛰️'] },
  ],
  scores: {}, round: 1, rounds: 4, idx: 0,
};

function startFindEmoji() {
  FINDEMOJI.scores = {};
  State.players.forEach(p => FINDEMOJI.scores[p.name] = 0);
  FINDEMOJI.round = 1; FINDEMOJI.idx = 0;
  shellSetup('🔍 FIND THE EMOJI');
  buildScoreStrip('shell-scores', FINDEMOJI.scores);
  findEmojiNext();
}

function findEmojiNext() {
  wordStop();
  const set = FINDEMOJI.sets[Math.floor(Math.random() * FINDEMOJI.sets.length)];
  const grid = [];
  const targetIdx = Math.floor(Math.random() * 16);
  for (let i = 0; i < 16; i++) {
    if (i === targetIdx) grid.push(set.target);
    else grid.push(set.distractors[Math.floor(Math.random() * set.distractors.length)]);
  }

  const p = State.players[FINDEMOJI.idx];
  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Find: <span style="font-size:1.4em">${set.target}</span>!`;

  let html = '<div class="emoji-grid">';
  grid.forEach((item, i) => {
    html += `<button class="emoji-cell" onclick="findEmojiClick(${i === targetIdx})">${item}</button>`;
  });
  html += '</div>';

  shellMain().innerHTML = html;
}

function findEmojiClick(isCorrect) {
  const p = State.players[FINDEMOJI.idx];
  if (isCorrect) {
    FINDEMOJI.scores[p.name] += 5;
    updateScoreChip(p.name, FINDEMOJI.scores[p.name]);
    playSound('match');
    shellStatus().innerHTML = `${p.emoji} <b>FOUND IT!</b> +5 pts`;
  } else {
    playSound('die');
    shellStatus().innerHTML = `❌ Missed it!`;
  }

  setTimeout(() => {
    FINDEMOJI.idx = (FINDEMOJI.idx + 1) % State.playerCount;
    if (FINDEMOJI.idx === 0) FINDEMOJI.round++;
    if (FINDEMOJI.round > FINDEMOJI.rounds) {
      const s = Object.entries(FINDEMOJI.scores).sort((a, b) => b[1] - a[1]);
      showResult(FINDEMOJI.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      findEmojiNext();
    }
  }, 1000);
}

// ── 🎨 COLOR MATCH ────────────────────────────────────────────
const COLORMATCH = {
  colors: [
    { name: 'RED', color: '#ff4d6d' },
    { name: 'BLUE', color: '#4db8ff' },
    { name: 'GREEN', color: '#4dff91' },
    { name: 'YELLOW', color: '#ffd44d' },
  ],
  scores: {}, round: 1, rounds: 5, idx: 0, isMatch: false,
};

function startColorMatch() {
  COLORMATCH.scores = {};
  State.players.forEach(p => COLORMATCH.scores[p.name] = 0);
  COLORMATCH.round = 1; COLORMATCH.idx = 0;
  shellSetup('🎨 COLOR MATCH');
  buildScoreStrip('shell-scores', COLORMATCH.scores);
  colorMatchNext();
}

function colorMatchNext() {
  wordStop();
  const wordObj = COLORMATCH.colors[Math.floor(Math.random() * COLORMATCH.colors.length)];
  const colorObj = COLORMATCH.colors[Math.floor(Math.random() * COLORMATCH.colors.length)];
  COLORMATCH.isMatch = (wordObj.name === colorObj.name);

  const p = State.players[COLORMATCH.idx];
  shellStatus().innerHTML = `${p.emoji} <b>${p.name}</b> – Does the text match the color?`;

  shellMain().innerHTML = `
    <div class="word-wrap">
      <div class="color-word" style="color:${colorObj.color}">${wordObj.name}</div>
      <div class="color-btns">
        <button class="btn-primary" style="background:var(--p3);color:#000" onclick="colorMatchAnswer(true)">YES (Match)</button>
        <button class="btn-primary" style="background:var(--p1)" onclick="colorMatchAnswer(false)">NO (Mismatch)</button>
      </div>
    </div>
  `;
}

function colorMatchAnswer(ans) {
  const p = State.players[COLORMATCH.idx];
  if (ans === COLORMATCH.isMatch) {
    COLORMATCH.scores[p.name] += 5;
    updateScoreChip(p.name, COLORMATCH.scores[p.name]);
    playSound('match');
    shellStatus().innerHTML = `${p.emoji} <b>CORRECT!</b> +5 pts`;
  } else {
    playSound('die');
    shellStatus().innerHTML = `❌ WRONG!`;
  }

  setTimeout(() => {
    COLORMATCH.idx = (COLORMATCH.idx + 1) % State.playerCount;
    if (COLORMATCH.idx === 0) COLORMATCH.round++;
    if (COLORMATCH.round > COLORMATCH.rounds) {
      const s = Object.entries(COLORMATCH.scores).sort((a, b) => b[1] - a[1]);
      showResult(COLORMATCH.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
    } else {
      colorMatchNext();
    }
  }, 1000);
}
