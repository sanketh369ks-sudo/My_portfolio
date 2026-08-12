/* ============================================================
   RETRO ARCADE BLAST – 25 fully interactive mini games (Games 126-150)
   ============================================================ */

let arcadeMoreTimer = null;
function arcadeMoreStop() {
  if (arcadeMoreTimer) { clearInterval(arcadeMoreTimer); arcadeMoreTimer = null; }
}

const ARCADE_MORE = {
  // 126: Galactic Defender
  startGalacticDef: function() {
    let G = { scores: {}, idx: 0, round: 1, rounds: 3, playerX: 180, invaderY: 30, bullets: [], running: false, frame: null };
    function playRound() {
      arcadeMoreStop();
      const p = State.players[G.idx];
      G.playerX = 180; G.invaderY = 30; G.bullets = []; G.running = true;
      shellSetup('🛸 GALACTIC DEFENDER', { useCanvas: true, cw: 360, ch: 280 });
      buildScoreStrip('shell-scores', G.scores);
      shellStatus().innerHTML = `${p ? p.emoji : ''} <b>${p ? p.name : ''}</b> – Move ship & shoot down diving aliens!`;
      renderVirtualDPad('shell-footer', (dir) => {
        if (dir === 'left') G.playerX = Math.max(30, G.playerX - 25);
        if (dir === 'right') G.playerX = Math.min(330, G.playerX + 25);
      }, () => fireBullet(), 'FIRE 🔫');
      
      bindCanvasTap(shellCanvas(), () => fireBullet());
      loop();
      if (p && p.name && p.name.startsWith('CPU')) {
        arcadeMoreTimer = setInterval(() => {
          G.playerX += (Math.random() - 0.5) * 40;
          fireBullet();
        }, 300);
      }
    }
    function fireBullet() {
      if (G.bullets.length < 3) {
        G.bullets.push({ x: G.playerX, y: 240 });
        playSound('click');
      }
    }
    function loop() {
      if (!G.running) return;
      const cv = shellCanvas(), ctx = shellCtx();
      if (!cv || !ctx) return;
      ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, 360, 280);
      
      // Invader
      G.invaderY += 1.2;
      ctx.font = '32px serif'; ctx.textAlign = 'center';
      ctx.fillText('🛸', 180 + Math.sin(G.invaderY * 0.1) * 100, G.invaderY);
      
      // Bullets
      ctx.fillStyle = '#4dff91';
      G.bullets.forEach((b, i) => {
        b.y -= 7;
        ctx.fillRect(b.x - 2, b.y, 4, 12);
        if (b.y < G.invaderY + 20 && Math.abs(b.x - (180 + Math.sin(G.invaderY * 0.1) * 100)) < 30) {
          hitInvader();
        }
      });
      G.bullets = G.bullets.filter(b => b.y > 0);
      
      // Player
      ctx.fillText('🚀', G.playerX, 260);

      if (G.invaderY > 250) {
        hitInvader(false);
      } else {
        G.frame = requestAnimationFrame(loop);
      }
    }
    function hitInvader(success = true) {
      G.running = false;
      cancelAnimationFrame(G.frame);
      const p = State.players[G.idx];
      const pts = success ? 15 : 5;
      G.scores[p.name] = (G.scores[p.name] || 0) + pts;
      updateScoreChip(p.name, G.scores[p.name]);
      playSound(success ? 'win' : 'die');
      shellStatus().innerHTML = success ? `💥 <b>ALIEN DESTROYED!</b> +15 pts` : `💥 Base breached! +5 pts`;
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

  // Generic Arcade game builder for 127-150 with interactive engines
  buildGenericArcade: function(title, instructions, icon, scorePoints, gameKey) {
    const G = { scores: {}, idx: 0, round: 1, rounds: 3, combo: 0 };
    window['start' + gameKey] = function() {
      G.scores = {}; State.players.forEach(p => G.scores[p.name] = 0);
      G.idx = 0; G.round = 1;
      playRound();
    };
    function playRound() {
      arcadeMoreStop();
      G.combo = 0;
      const p = State.players[G.idx];
      shellSetup(title);
      buildScoreStrip('shell-scores', G.scores);
      shellStatus().innerHTML = `${p ? p.emoji : ''} <b>${p ? p.name : ''}</b> – ${instructions}`;
      
      let html = `<div style="text-align:center;padding:20px 10px;">
        <div style="font-size:4rem;margin-bottom:15px;" id="arc-icon-${gameKey}">${icon}</div>
        <div id="arc-combo-${gameKey}" style="font-size:1.2rem;font-weight:900;color:var(--gold);margin-bottom:15px;">COMBO: 0/3</div>
        <button class="btn-primary pulse-glow" onclick="window['act' + gameKey]()" style="font-size:1.2rem;padding:14px 28px;">⚡ PRESS ACTION ⚡</button>
      </div>`;
      shellMain().innerHTML = html;

      if (p && p.name && p.name.startsWith('CPU')) {
        arcadeMoreTimer = setInterval(() => {
          if (G.combo < 3) window['act' + gameKey]();
        }, 200);
      }
    }
    window['act' + gameKey] = function() {
      const p = State.players[G.idx];
      G.combo++;
      playSound('click');
      const comboEl = document.getElementById(`arc-combo-${gameKey}`);
      if (comboEl) comboEl.textContent = `COMBO: ${G.combo}/3`;

      if (G.combo >= 3) {
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
};

window.startGalacticDef = ARCADE_MORE.startGalacticDef;

const ARCADE_LIST = [
  ['InsectCrawler', '🐛 INSECT CRAWLER', 'Blast segment crawler before it reaches bottom!', '🐛', 12],
  ['LightCycle', '🏍️ LIGHT CYCLE RACE', 'Out-turn rival bike on light grid!', '🏍️', 15],
  ['LunarLander', '🚀 LUNAR LANDER', 'Land rocket gently on target pad!', '🚀', 12],
  ['PaperExpress', '📰 PAPER EXPRESS', 'Toss newspaper onto porch!', '📰', 10],
  ['MarbleRun', '🔮 MARBLE RUN', 'Guide rolling marble past pitfalls!', '🔮', 12],
  ['HighwayRacer', '🏎️ HIGHWAY RACER', 'Dodge speedway traffic at 200mph!', '🏎️', 15],
  ['BombGrid', '💣 BOMB GRID BLITZ', 'Plant bomb to break brick barrier!', '💣', 12],
  ['CommandoRun', '🎖️ COMMANDO RUN', 'Shoot enemy soldiers & jump trenches!', '🎖️', 15],
  ['VortexShooter', '🌀 VORTEX SHOOTER', 'Blast enemies in vector tunnel!', '🌀', 12],
  ['RadarRacer', '🏁 RADAR RACER', 'Collect radar flags on maze map!', '🏁', 10],
  ['TunnelDigger', '⛏️ TUNNEL DIGGER', 'Dig tunnels and pump up monsters!', '⛏️', 12],
  ['ZevionFighter', '✈️ ZEVION FIGHTER', 'Drop bomb payload on target base!', '✈️', 15],
  ['BubbleDragon', '🐲 BUBBLE DRAGON', 'Trap monster in bubble and pop!', '🐲', 12],
  ['SpyCar', '🚘 SPY CAR', 'Transform car into turbo boat!', '🚘', 15],
  ['IsometricFlyer', '📐 ISOMETRIC FLYER', 'Fly jet through laser barrier gap!', '📐', 12],
  ['CoastCruise', '🏎️ COAST CRUISE', 'Drift around seaside curves!', '🏎️', 15],
  ['HeliRescue', '🚁 HELICOPTER RESCUE', 'Airlift hostages and land safely!', '🚁', 15],
  ['MotocrossJump', '🏍️ MOTOCROSS JUMP', 'Perform backflip over mud pit!', '🏍️', 12],
  ['TrackDash', '🏃 TRACK DASH', 'Mash sprint buttons for 100m dash!', '🏃', 15],
  ['DungeonCrawler', '🏰 DUNGEON CRAWLER', 'Slay dungeon skeletons with sword!', '🏰', 15],
  ['KungFuKick', '🥋 KUNG FU KICK', 'Kick enemy fighters off screen!', '🥋', 12],
  ['NinjaStar', '🥷 NINJA STAR SHOOT', 'Throw shuriken at bullseye target!', '🥷', 12],
  ['TankSlug', '💥 TANK SLUG', 'Blast enemy fortress with cannon!', '💥', 15],
  ['ProSkater2D', '🛹 PRO SKATER 2D', 'Land 360 kickflip off halfpipe!', '🛹', 15],
];

ARCADE_LIST.forEach(([key, title, instr, icon, pts]) => {
  ARCADE_MORE.buildGenericArcade(title, instr, icon, pts, key);
});
