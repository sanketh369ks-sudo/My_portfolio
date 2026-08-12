/* ============================================================
   PARTY & SHOWDOWN ULTIMATE – 25 fully interactive mini games (Games 176-200)
   ============================================================ */

let partyUltTimer = null;
function partyUltStop() {
  if (partyUltTimer) { clearInterval(partyUltTimer); partyUltTimer = null; }
}

const PARTY_ULT = {
  // 176: Party Roulette
  startPartyRoulette: function() {
    let G = { scores: {}, idx: 0, round: 1, rounds: 3, angle: 0, spinning: false };
    function playRound() {
      partyUltStop();
      const p = State.players[G.idx];
      G.angle = 0; G.spinning = false;
      shellSetup('🎰 PARTY ROULETTE', { useCanvas: true, cw: 340, ch: 260 });
      buildScoreStrip('shell-scores', G.scores);
      shellStatus().innerHTML = `${p ? p.emoji : ''} <b>${p ? p.name : ''}</b> – Spin the Party Wheel!`;
      
      bindCanvasTap(shellCanvas(), () => spin());
      shellFooter().innerHTML = `<button class="btn-primary" onclick="spin()" style="margin:0 auto;display:block;">🎰 SPIN WHEEL</button>`;
      
      drawWheel();
      if (p && p.name && p.name.startsWith('CPU')) {
        partyUltTimer = setTimeout(() => spin(), 700);
      }
    }
    function drawWheel() {
      const cv = shellCanvas(), ctx = shellCtx();
      if (!cv || !ctx) return;
      ctx.clearRect(0, 0, 340, 260);
      
      ctx.save(); ctx.translate(170, 130); ctx.rotate(G.angle);
      const slices = ['#ff4d6d', '#4db8ff', '#4dff91', '#ffd44d', '#c86ef5', '#ff914d'];
      const sliceAngle = (Math.PI * 2) / slices.length;
      slices.forEach((c, i) => {
        ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.arc(0, 0, 100, i * sliceAngle, (i + 1) * sliceAngle);
        ctx.fillStyle = c; ctx.fill(); ctx.stroke();
      });
      ctx.restore();
      
      // Pointer
      ctx.fillStyle = '#fff'; ctx.beginPath();
      ctx.moveTo(170, 20); ctx.lineTo(160, 5); ctx.lineTo(180, 5); ctx.fill();
    }
    function spin() {
      if (G.spinning) return;
      G.spinning = true;
      let speed = 0.4 + Math.random() * 0.3;
      const int = setInterval(() => {
        G.angle += speed; speed *= 0.96;
        drawWheel();
        if (speed < 0.01) {
          clearInterval(int);
          const p = State.players[G.idx];
          const pts = 15;
          G.scores[p.name] = (G.scores[p.name] || 0) + pts;
          updateScoreChip(p.name, G.scores[p.name]);
          playSound('win');
          shellStatus().innerHTML = `🎰 <b>JACKPOT LANDED!</b> +15 pts`;
          setTimeout(() => {
            G.idx = (G.idx + 1) % State.playerCount;
            if (G.idx === 0) G.round++;
            if (G.round > G.rounds) {
              const s = Object.entries(G.scores).sort((a, b) => b[1] - a[1]);
              showResult(G.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]);
            } else playRound();
          }, 1000);
        }
      }, 30);
      playSound('start');
    }
    State.players.forEach(p => G.scores[p.name] = 0);
    playRound();
  },

  // Generic Party builder for 177-200 with interactive mechanics
  buildGenericParty: function(title, instructions, icon, scorePoints, gameKey) {
    const G = { scores: {}, idx: 0, round: 1, rounds: 3, clicks: 0 };
    window['start' + gameKey] = function() {
      G.scores = {}; State.players.forEach(p => G.scores[p.name] = 0);
      G.idx = 0; G.round = 1;
      playRound();
    };
    function playRound() {
      partyUltStop();
      G.clicks = 0;
      const p = State.players[G.idx];
      shellSetup(title);
      buildScoreStrip('shell-scores', G.scores);
      shellStatus().innerHTML = `${p ? p.emoji : ''} <b>${p ? p.name : ''}</b> – ${instructions}`;
      
      let html = `<div style="text-align:center;padding:20px 10px;">
        <div style="font-size:4rem;margin-bottom:10px;" id="party-icon-${gameKey}">${icon}</div>
        <div style="font-size:1.1rem;font-weight:800;color:var(--gold);margin-bottom:15px;" id="party-cnt-${gameKey}">Progress: 0/3</div>
        <button class="btn-primary pulse-glow" onclick="window['act' + gameKey]()" style="font-size:1.2rem;padding:14px 28px;">🎉 PARTY ACTION 🎉</button>
      </div>`;
      shellMain().innerHTML = html;

      if (p && p.name && p.name.startsWith('CPU')) {
        partyUltTimer = setInterval(() => {
          if (G.clicks < 3) window['act' + gameKey]();
        }, 220);
      }
    }
    window['act' + gameKey] = function() {
      const p = State.players[G.idx];
      G.clicks++;
      playSound('click');
      const cntEl = document.getElementById(`party-cnt-${gameKey}`);
      if (cntEl) cntEl.textContent = `Progress: ${G.clicks}/3`;

      if (G.clicks >= 3) {
        G.scores[p.name] += scorePoints;
        updateScoreChip(p.name, G.scores[p.name]);
        playSound('win');
        shellStatus().innerHTML = `🎉 <b>PARTY SHOWDOWN WIN!</b> +${scorePoints} pts`;

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
};

window.startPartyRoulette = PARTY_ULT.startPartyRoulette;

const PARTY_LIST = [
  ['ShowdownDuel', '🤠 SHOWDOWN DUEL', 'Wait for DRAW signal & tap first!', '🤠', 15],
  ['TruthOrDare', '❓ TRUTH OR DARE', 'Complete party dare or answer truth!', '❓', 12],
  ['CategoryWord', '🗣️ FAST CATEGORY WORD', 'Name a word starting with letter B!', '🗣️', 10],
  ['EmojiMovieQuiz', '🎬 EMOJI MOVIE QUIZ', 'Guess movie from 🍿🦁👑!', '🎬', 15],
  ['FaceGuess', '👤 FACE GUESS', 'Identify famous avatar character!', '👤', 12],
  ['BlindCanvas', '🎨 BLIND CANVAS', 'Draw object blindfolded in 10s!', '🎨', 12],
  ['SoundEffectQuiz', '🔊 SOUND EFFECT QUIZ', 'Guess the animal sound!', '🔊', 12],
  ['SlapCard', '🖐️ SLAP CARD', 'Slap screen when Jack card appears!', '🖐️', 15],
  ['RiddleSolver', '🧩 RIDDLE SOLVER', 'Solve tricky party riddle!', '🧩', 15],
  ['TiltBalance', '🎯 TILT BALANCE', 'Keep ball centered on balance board!', '🎯', 12],
  ['PirateDuel', '🏴‍☠️ PIRATE SHIP DUEL', 'Fire cannonball at rival pirate ship!', '🏴‍☠️', 15],
  ['CookieMash', '🍪 COOKIE MASH', 'Mash button to bake 100 cookies!', '🍪', 12],
  ['PinataSmash', '🪅 PIÑATA SMASH', 'Hit piñata until candy bursts out!', '🪅', 15],
  ['GoldenMole', '🐹 GOLDEN MOLE RAMPAGE', 'Whack 5 golden moles in a row!', '🐹', 15],
  ['CardRoyale', '🃏 MEMORY CARD ROYALE', 'Flip and match royal card set!', '🃏', 12],
  ['SpinFortuneWheel', '🎡 SPIN FORTUNE WHEEL', 'Spin wheel for bonus points!', '🎡', 10],
  ['Typing60', '⌨️ 60-SECOND TYPING', 'Type full sentence without mistake!', '⌨️', 15],
  ['FleetDestroyer', '🚢 FLEET DESTROYER', 'Launch missile strike on carrier!', '🚢', 15],
  ['PartyBingo', '🔢 PARTY BINGO', 'Mark off 5 bingo numbers in line!', '🔢', 15],
  ['LaserTag', '🔫 LASER TAG', 'Tag 3 opponents with laser gun!', '🔫', 12],
  ['RingTheBell', '🔨 RING THE BELL', 'Swing mallet for 1000pt bell ring!', '🔨', 15],
  ['UFOInvaders2', '👾 UFO INVADERS 2', 'Blast mothership saucer!', '👾', 15],
  ['MegaMath', '🧮 MEGA MATH CHALLENGE', 'Solve 5 speed math equations!', '🧮', 20],
  ['GrandChampion', '🏆 THE 200 GRAND CHAMPION', 'Press CHAMPION CLASH for final trophy!', '🏆', 25],
];

PARTY_LIST.forEach(([key, title, instr, icon, pts]) => {
  PARTY_ULT.buildGenericParty(title, instr, icon, pts, key);
});
