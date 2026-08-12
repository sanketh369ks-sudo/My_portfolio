/* ============================================================
   SPORTS GAMES – 5 games
   🏓 Ping Pong | 🏀 Basketball | 🎳 Bowling | ⚽ Penalty | ⛳ Mini Golf
   ============================================================ */

// ── PING PONG (Canvas) ───────────────────────────────────────
const PONG = {
  scores: {}, running: false, frame: null,
  ball: { x: 200, y: 160, vx: 3, vy: 2, r: 8 },
  p1: { y: 130, h: 60, score: 0 }, p2: { y: 130, h: 60, score: 0 },
  W: 400, H: 320, PAD: 12, PW: 10, WINNING: 5,
  keys: { w: false, s: false, ArrowUp: false, ArrowDown: false }
};
function startPong() {
  PONG.scores = {}; State.players.forEach(p => PONG.scores[p.name] = 0);
  PONG.p1.y = 130; PONG.p2.y = 130; PONG.p1.score = 0; PONG.p2.score = 0;
  PONG.ball = { x: 200, y: 160, vx: 3.5 * (Math.random() > .5 ? 1 : -1), vy: 2 * (Math.random() > .5 ? 1 : -1), r: 8 };
  PONG.running = false;
  shellSetup('🏓 PING PONG', { useCanvas: true, cw: 400, ch: 320 });
  buildScoreStrip('shell-scores', PONG.scores);
  shellStatus().innerHTML = `<span style="color:${State.players[0].color}">${State.players[0].emoji} W/S</span> &nbsp;vs&nbsp; <span style="color:${State.players[1]?.color || '#4db8ff'}">${State.players[1]?.emoji || '🤖'} ↑/↓</span>`;
  shellFooter().innerHTML = `<button class="btn-primary" onclick="pongStart()" id="pong-start-btn">▶ START</button><div id="pong-touch-ctr"></div>`;

  bindCanvasTap(shellCanvas(), (e) => {
    if (!PONG.running) return;
    const rect = shellCanvas().getBoundingClientRect();
    const touchY = (e.clientY - rect.top) * (PONG.H / rect.height);
    PONG.p1.y = touchY - PONG.p1.h / 2;
  });

  pongDraw();
}
function pongStart() {
  PONG.running = true;
  const b = document.getElementById('pong-start-btn');
  if (b) b.style.display = 'none';
  renderVirtualDPad('pong-touch-ctr', (dir) => {
    if (dir === 'up') PONG.p1.y -= 25;
    if (dir === 'down') PONG.p1.y += 25;
  });
  pongLoop();
}
function pongLoop() {
  if (!PONG.running) return;
  const b = PONG.ball, H = PONG.H, W = PONG.W, speed = 0.08;
  // AI or P2 paddle
  if (State.playerCount < 2 || !PONG.keys['ArrowUp'] && !PONG.keys['ArrowDown']) { const center = PONG.p2.y + PONG.p2.h / 2; const diff = b.y - center; PONG.p2.y += diff * speed * 6; } else { if (PONG.keys['ArrowUp']) PONG.p2.y -= 5; if (PONG.keys['ArrowDown']) PONG.p2.y += 5; }
  if (PONG.keys['w']) PONG.p1.y -= 5; if (PONG.keys['s']) PONG.p1.y += 5;
  PONG.p1.y = Math.max(0, Math.min(H - PONG.p1.h, PONG.p1.y));
  PONG.p2.y = Math.max(0, Math.min(H - PONG.p2.h, PONG.p2.y));
  b.x += b.vx; b.y += b.vy;
  if (b.y - b.r < 0) { b.y = b.r; b.vy *= -1; } if (b.y + b.r > H) { b.y = H - b.r; b.vy *= -1; }
  // P1 paddle hit
  if (b.x - b.r < PONG.PAD + PONG.PW && b.y > PONG.p1.y && b.y < PONG.p1.y + PONG.p1.h) { b.x = PONG.PAD + PONG.PW + b.r; b.vx = Math.abs(b.vx) * 1.05; b.vy += (b.y - (PONG.p1.y + PONG.p1.h / 2)) * 0.15; playSound('click'); }
  // P2 paddle hit
  if (b.x + b.r > W - PONG.PAD - PONG.PW && b.y > PONG.p2.y && b.y < PONG.p2.y + PONG.p2.h) { b.x = W - PONG.PAD - PONG.PW - b.r; b.vx = -Math.abs(b.vx) * 1.05; b.vy += (b.y - (PONG.p2.y + PONG.p2.h / 2)) * 0.15; playSound('click'); }
  // Score
  if (b.x < 0) { PONG.p2.score++; playSound('die'); pongScored(); }
  if (b.x > W) { PONG.p1.score++; playSound('die'); pongScored(); }
  pongDraw();
  PONG.frame = requestAnimationFrame(pongLoop);
}
function pongScored() {
  PONG.running = false; cancelAnimationFrame(PONG.frame);
  const p2name = State.players[1]?.name || 'CPU';
  if (PONG.p1.score >= PONG.WINNING) { PONG.scores[State.players[0].name] = PONG.p1.score; PONG.scores[p2name] = PONG.p2.score; setTimeout(() => showResult(PONG.scores, State.players[0].name, false), 600); return; }
  if (PONG.p2.score >= PONG.WINNING) { PONG.scores[State.players[0].name] = PONG.p1.score; PONG.scores[p2name] = PONG.p2.score; setTimeout(() => showResult(PONG.scores, p2name, false), 600); return; }
  PONG.ball = { x: 200, y: 160, vx: 3.5 * (Math.random() > .5 ? 1 : -1), vy: 2 * (Math.random() > .5 ? 1 : -1), r: 8 };
  setTimeout(() => { PONG.running = true; pongLoop(); }, 800);
}
function pongDraw() {
  const cv = shellCanvas(), ctx = shellCtx(), W = PONG.W, H = PONG.H, b = PONG.ball;
  if (!cv || !ctx) return;
  ctx.fillStyle = '#0d0d1a'; ctx.fillRect(0, 0, W, H);
  ctx.setLineDash([8, 8]); ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.setLineDash([]);
  // Paddles
  ctx.fillStyle = State.players[0].color; ctx.fillRect(PONG.PAD, PONG.p1.y, PONG.PW, PONG.p1.h);
  ctx.fillStyle = State.players[1]?.color || '#4db8ff'; ctx.fillRect(W - PONG.PAD - PONG.PW, PONG.p2.y, PONG.PW, PONG.p2.h);
  // Ball
  ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0;
  // Scores
  ctx.font = 'bold 32px Fredoka One,cursive'; ctx.textAlign = 'center'; ctx.fillStyle = State.players[0].color; ctx.fillText(PONG.p1.score, W / 4, 40); ctx.fillStyle = State.players[1]?.color || '#4db8ff'; ctx.fillText(PONG.p2.score, 3 * W / 4, 40);
}
document.addEventListener('keydown', e => { if (PONG.keys.hasOwnProperty(e.key)) PONG.keys[e.key] = true; });
document.addEventListener('keyup', e => { if (PONG.keys.hasOwnProperty(e.key)) PONG.keys[e.key] = false; });

