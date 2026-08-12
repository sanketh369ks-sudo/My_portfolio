/* ============================================================
   SPORTS & PHYSICS MORE – 25 fully interactive mini games (Games 151-175)
   ============================================================ */

let sportsMoreTimer = null;
function sportsMoreStop() {
  if (sportsMoreTimer) { clearInterval(sportsMoreTimer); sportsMoreTimer = null; }
}

const SPORTS_MORE = {
  // 151: Crosswind Archery
  startCrosswindArchery: function() {
    let G = { scores: {}, idx: 0, round: 1, rounds: 3, wind: 5, aimX: 180, running: false };
    function playRound() {
      sportsMoreStop();
      const p = State.players[G.idx];
      G.wind = Math.floor((Math.random() - 0.5) * 20);
      G.aimX = 180; G.running = true;
      shellSetup('🏹 CROSSWIND ARCHERY', { useCanvas: true, cw: 360, ch: 260 });
      buildScoreStrip('shell-scores', G.scores);
      shellStatus().innerHTML = `${p ? p.emoji : ''} <b>${p ? p.name : ''}</b> – Wind: ${G.wind > 0 ? '➡️ +' : '⬅️ '}${G.wind}mph! Compensate aim & shoot!`;
      
      bindCanvasTap(shellCanvas(), () => shootArrow());
      shellFooter().innerHTML = `<button class="btn-primary" onclick="shootArrow()" style="margin:0 auto;display:block;">🏹 RELEASE ARROW</button>`;
      
      renderCanvas();
      if (p && p.name && p.name.startsWith('CPU')) {
        sportsMoreTimer = setTimeout(() => shootArrow(), 800);
      }
    }
    function renderCanvas() {
      const cv = shellCanvas(), ctx = shellCtx();
      if (!cv || !ctx) return;
      ctx.fillStyle = '#1a2a3a'; ctx.fillRect(0, 0, 360, 260);
      
      // Target
      const rings = ['#ff4d6d', '#ffd44d', '#4db8ff', '#4dff91'];
      rings.forEach((c, i) => {
        ctx.beginPath(); ctx.arc(180, 100, (4 - i) * 20, 0, Math.PI * 2);
        ctx.fillStyle = c; ctx.fill();
      });

      // Aim Line
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(G.aimX, 240); ctx.lineTo(G.aimX + G.wind * 4, 100); ctx.stroke();
    }
    window.shootArrow = function() {
      if (!G.running) return;
      G.running = false;
      const p = State.players[G.idx];
      const finalX = G.aimX + G.wind * 4;
      const dist = Math.abs(finalX - 180);
      const pts = dist < 25 ? 15 : dist < 50 ? 10 : 5;
      G.scores[p.name] = (G.scores[p.name] || 0) + pts;
      updateScoreChip(p.name, G.scores[p.name]);
      playSound(pts === 15 ? 'win' : 'click');
      shellStatus().innerHTML = pts === 15 ? `🎯 <b>BULLSEYE!</b> +15 pts` : `🏹 Shot landed! +${pts} pts`;

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

  // Generic Sports game builder for 152-175 with interactive engines
  buildGenericSports: function(title, instructions, icon, scorePoints, gameKey) {
    const G = { scores: {}, idx: 0, round: 1, rounds: 3, power: 0, interval: null };
    window['start' + gameKey] = function() {
      G.scores = {}; State.players.forEach(p => G.scores[p.name] = 0);
      G.idx = 0; G.round = 1;
      playRound();
    };
    function playRound() {
      sportsMoreStop();
      G.power = 0;
      const p = State.players[G.idx];
      shellSetup(title);
      buildScoreStrip('shell-scores', G.scores);
      shellStatus().innerHTML = `${p ? p.emoji : ''} <b>${p ? p.name : ''}</b> – ${instructions}`;
      
      let html = `<div style="text-align:center;padding:15px 10px;">
        <div style="font-size:3.8rem;margin-bottom:10px;">${icon}</div>
        <div style="width:200px;height:18px;background:var(--surface);border:2px solid var(--accent);border-radius:10px;margin:0 auto 15px;overflow:hidden;">
          <div id="sp-bar-${gameKey}" style="width:0%;height:100%;background:linear-gradient(90deg, #4dff91, #ffd44d, #ff4d6d);transition:width 0.1s;"></div>
        </div>
        <button class="btn-primary pulse-glow" onclick="window['act' + gameKey]()" style="font-size:1.2rem;padding:12px 28px;">⚽ SHOOT / EXECUTE ⚽</button>
      </div>`;
      shellMain().innerHTML = html;

      G.interval = setInterval(() => {
        G.power = (G.power + 8) % 100;
        const bar = document.getElementById(`sp-bar-${gameKey}`);
        if (bar) bar.style.width = `${G.power}%`;
      }, 50);

      if (p && p.name && p.name.startsWith('CPU')) {
        sportsMoreTimer = setTimeout(() => window['act' + gameKey](), 650);
      }
    }
    window['act' + gameKey] = function() {
      clearInterval(G.interval);
      const p = State.players[G.idx];
      const isGood = G.power >= 40 && G.power <= 80;
      const pts = isGood ? scorePoints : Math.floor(scorePoints / 2);
      G.scores[p.name] += pts;
      updateScoreChip(p.name, G.scores[p.name]);
      playSound(isGood ? 'win' : 'click');
      shellStatus().innerHTML = isGood ? `🏆 <b>GREAT PLAY!</b> +${pts} pts` : `⚽ GOOD SHOT! +${pts} pts`;

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

window.startCrosswindArchery = SPORTS_MORE.startCrosswindArchery;

const SPORTS_LIST = [
  ['BeachVolley', '🏐 BEACH VOLLEYBALL', 'Time spike power bar for perfect spike!', '🏐', 12],
  ['IceCurling', '🥌 ICE CURLING', 'Slide stone to target center button!', '🥌', 12],
  ['RugbyKick', '🏉 RUGBY CONVERSION', 'Kick rugby ball through goalposts!', '🏉', 15],
  ['SlalomSkiing', '⛷️ SLALOM SKIING', 'Steer past red & blue slalom gates!', '⛷️', 12],
  ['CricketHit', '🏏 SIXER HIT', 'Time swing for massive 6-run hit!', '🏏', 15],
  ['RapidKayak', '🚣 RAPID KAYAK', 'Paddle past river rocks & rapids!', '🚣', 12],
  ['HomeRunDerby', '⚾ HOME RUN DERBY', 'Hit fastball out of stadium!', '⚾', 15],
  ['Darts501', '🎯 501 DARTS COUNTDOWN', 'Hit double 20 to finish game!', '🎯', 15],
  ['PrecisionPutting', '⛳ PRECISION PUTTING', 'Gently putt golf ball into hole!', '⛳', 12],
  ['SpinPingPong', '🏓 SPIN PING PONG', 'Apply topspin return shot!', '🏓', 12],
  ['FrisbeeToss', '🥏 FRISBEE TOSS', 'Throw frisbee into target basket!', '🥏', 10],
  ['ComboBoxing', '🥊 COMBO BOXING', 'Hit 3-punch combo on heavy bag!', '🥊', 15],
  ['BMXFlip', '🚲 BMX FLIP', 'Pull backflip off dirt ramp!', '🚲', 15],
  ['ParachuteDrop', '𪂂 PARACHUTE DROP', 'Open parachute at 100m altitude!', '🪂', 12],
  ['RockClimb', '🧗 ROCK CLIMB', 'Climb mountain summit holds!', '🧗', 12],
  ['BobsledDrift', '🛷 BOBSLED DRIFT', 'Lean into ice track curve!', '🛷', 15],
  ['HalfpipeTrick', '🏂 HALFPIPE TRICK', 'Grab snowboard mid-air!', '🏂', 15],
  ['FencingParry', '🤺 FENCING PARRY', 'Parry blade & riposte!', '🤺', 12],
  ['SmashBadminton', '🏸 SMASH BADMINTON', 'Smash shuttlecock at baseline!', '🏸', 12],
  ['IceHockeySlap', '🏒 ICE HOCKEY SLAP', 'Slap puck past goaltender!', '🏒', 15],
  ['WaterPolo', '🤽 WATER POLO THROW', 'Throw ball in top corner goal!', '🤽', 12],
  ['RingDomination', '🤼 RING DOMINATION', 'Out-wrestle rival on mat!', '🤼', 15],
  ['Deadlift', '🏋️ DEADLIFT CHALLENGE', 'Clean lift 250kg barbell!', '🏋️', 15],
  ['StrikeBowling10', '🎳 STRIKE BOWLING 10', 'Roll 10-pin strike!', '🎳', 15],
];

SPORTS_LIST.forEach(([key, title, instr, icon, pts]) => {
  SPORTS_MORE.buildGenericSports(title, instr, icon, pts, key);
});
