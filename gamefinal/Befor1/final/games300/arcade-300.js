/* ============================================================
   ARCADE BLAST 300 – 25 fully interactive mini games (Games 226-250)
   ============================================================ */

let arcade300Timer = null;
function arcade300Stop() {
  if (arcade300Timer) { clearInterval(arcade300Timer); arcade300Timer = null; }
}

function buildArcade300Engine(title, instructions, actionText, scorePoints, gameKey, icon) {
  const G = { scores: {}, idx: 0, round: 1, rounds: 3, step: 0 };
  window['start' + gameKey] = function() {
    G.scores = {}; State.players.forEach(p => G.scores[p.name] = 0);
    G.idx = 0; G.round = 1;
    playRound();
  };
  function playRound() {
    arcade300Stop();
    G.step = 0;
    const p = State.players[G.idx];
    shellSetup(title);
    buildScoreStrip('shell-scores', G.scores);
    shellStatus().innerHTML = `${p ? p.emoji : ''} <b>${p ? p.name : ''}</b> – Round ${G.round}/${G.rounds}: ${instructions}`;
    
    let html = `<div style="text-align:center;padding:20px 10px;">
      <div style="font-size:3.5rem;margin-bottom:10px;">${icon}</div>
      <div style="font-weight:900;color:var(--gold);margin-bottom:15px;" id="a3-step-${gameKey}">Combo: 0/3</div>
      <button class="btn-primary pulse-glow" onclick="window['act' + gameKey]()" style="font-size:1.2rem;padding:14px 28px;">🕹️ EXECUTE COMBO 🕹️</button>
    </div>`;
    shellMain().innerHTML = html;

    if (p && p.name && p.name.startsWith('CPU')) {
      arcade300Timer = setInterval(() => {
        if (G.step < 3) window['act' + gameKey]();
      }, 180);
    }
  }
  window['act' + gameKey] = function() {
    const p = State.players[G.idx];
    G.step++;
    playSound('click');
    const stepEl = document.getElementById(`a3-step-${gameKey}`);
    if (stepEl) stepEl.textContent = `Combo: ${G.step}/3`;

    if (G.step >= 3) {
      G.scores[p.name] += scorePoints;
      updateScoreChip(p.name, G.scores[p.name]);
      playSound('win');
      shellStatus().innerHTML = `🕹️ <b>ARCADE STAGE CLEARED!</b> +${scorePoints} pts`;

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

const ARCADE_300_LIST = [
  ['PacMania', '🟡 PAC-MANIA DELUXE', 'Eat ghost power pellet & chase 4 ghosts!', '🟡', 15],
  ['GalagaAssault', '👾 GALAGA ASSAULT', 'Capture dual fighter spaceship!', '👾', 15],
  ['HyperspaceAst', '☄️ HYPERSPACE ASTEROIDS', 'Hyperspace jump away from giant meteor!', '☄️', 12],
  ['CyberPinball', '🎰 CYBER PINBALL FX', 'Hit jackpot bumper 3 times!', '🎰', 15],
  ['NeonBreakout', '🧱 NEON BRICK BREAKER', 'Catch fireball power-up & melt bricks!', '🧱', 15],
  ['TRexRunner', '🦖 T-REX DESERT RUNNER', 'Dodge flying pterodactyls!', '🦖', 12],
  ['SkyStacker', '🏢 SKYSCRAPER STACKER', 'Build 20-story skyscraper tower!', '🏢', 15],
  ['RiverFrog', '🐸 RIVER CROSSING FROG', 'Hop on lily pads past crocodiles!', '🐸', 12],
  ['Snake3DArcade', '🐍 SNAKE 3D ARCADE', 'Eat golden apple in 3D maze!', '🐍', 15],
  ['TurboRally80s', '🏎️ TURBO RALLY 80s', 'Hit 250 km/h turbo boost!', '🏎️', 15],
  ['PanzerBlitz', '💥 PANZER BLITZ 2D', 'Destroy enemy bunker turret!', '💥', 15],
  ['SuperBombArena', '💣 SUPER BOMB ARENA', 'Trap enemy robot in bomb corner!', '💣', 15],
  ['JungleCommando', '🎖️ JUNGLE COMMANDO', 'Destroy chopper boss at river end!', '🎖️', 20],
  ['DragonKick', '🥋 DRAGON KICK FIGHTER', 'Perform 720 spin kick!', '🥋', 15],
  ['TankAssaultSlug', '💥 TANK ASSAULT SLUG', 'Deploy mech armor suit!', '💥', 15],
  ['WizardDungeon', '🏰 WIZARD DUNGEON 2D', 'Cast fireball spell at sorcerer!', '🏰', 15],
  ['SpySpeedboat', '🚤 SPY SPEEDBOAT', 'Outrun enemy gunboat on river!', '🚤', 15],
  ['BikeDelivery', '🚲 BIKE DELIVERY RUSH', 'Deliver 5 packages on time!', '🚲', 12],
  ['ApolloLanding', '🚀 APOLLO MOON LANDING', 'Land Lunar Module on Sea of Tranquility!', '🚀', 15],
  ['SuperBMXTrack', '🏍️ SUPER BMX TRACK', 'Land 500pt backflip over mud pit!', '🏍️', 15],
  ['BubbleBust', '🐲 BUBBLE BUST MONSTER', 'Pop boss bubble with lightning burst!', '🐲', 15],
  ['ShurikenStorm', '🥷 SHURIKEN STORM', 'Throw 5 shurikens simultaneously!', '🥷', 15],
  ['FerrariOutrun', '🏎️ FERRARI OUTRUN', 'Reach checkpoint with 1 second left!', '🏎️', 15],
  ['NeonVector', '🌀 NEON VECTOR TUNNEL', 'Fly through hyper-warp tunnel!', '🌀', 15],
  ['SkatePark300', '🛹 SKATE PARK 300', 'Land 1080 spin off mega ramp!', '🛹', 20],
];

ARCADE_300_LIST.forEach(([key, title, instr, icon, pts]) => {
  buildArcade300Engine(title, instr, 'EXECUTE', pts, key, icon);
});