// ── BASKETBALL ────────────────────────────────────────────────
const BBALL = { scores: {}, idx: 0, round: 1, rounds: 3, phase: 'aim', angle: 45, power: 50, powerDir: 1, aimDir: 1, iv: null };
function startBasketball() {
  BBALL.scores = {}; State.players.forEach(p => BBALL.scores[p.name] = 0); BBALL.idx = 0; BBALL.round = 1;
  shellSetup('🏀 BASKETBALL', { useCanvas: true, cw: 360, ch: 280 });
  buildScoreStrip('shell-scores', BBALL.scores);
  shellStatus().innerHTML = '<span id="bb-info"></span>';
  shellFooter().innerHTML = `<button class="btn-primary" id="bb-btn" onclick="bbAction()">🏀 AIM</button>`;
  bbReset();
}
function bbReset() {
  BBALL.phase = 'aim'; BBALL.angle = 45; BBALL.power = 50; BBALL.powerDir = 1; BBALL.aimDir = 1;
  const p = State.players[BBALL.idx]; const info = document.getElementById('bb-info');
  if (info) info.innerHTML = `${p.emoji} <b>${p.name}</b> – Round ${BBALL.round}/${BBALL.rounds}`;
  const btn = document.getElementById('bb-btn'); if (btn) { btn.textContent = '🏀 SET ANGLE'; btn.disabled = false; }
  clearInterval(BBALL.iv);
  BBALL.iv = setInterval(() => {
    if (BBALL.phase === 'aim') { BBALL.angle += BBALL.aimDir * 2; if (BBALL.angle > 80 || BBALL.angle < 10) BBALL.aimDir *= -1; }
    else if (BBALL.phase === 'power') { BBALL.power += BBALL.powerDir * 3; if (BBALL.power >= 100 || BBALL.power <= 0) BBALL.powerDir *= -1; }
    bbDraw();
  }, 30);
}
function bbAction() {
  if (BBALL.phase === 'aim') { BBALL.phase = 'power'; const btn = document.getElementById('bb-btn'); if (btn) btn.textContent = '🏀 SHOOT!'; }
  else if (BBALL.phase === 'power') {
    clearInterval(BBALL.iv); BBALL.phase = 'flying';
    const btn = document.getElementById('bb-btn'); if (btn) btn.disabled = true;
    // Calculate if shot scores based on angle (30-70 sweet spot) and power (40-75 sweet spot)
    const ag = BBALL.angle, pw = BBALL.power;
    const agScore = 1 - Math.min(1, Math.abs(ag - 52) / 30);
    const pwScore = 1 - Math.min(1, Math.abs(pw - 58) / 35);
    const total = agScore * pwScore;
    let pts = 0; if (total > 0.7) pts = 3; else if (total > 0.45) pts = 2; else if (total > 0.25) pts = 1;
    const p = State.players[BBALL.idx]; BBALL.scores[p.name] += pts; updateScoreChip(p.name, BBALL.scores[p.name]);
    bbAnimate(pts);
  }
}
function bbAnimate(pts) {
  let t = 0; const int = setInterval(() => {
    t++; bbDraw(t / 30, pts); if (t >= 35) {
      clearInterval(int);
      setTimeout(() => {
        BBALL.idx++; if (BBALL.idx >= State.playerCount) { BBALL.round++; BBALL.idx = 0; }
        if (BBALL.round > BBALL.rounds && BBALL.idx === 0) { const s = Object.entries(BBALL.scores).sort((a, b) => b[1] - a[1]); showResult(BBALL.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]); return; }
        bbReset();
      }, 500);
    }
  }, 30);
}
function bbDraw(t = 0, pts = null) {
  const cv = shellCanvas(), ctx = shellCtx(); if (!cv || !ctx) return;
  ctx.fillStyle = '#0d0d1a'; ctx.fillRect(0, 0, cv.width, cv.height);
  // Basket
  ctx.strokeStyle = '#ff8c00'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(280, 80, 22, 0, Math.PI); ctx.stroke();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;[[268, 80], [280, 110], [292, 80]].forEach(([x, y], i, a) => { if (i < a.length - 1) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(a[i + 1][0], a[i + 1][1]); ctx.stroke(); } });
  ctx.strokeStyle = '#ff8c00'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(280, 58); ctx.lineTo(280, 20); ctx.lineTo(310, 20); ctx.stroke();
  // Power bar
  ctx.fillStyle = '#222'; ctx.fillRect(20, 240, 180, 18); ctx.fillStyle = `hsl(${BBALL.power * 1.2},80%,55%)`; ctx.fillRect(20, 240, BBALL.power * 1.8, 18);
  ctx.fillStyle = '#fff'; ctx.font = '12px Nunito'; ctx.textAlign = 'left'; ctx.fillText(`Power: ${Math.round(BBALL.power)}%`, 20, 232);
  // Angle arrow
  const r = BBALL.angle * Math.PI / 180, ax = 70, ay = 230;
  ctx.strokeStyle = State.players[BBALL.idx].color; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + Math.cos(-(r)) * 60, ay + Math.sin(-r) * 60); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.fillText(`Angle: ${Math.round(BBALL.angle)}°`, 20, 210);
  // Ball in flight
  if (t > 0) { const bx = 70 + Math.cos(-BBALL.angle * Math.PI / 180) * BBALL.power * t * 1.5, by = 230 + Math.sin(-BBALL.angle * Math.PI / 180) * BBALL.power * t * 1.5 + 0.5 * 9.8 * t * t * 20; ctx.beginPath(); ctx.arc(bx, by, 14, 0, Math.PI * 2); ctx.fillStyle = '#ff8c00'; ctx.fill(); }
  else { ctx.beginPath(); ctx.arc(70, 230, 14, 0, Math.PI * 2); ctx.fillStyle = '#ff8c00'; ctx.fill(); }
  // Result overlay
  if (pts !== null && t > 25) { ctx.fillStyle = pts > 0 ? '#4dff91' : '#ff4d6d'; ctx.font = 'bold 30px Fredoka One,cursive'; ctx.textAlign = 'center'; ctx.fillText(pts === 3 ? '🏀 SWISH! +3' : pts === 2 ? '🏀 GOOD! +2' : pts === 1 ? '⛏ RIMMER! +1' : '💨 MISS!', cv.width / 2, cv.height / 2); }
}

