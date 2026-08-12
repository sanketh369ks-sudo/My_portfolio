/* ============================================================
   SPORTS & PHYSICS 300 – 25 fully interactive mini games (Games 251-275)
   ============================================================ */

let sports300Timer = null;
function sports300Stop() {
  if (sports300Timer) { clearInterval(sports300Timer); sports300Timer = null; }
}

function buildSports300Engine(title, instructions, actionText, scorePoints, gameKey, icon) {
  const G = { scores: {}, idx: 0, round: 1, rounds: 3, power: 0, interval: null };
  window['start' + gameKey] = function() {
    G.scores = {}; State.players.forEach(p => G.scores[p.name] = 0);
    G.idx = 0; G.round = 1;
    playRound();
  };
  function playRound() {
    sports300Stop();
    G.power = 0;
    const p = State.players[G.idx];
    shellSetup(title);
    buildScoreStrip('shell-scores', G.scores);
    shellStatus().innerHTML = `${p ? p.emoji : ''} <b>${p ? p.name : ''}</b> – Round ${G.round}/${G.rounds}: ${instructions}`;
    
    let html = `<div style="text-align:center;padding:15px 10px;">
      <div style="font-size:3.8rem;margin-bottom:10px;">${icon}</div>
      <div style="width:200px;height:18px;background:var(--surface);border:2px solid var(--accent);border-radius:10px;margin:0 auto 15px;overflow:hidden;">
        <div id="sp3-bar-${gameKey}" style="width:0%;height:100%;background:linear-gradient(90deg, #4dff91, #ffd44d, #ff4d6d);transition:width 0.1s;"></div>
      </div>
      <button class="btn-primary pulse-glow" onclick="window['act' + gameKey]()" style="font-size:1.2rem;padding:12px 28px;">⚽ EXECUTE PLAY ⚽</button>
    </div>`;
    shellMain().innerHTML = html;

    G.interval = setInterval(() => {
      G.power = (G.power + 9) % 100;
      const bar = document.getElementById(`sp3-bar-${gameKey}`);
      if (bar) bar.style.width = `${G.power}%`;
    }, 45);

    if (p && p.name && p.name.startsWith('CPU')) {
      sports300Timer = setTimeout(() => window['act' + gameKey](), 600);
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
    shellStatus().innerHTML = isGood ? `⚽ <b>SPECTACULAR GOAL!</b> +${pts} pts` : `⚽ GOOD PLAY! +${pts} pts`;

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

const SPORTS_300_LIST = [
  ['ShootoutPro', '⚽ PENALTY SHOOTOUT PRO', 'Curve ball into top corner goal!', '⚽', 15],
  ['ThreePointContest', '🏀 3-POINT CONTEST', 'Sink 5 money-ball 3-pointers in a row!', '🏀', 15],
  ['BowlingStrike300', '🎳 BOWLING STRIKE 300', 'Bowl 300 perfect game strike!', '🎳', 20],
  ['GrandSlamTennis', '🎾 GRAND SLAM TENNIS', 'Ace 140mph serve on match point!', '🎾', 15],
  ['HoleInOneGolf', '⛳ HOLE-IN-ONE GOLF', 'Hole-in-one off 180yd par 3!', '⛳', 20],
  ['PitchingTarget', '⚾ BASEBALL PITCHING TARGET', 'Throw 100mph fastball in strike zone!', '⚾', 15],
  ['BullseyeArchery', '🏹 BULLSEYE ARCHERY', 'Hit center 10-point yellow ring!', '🏹', 15],
  ['KnockoutBoxing', '🥊 KNOCKOUT BOXING', 'Land knockout uppercut in Round 3!', '🥊', 15],
  ['T20Cricket', '🏏 T20 CRICKET HIT', 'Hit 100-meter straight drive sixer!', '🏏', 15],
  ['RugbyTackle', '🏉 RUGBY TACKLE', 'Tackle ball carrier before try line!', '🏉', 12],
  ['SpikePro', '🏐 VOLLEYBALL SPIKE PRO', 'Spike jump ball over 3-man block!', '🏐', 15],
  ['AlpineSki', '⛷️ ALPINE DOWNHILL SKI', 'Reach 140 km/h on steep ski slope!', '⛷️', 15],
  ['KayakSlalom', '🚣 KAYAK SLALOM', 'Paddle through 10 Olympic slalom gates!', '🚣', 15],
  ['CurlingCenter', '🥌 CURLING CENTER SWEEP', 'Sweep granite stone onto exact button!', '🥌', 15],
  ['HockeyPenalty', '🏒 ICE HOCKEY PENALTY', 'Deake goalkeeper & score breakaway goal!', '🏒', 15],
  ['DartsBullseye501', '🎯 DARTS BULLSEYE 501', 'Finish 501 game with bullseye checkout!', '🎯', 20],
  ['DiscGolfToss', '🥏 DISC GOLF TOSS', 'Sink disc in basket from 50 meters!', '🥏', 12],
  ['BMXMegaRamp', '🚲 BMX MEGA RAMP', 'Land double backflip off 80ft ramp!', '🚲', 20],
  ['SkydivingTarget', '🪂 SKYDIVING TARGET DROP', 'Land directly on center target bullseye!', '🪂', 15],
  ['SpeedRockClimb', '🧗 SPEED ROCK CLIMB', 'Climb 15-meter wall under 6 seconds!', '🧗', 15],
  ['DropShotBadminton', '🏸 BADMINTON DROP SHOT', 'Feather drop shot just over net!', '🏸', 12],
  ['FencingToucher', '🤺 FENCING TOUCHER', 'Score winning touch in sudden death!', '🤺', 15],
  ['SumoPushoutMax', '🤼 SUMO PUSHOUT MAX', 'Push Yokozuna out of dohyo ring!', '🤼', 20],
  ['WaterPoloGoal', '🤽 WATER POLO GOAL SHOOT', 'Score bounce shot past goalkeeper!', '🤽', 15],
  ['BenchPressMax', '🏋️ BENCH PRESS MAX', 'Bench press 200kg for 3 reps!', '🏋️', 15],
];

SPORTS_300_LIST.forEach(([key, title, instr, icon, pts]) => {
  buildSports300Engine(title, instr, 'EXECUTE', pts, key, icon);
});
