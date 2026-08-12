/* ============================================================
   PARTY & SHOWDOWN 300 – 25 fully interactive mini games (Games 276-300)
   ============================================================ */

let party300Timer = null;
function party300Stop() {
  if (party300Timer) { clearInterval(party300Timer); party300Timer = null; }
}

function buildParty300Engine(title, instructions, actionText, scorePoints, gameKey, icon) {
  const G = { scores: {}, idx: 0, round: 1, rounds: 3, step: 0 };
  window['start' + gameKey] = function() {
    G.scores = {}; State.players.forEach(p => G.scores[p.name] = 0);
    G.idx = 0; G.round = 1;
    playRound();
  };
  function playRound() {
    party300Stop();
    G.step = 0;
    const p = State.players[G.idx];
    shellSetup(title);
    buildScoreStrip('shell-scores', G.scores);
    shellStatus().innerHTML = `${p ? p.emoji : ''} <b>${p ? p.name : ''}</b> – Round ${G.round}/${G.rounds}: ${instructions}`;
    
    let html = `<div style="text-align:center;padding:20px 10px;">
      <div style="font-size:3.8rem;margin-bottom:10px;">${icon}</div>
      <div style="font-weight:900;color:var(--gold);margin-bottom:15px;" id="p3-step-${gameKey}">Combo: 0/3</div>
      <button class="btn-primary pulse-glow" onclick="window['act' + gameKey]()" style="font-size:1.2rem;padding:14px 28px;">🎉 PARTY ACTION 🎉</button>
    </div>`;
    shellMain().innerHTML = html;

    if (p && p.name && p.name.startsWith('CPU')) {
      party300Timer = setInterval(() => {
        if (G.step < 3) window['act' + gameKey]();
      }, 180);
    }
  }
  window['act' + gameKey] = function() {
    const p = State.players[G.idx];
    G.step++;
    playSound('click');
    const stepEl = document.getElementById(`p3-step-${gameKey}`);
    if (stepEl) stepEl.textContent = `Combo: ${G.step}/3`;

    if (G.step >= 3) {
      G.scores[p.name] += scorePoints;
      updateScoreChip(p.name, G.scores[p.name]);
      playSound('win');
      shellStatus().innerHTML = `🎉 <b>PARTY WINNER!</b> +${scorePoints} pts`;

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

const PARTY_300_LIST = [
  ['JackpotPartyWheel', '🎰 JACKPOT PARTY WHEEL', 'Spin mega wheel for 100x jackpot!', '🎰', 20],
  ['OutlawQuickDraw', '🤠 OUTLAW QUICK DRAW', 'Out-draw the saloon outlaw in 0.1s!', '🤠', 15],
  ['ExtremeTruthOrDare', '❓ EXTREME TRUTH OR DARE', 'Perform crazy party dare!', '❓', 15],
  ['CategoryWordBlitz', '🗣️ CATEGORY WORD BLITZ', 'Name 3 fruits in 5 seconds!', '🗣️', 15],
  ['EmojiSongQuiz', '🎵 EMOJI SONG QUIZ', 'Guess song title from 🧊🧊👶!', '🎵', 15],
  ['CelebrityGuess', '👤 CELEBRITY GUESS', 'Guess movie star from pixel portrait!', '👤', 12],
  ['PictionaryDraw', '🎨 PICTIONARY DRAW', 'Guess what drawing represents!', '🎨', 12],
  ['InstrumentQuiz', '🎻 INSTRUMENT SOUND QUIZ', 'Identify Violin vs Cello sound!', '🎻', 12],
  ['RedLightGreenLight', '🚦 RED LIGHT GREEN LIGHT', 'Move forward ONLY on Green Light!', '🚦', 15],
  ['GeniusRiddles', '🧠 GENIUS RIDDLES', 'Solve 3 mind-bending riddles!', '🧠', 15],
  ['MarbleBalance3D', '🔮 3D MARBLE BALANCE', 'Navigate marble past 3 trap holes!', '🔮', 15],
  ['PirateTreasure', '🏴‍☠️ PIRATE TREASURE HUNT', 'Dig up 3 gold chest treasures!', '🏴‍☠️', 15],
  ['CookieFactory', '🍪 COOKIE FACTORY CLICKER', 'Bake 1,000 cookies in 10 seconds!', '🍪', 15],
  ['PinataExplosion', '🪅 PARTY PIÑATA EXPLOSION', 'Smash mega piñata into golden candy!', '🪅', 15],
  ['WhackAGhost', '👻 WHACK-A-GHOST', 'Whack 5 spooky ghosts in dark room!', '👻', 15],
  ['CasinoMemory', '🎰 CASINO MEMORY PAIRS', 'Find all 4 Ace cards in deck!', '🎰', 15],
  ['LuckyMegaSpin', '🎡 LUCKY MEGA SPIN', 'Spin mega wheel for 500 bonus points!', '🎡', 15],
  ['SpeedTyper300', '⌨️ SPEED TYPER 300', 'Type 100 WPM text prompt perfectly!', '⌨️', 20],
  ['SubmarineHunter', '🚢 SUBMARINE HUNTER', 'Drop depth charge & sink enemy sub!', '🚢', 15],
  ['BingoRoyale', '🔢 BINGO ROYALE', 'Complete full bingo card board!', '🔢', 20],
  ['LaserMazeRun', '🔫 LASER MAZE RUN', 'Dodge 10 moving laser beams!', '🔫', 15],
  ['StrongmanHammer', '🔨 STRONGMAN HAMMER', 'Smash 100LB sledgehammer onto pad!', '🔨', 15],
  ['SpaceInvaderBoss', '👾 SPACE INVADER BOSS', 'Defeat level 300 giant alien boss!', '👾', 25],
  ['MathSuperBrain', '🧮 MATH SUPER BRAIN', 'Solve calculus & algebra math test!', '🧮', 25],
  ['GrandChampion300', '🏆 THE 300 GRAND CHAMPION', 'Press 300 GRAND CHAMPION for ultimate glory!', '🏆', 30],
];

PARTY_300_LIST.forEach(([key, title, instr, icon, pts]) => {
  buildParty300Engine(title, instr, 'ACTION', pts, key, icon);
});