// ── BOWLING ─────────────────────────────────────────────────
const BOWL = { scores: {}, idx: 0, round: 1, rounds: 3, phase: 'aim', angle: 0, power: 50, aimDir: 1, pwDir: 1, iv: null, pins: [] };
function startBowling() {
  BOWL.scores = {}; State.players.forEach(p => BOWL.scores[p.name] = 0); BOWL.idx = 0; BOWL.round = 1;
  shellSetup('🎳 BOWLING', { useCanvas: true, cw: 360, ch: 280 });
  buildScoreStrip('shell-scores', BOWL.scores);
  shellStatus().innerHTML = '<span id="bowl-info"></span>';
  shellFooter().innerHTML = `<button class="btn-primary" id="bowl-btn" onclick="bowlAction()">🎳 AIM</button>`;
  bowlReset();
}
function bowlReset() {
  BOWL.phase = 'aim'; BOWL.angle = 0; BOWL.power = 50; BOWL.aimDir = 1; BOWL.pwDir = 1;
  BOWL.pins = []; for (let r = 0; r < 4; r++)for (let c = 0; c <= r; c++)BOWL.pins.push({ x: 140 + c * 30 - r * 15, y: 40 + r * 30, up: true });
  const p = State.players[BOWL.idx]; const el = document.getElementById('bowl-info');
  if (el) el.innerHTML = `${p.emoji} <b>${p.name}</b> – Round ${BOWL.round}/${BOWL.rounds}`;
  const btn = document.getElementById('bowl-btn'); if (btn) { btn.textContent = '🎳 SET AIM'; btn.disabled = false; }
  clearInterval(BOWL.iv); BOWL.iv = setInterval(() => {
    if (BOWL.phase === 'aim') { BOWL.angle += BOWL.aimDir * 2; if (BOWL.angle > 30 || BOWL.angle < -30) BOWL.aimDir *= -1; }
    else if (BOWL.phase === 'power') { BOWL.power += BOWL.pwDir * 3; if (BOWL.power >= 100 || BOWL.power <= 0) BOWL.pwDir *= -1; }
    bowlDraw();
  }, 30);
}
function bowlAction() {
  if (BOWL.phase === 'aim') { BOWL.phase = 'power'; document.getElementById('bowl-btn').textContent = '🎳 RELEASE!'; }
  else if (BOWL.phase === 'power') {
    clearInterval(BOWL.iv); BOWL.phase = 'rolling'; document.getElementById('bowl-btn').disabled = true;
    const knocked = Math.floor((1 - Math.abs(BOWL.angle) / 35) * (BOWL.power / 100) * BOWL.pins.length + Math.random() * 2);
    const k = Math.min(knocked, BOWL.pins.length);
    let remaining = [...BOWL.pins]; for (let i = 0; i < k; i++) { const ri = Math.floor(Math.random() * remaining.length); remaining[ri].up = false; remaining.splice(ri, 1); }
    const pts = k === 10 ? 30 : k; const p = State.players[BOWL.idx]; BOWL.scores[p.name] += pts; updateScoreChip(p.name, BOWL.scores[p.name]);
    playSound(k === 10 ? 'win' : k > 5 ? 'match' : 'click');
    let t = 0; const int = setInterval(() => {
      t++; bowlDraw(t / 20); if (t >= 25) {
        clearInterval(int);
        setTimeout(() => {
          BOWL.idx++; if (BOWL.idx >= State.playerCount) { BOWL.round++; BOWL.idx = 0; }
          if (BOWL.round > BOWL.rounds && BOWL.idx === 0) { const s = Object.entries(BOWL.scores).sort((a, b) => b[1] - a[1]); showResult(BOWL.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]); return; }
          bowlReset();
        }, 500);
      }
    }, 40);
  }
}
function bowlDraw(t = 0) {
  const cv = shellCanvas(), ctx = shellCtx(); if (!cv || !ctx) return;
  ctx.fillStyle = '#0d0d1a'; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = '#3a2a1a'; ctx.fillRect(60, 0, 240, cv.height);
  ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 1; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(60 + i * 80, 0); ctx.lineTo(60 + i * 80, cv.height); ctx.stroke(); }
  // Pins
  BOWL.pins.forEach(pin => { if (pin.up) { ctx.beginPath(); ctx.arc(pin.x, pin.y, 10, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); } else { ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(pin.x - 8, pin.y - 4, 16, 8); } });
  // Aim line
  ctx.strokeStyle = State.players[BOWL.idx].color + '88'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
  const ag = BOWL.angle * Math.PI / 180; ctx.beginPath(); ctx.moveTo(180, cv.height - 20); ctx.lineTo(180 + Math.sin(ag) * 200, cv.height - 20 - Math.cos(ag) * 200); ctx.stroke(); ctx.setLineDash([]);
  // Ball
  const bx = BOWL.phase === 'rolling' ? 180 + Math.sin(BOWL.angle * Math.PI / 180) * t * (BOWL.power * 1.5) : 180, by = cv.height - 20 - (BOWL.phase === 'rolling' ? t * BOWL.power * 1.5 : 0);
  ctx.beginPath(); ctx.arc(bx, Math.max(by, 20), 16, 0, Math.PI * 2); ctx.fillStyle = State.players[BOWL.idx].color; ctx.fill();
  // Power bar
  if (BOWL.phase !== 'rolling') { ctx.fillStyle = '#222'; ctx.fillRect(20, cv.height - 40, 60, 16); ctx.fillStyle = `hsl(${BOWL.power * 1.2},80%,55%)`; ctx.fillRect(20, cv.height - 40, BOWL.power * .6, 16); ctx.fillStyle = '#fff'; ctx.font = '11px Nunito'; ctx.textAlign = 'left'; ctx.fillText(`Power`, 20, cv.height - 46); }
}

// ── PENALTY KICK ──────────────────────────────────────────────
const PEN = { scores: { p1: 0, p2: 0 }, round: 1, rounds: 5, phase: 'kick', kickerIdx: 0 };
function startPenalty() {
  PEN.scores = {};
  const p1 = State.players[0] || { name: 'Player 1', emoji: '🔴', color: '#ff4d6d' };
  const p2 = State.players[1] || { name: 'Keeper', emoji: '🤖', color: '#4db8ff' };
  PEN.scores[p1.name] = 0; PEN.scores[p2.name] = 0;
  PEN.round = 1; PEN.phase = 'kick'; PEN.kickerIdx = 0;
  shellSetup('⚽ PENALTY KICK'); buildScoreStrip('shell-scores', PEN.scores);
  penRender();
}
function penRender() {
  const kicker = State.players[PEN.kickerIdx] || State.players[0] || { name: 'Player 1', emoji: '🔴' };
  const keeper = State.players[1 - PEN.kickerIdx] || { name: 'Keeper', emoji: '🤖' };
  shellMain().innerHTML = `
    <div class="pen-area">
      <div class="pen-goal">🥅</div>
      <div class="pen-info" id="pen-info">${kicker.emoji} <b>${kicker.name}</b> is kicking – Round ${PEN.round}/${PEN.rounds}</div>
      ${PEN.phase === 'kick' ? `
        <div class="pen-question">Where do you shoot?</div>
        <div class="pen-btns">
          <button class="btn-secondary" onclick="penKick('L')">⬅ Left</button>
          <button class="btn-secondary" onclick="penKick('C')">⬆ Centre</button>
          <button class="btn-secondary" onclick="penKick('R')">Right ➡</button>
        </div>`: `
        <div class="pen-question">${keeper.emoji} <b>${keeper.name}</b>: Save which side?</div>
        <div class="pen-btns">
          <button class="btn-secondary" onclick="penSave('L')">⬅ Dive Left</button>
          <button class="btn-secondary" onclick="penSave('C')">🧤 Stay</button>
          <button class="btn-secondary" onclick="penSave('R')">Dive Right ➡</button>
        </div>`}
    </div>`;
}
let _penKick = '';
function penKick(dir) { _penKick = dir; PEN.phase = 'save'; penRender(); }
function penSave(dir) {
  const kicker = State.players[PEN.kickerIdx]; const goal = _penKick !== dir;
  if (goal) { PEN.scores[kicker.name]++; updateScoreChip(kicker.name, PEN.scores[kicker.name]); playSound('win'); } else { playSound('die'); }
  shellMain().innerHTML = `<div class="pen-area"><div class="pen-goal" style="font-size:4rem">🥅</div><div class="pen-result">${goal ? '⚽ GOAL! +1' : '🧤 SAVED!'}</div></div>`;
  PEN.kickerIdx = 1 - PEN.kickerIdx; PEN.phase = 'kick';
  if (PEN.kickerIdx === 0) PEN.round++;
  if (PEN.round > PEN.rounds) { setTimeout(() => { const s = Object.entries(PEN.scores).sort((a, b) => b[1] - a[1]); showResult(PEN.scores, s[0][0], s[0][1] === s[1][1]); }, 1000); }
  else setTimeout(penRender, 1400);
}

// ── MINI GOLF ──────────────────────────────────────────────────
const GOLF = { scores: {}, idx: 0, round: 1, rounds: 4, phase: 'aim', angle: 90, power: 40, pwDir: 1, agDir: 1, iv: null, hole: { x: 300, y: 80 }, ball: { x: 60, y: 210 } };
function startMiniGolf() {
  GOLF.scores = {}; State.players.forEach(p => GOLF.scores[p.name] = 0); GOLF.idx = 0; GOLF.round = 1;
  shellSetup('⛳ MINI GOLF', { useCanvas: true, cw: 360, ch: 280 });
  buildScoreStrip('shell-scores', GOLF.scores);
  shellStatus().innerHTML = '<span id="golf-info"></span>';
  shellFooter().innerHTML = `<button class="btn-primary" id="golf-btn" onclick="golfAction()">🏌️ AIM</button>`;
  golfReset();
}
function golfReset() {
  GOLF.phase = 'aim'; GOLF.angle = 90; GOLF.power = 40; GOLF.pwDir = 1; GOLF.agDir = 1;
  const p = State.players[GOLF.idx]; const el = document.getElementById('golf-info');
  if (el) el.innerHTML = `${p.emoji} <b>${p.name}</b> – Round ${GOLF.round}/${GOLF.rounds}`;
  const btn = document.getElementById('golf-btn'); if (btn) { btn.textContent = '🏌️ SET ANGLE'; btn.disabled = false; }
  clearInterval(GOLF.iv); GOLF.iv = setInterval(() => {
    if (GOLF.phase === 'aim') { GOLF.angle += GOLF.agDir * 2; if (GOLF.angle > 170 || GOLF.angle < 10) GOLF.agDir *= -1; }
    else if (GOLF.phase === 'power') { GOLF.power += GOLF.pwDir * 3; if (GOLF.power >= 100 || GOLF.power <= 0) GOLF.pwDir *= -1; }
    golfDraw();
  }, 30);
}
function golfAction() {
  if (GOLF.phase === 'aim') { GOLF.phase = 'power'; document.getElementById('golf-btn').textContent = '🏌️ SWING!'; }
  else if (GOLF.phase === 'power') {
    clearInterval(GOLF.iv); GOLF.phase = 'flying'; document.getElementById('golf-btn').disabled = true;
    const rad = GOLF.angle * Math.PI / 180, spd = GOLF.power / 20;
    const targetAngle = Math.atan2(GOLF.hole.y - GOLF.ball.y, GOLF.hole.x - GOLF.ball.x);
    const diff = Math.abs(rad - targetAngle % (2 * Math.PI)); const dist = Math.hypot(GOLF.hole.x - GOLF.ball.x, GOLF.hole.y - GOLF.ball.y);
    const accuracy = 1 - Math.min(1, diff / 1.5); const powerScore = 1 - Math.abs(GOLF.power - 60) / 50;
    const total = accuracy * powerScore; let pts = 0; if (total > 0.75) pts = 3; else if (total > 0.5) pts = 2; else if (total > 0.3) pts = 1;
    const p = State.players[GOLF.idx]; GOLF.scores[p.name] += pts; updateScoreChip(p.name, GOLF.scores[p.name]);
    let t = 0; const int = setInterval(() => {
      t++; golfDraw(t / 30 * spd, pts, t > 28); if (t >= 35) {
        clearInterval(int);
        setTimeout(() => {
          GOLF.idx++; if (GOLF.idx >= State.playerCount) { GOLF.round++; GOLF.idx = 0; }
          if (GOLF.round > GOLF.rounds && GOLF.idx === 0) { const s = Object.entries(GOLF.scores).sort((a, b) => b[1] - a[1]); showResult(GOLF.scores, s[0][0], s.length > 1 && s[0][1] === s[1][1]); return; }
          golfReset();
        }, 600);
      }
    }, 40); playSound('click');
  }
}
function golfDraw(t = 0, pts = null, show = false) {
  const cv = shellCanvas(), ctx = shellCtx(); if (!cv || !ctx) return;
  ctx.fillStyle = '#1a3a1a'; ctx.fillRect(0, 0, cv.width, cv.height);
  // Hole
  ctx.beginPath(); ctx.arc(GOLF.hole.x, GOLF.hole.y, 14, 0, Math.PI * 2); ctx.fillStyle = '#000'; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '16px serif'; ctx.textAlign = 'center'; ctx.fillText('⛳', GOLF.hole.x, GOLF.hole.y + 6);
  // Aim line
  if (GOLF.phase !== 'flying') { const r = GOLF.angle * Math.PI / 180; ctx.strokeStyle = State.players[GOLF.idx].color + '88'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(GOLF.ball.x, GOLF.ball.y); ctx.lineTo(GOLF.ball.x + Math.cos(r) * 80, GOLF.ball.y + Math.sin(r) * 80); ctx.stroke(); ctx.setLineDash([]); }
  // Ball
  const bx = GOLF.phase === 'flying' ? GOLF.ball.x + Math.cos(GOLF.angle * Math.PI / 180) * t * 60 : GOLF.ball.x;
  const by = GOLF.phase === 'flying' ? GOLF.ball.y + Math.sin(GOLF.angle * Math.PI / 180) * t * 60 : GOLF.ball.y;
  ctx.beginPath(); ctx.arc(bx, by, 10, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
  // Power bar
  if (GOLF.phase === 'power') { ctx.fillStyle = '#222'; ctx.fillRect(20, cv.height - 30, 120, 16); ctx.fillStyle = `hsl(${GOLF.power * 1.2},80%,55%)`; ctx.fillRect(20, cv.height - 30, GOLF.power * 1.2, 16); }
  if (show && pts !== null) { ctx.fillStyle = pts > 0 ? '#4dff91' : '#ff4d6d'; ctx.font = 'bold 26px Fredoka One,cursive'; ctx.textAlign = 'center'; ctx.fillText(pts === 3 ? '⛳ HOLE IN ONE! +3' : pts === 2 ? '⛳ GREAT! +2' : pts === 1 ? '⛳ OK! +1' : '💨 MISS!', cv.width / 2, cv.height / 2); }
}
