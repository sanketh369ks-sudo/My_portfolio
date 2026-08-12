/* ======================================================
   ARCHERY – 1–4 players, each takes a turn
   A needle swings left-right over a bullseye target.
   Click/press SPACE to shoot. Closer to center = more points.
   3 arrows per player per turn.
   ====================================================== */

const ARCHERY = {
  scores:      {},
  totalPoints: {},
  currentIdx:  0,
  arrowsLeft:  3,
  needleAngle: -Math.PI / 2,
  needleSpeed: 0.035,
  sweepDir:    1,
  running:     false,
  animFrame:   null,
  canvas:      null,
  ctx:         null,
  // Score zones (angle distance from center in radians → points)
  ZONES: [
    { max: 0.08,  pts: 10, color: '#ff4d6d', label: 'BULLSEYE!' },
    { max: 0.20,  pts: 7,  color: '#ffd44d', label: 'GREAT!'    },
    { max: 0.38,  pts: 4,  color: '#4db8ff', label: 'GOOD'      },
    { max: 0.60,  pts: 2,  color: '#4dff91', label: 'OK'        },
    { max: Infinity, pts: 0, color: '#555',  label: 'MISS'      },
  ],
  lastShotPts: null,
  lastShotLabel: '',
  feedbackTimer: 0,
};

// ── ENTRY ──────────────────────────────────────────────
function startArchery() {
  ARCHERY.scores      = {};
  ARCHERY.totalPoints = {};
  State.players.forEach(p => {
    ARCHERY.scores[p.name]      = 0;
    ARCHERY.totalPoints[p.name] = 0;
  });
  ARCHERY.currentIdx  = 0;
  ARCHERY.arrowsLeft  = 3;
  ARCHERY.needleAngle = -Math.PI / 2;
  ARCHERY.needleSpeed = 0.035;
  ARCHERY.sweepDir    = 1;
  ARCHERY.lastShotPts = null;
  ARCHERY.feedbackTimer = 0;

  archeryBuildHud();
  showScreen('screen-archery');
  archeryStartCanvas();
}

function archeryBuildHud() {
  const hud = document.getElementById('archery-scores-hud');
  if (!hud) return;
  hud.innerHTML = '';
  State.players.forEach(p => {
    const chip = document.createElement('div');
    chip.className = 'score-chip';
    chip.innerHTML = `
      <div class="score-dot" style="background:${p.color}"></div>
      <span style="color:${p.color}">${p.name}</span>
      <span id="arch-score-${p.name.replace(/\s/g,'_')}">0</span>
    `;
    hud.appendChild(chip);
  });
}

// ── CANVAS SETUP ───────────────────────────────────────
function archeryStartCanvas() {
  ARCHERY.canvas = document.getElementById('archeryCanvas');
  ARCHERY.ctx    = ARCHERY.canvas.getContext('2d');
  ARCHERY.running = true;

  bindCanvasTap(ARCHERY.canvas, () => archeryShoot());

  archeryUpdateInfo();
  archeryLoop();
}

function archeryStop() {
  ARCHERY.running = false;
  if (ARCHERY.animFrame) {
    cancelAnimationFrame(ARCHERY.animFrame);
    ARCHERY.animFrame = null;
  }
}

// ── ANIMATION LOOP ─────────────────────────────────────
function archeryLoop() {
  if (!ARCHERY.running) return;

  // Move needle
  ARCHERY.needleAngle += ARCHERY.needleSpeed * ARCHERY.sweepDir;
  const limit = Math.PI / 2 + 0.05;
  if (ARCHERY.needleAngle > -Math.PI / 2 + limit) ARCHERY.sweepDir = -1;
  if (ARCHERY.needleAngle < -Math.PI / 2 - limit) ARCHERY.sweepDir =  1;

  if (ARCHERY.feedbackTimer > 0) ARCHERY.feedbackTimer--;

  archeryDraw();
  ARCHERY.animFrame = requestAnimationFrame(archeryLoop);
}

// ── DRAW ───────────────────────────────────────────────
function archeryDraw() {
  const canvas = ARCHERY.canvas;
  const ctx    = ARCHERY.ctx;
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H * 0.72;
  const R  = Math.min(W, H) * 0.36;

  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = '#0d0d1a';
  ctx.fillRect(0, 0, W, H);

  // --- BULLSEYE RINGS ---
  const rings = [
    { r: R,       color: '#1a1a35' },
    { r: R * 0.8, color: '#2a2a50' },
    { r: R * 0.6, color: '#4db8ff33' },
    { r: R * 0.4, color: '#ffd44d44' },
    { r: R * 0.2, color: '#ff4d6d77' },
    { r: R * 0.08,color: '#ff4d6d' },
  ];

  rings.forEach(ring => {
    ctx.beginPath();
    ctx.arc(cx, cy, ring.r, Math.PI, 0);
    ctx.fillStyle = ring.color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Zone labels on rings
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = 'bold 10px Nunito';
  ctx.textAlign = 'center';
  [10, 7, 4, 2].forEach((pts, i) => {
    const rr = [R * 0.04, R * 0.28, R * 0.48, R * 0.68];
    ctx.fillText(pts, cx + rr[i], cy - 6);
  });

  // --- NEEDLE ---
  const needleLen = R + 14;
  const nx = cx + Math.cos(ARCHERY.needleAngle) * needleLen;
  const ny = cy + Math.sin(ARCHERY.needleAngle) * needleLen;

  // Glow trail
  const p  = State.players[ARCHERY.currentIdx];
  const pc = p ? p.color : '#fff';

  ctx.save();
  ctx.shadowColor = pc;
  ctx.shadowBlur  = 20;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(nx, ny);
  ctx.strokeStyle = pc;
  ctx.lineWidth   = 3;
  ctx.lineCap     = 'round';
  ctx.stroke();
  ctx.restore();

  // Needle tip arrow
  ctx.beginPath();
  ctx.arc(nx, ny, 5, 0, Math.PI * 2);
  ctx.fillStyle = pc;
  ctx.fill();

  // --- CENTER DOT ---
  ctx.beginPath();
  ctx.arc(cx, cy, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();

  // --- SCORE FEEDBACK ---
  if (ARCHERY.feedbackTimer > 0 && ARCHERY.lastShotPts !== null) {
    const alpha = Math.min(1, ARCHERY.feedbackTimer / 20);
    const zone  = ARCHERY.ZONES.find(z => ARCHERY.lastShotPts === z.pts) || ARCHERY.ZONES[0];
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 28px Fredoka One, cursive';
    ctx.textAlign = 'center';
    ctx.fillStyle = zone.color;
    ctx.shadowColor = zone.color;
    ctx.shadowBlur  = 20;
    ctx.fillText(zone.label, cx, cy - R - 18);
    ctx.font = 'bold 20px Fredoka One, cursive';
    ctx.fillText(`+${ARCHERY.lastShotPts}`, cx, cy - R - 46);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // --- ARROWS REMAINING ---
  for (let i = 0; i < 3; i++) {
    const filled = i < ARCHERY.arrowsLeft;
    ctx.font = '20px serif';
    ctx.globalAlpha = filled ? 1 : 0.2;
    ctx.fillText('🏹', cx - 32 + i * 28, H - 14);
  }
  ctx.globalAlpha = 1;
}

// ── SHOOT ──────────────────────────────────────────────
function archeryShoot() {
  if (!ARCHERY.running || ARCHERY.arrowsLeft <= 0) return;

  // Calculate distance from center (angle -PI/2 is perfect center)
  const centerAngle = -Math.PI / 2;
  const dist = Math.abs(ARCHERY.needleAngle - centerAngle);

  let pts = 0;
  let zone = ARCHERY.ZONES[ARCHERY.ZONES.length - 1];
  for (const z of ARCHERY.ZONES) {
    if (dist < z.max) { pts = z.pts; zone = z; break; }
  }

  const p = State.players[ARCHERY.currentIdx];
  ARCHERY.scores[p.name]      += pts;
  ARCHERY.totalPoints[p.name] += pts;

  ARCHERY.lastShotPts   = pts;
  ARCHERY.feedbackTimer = 55;

  ARCHERY.arrowsLeft--;

  // Speed up needle each shot for difficulty
  ARCHERY.needleSpeed = Math.min(0.09, ARCHERY.needleSpeed + 0.012);

  playSound(pts >= 7 ? 'win' : pts >= 3 ? 'match' : 'place');

  // Update score display
  const el = document.getElementById(`arch-score-${p.name.replace(/\s/g,'_')}`);
  if (el) el.textContent = ARCHERY.scores[p.name];

  archeryUpdateInfo();

  if (ARCHERY.arrowsLeft <= 0) {
    setTimeout(() => {
      ARCHERY.currentIdx++;
      if (ARCHERY.currentIdx >= State.playerCount) {
        // All done
        archeryStop();
        setTimeout(() => {
          const sorted = Object.entries(ARCHERY.scores).sort((a,b) => b[1]-a[1]);
          const isDraw = sorted.length > 1 && sorted[0][1] === sorted[1][1];
          showResult(ARCHERY.scores, sorted[0][0], isDraw);
        }, 400);
      } else {
        // Next player
        ARCHERY.arrowsLeft  = 3;
        ARCHERY.needleSpeed = 0.035;
        ARCHERY.scores[State.players[ARCHERY.currentIdx].name] = 0;
        archeryUpdateInfo();
      }
    }, 1000);
  }
}

function archeryUpdateInfo() {
  const p = State.players[ARCHERY.currentIdx];
  if (!p) return;
  const infoEl = document.getElementById('archery-info');
  if (infoEl) {
    infoEl.innerHTML = `
      <span style="color:${p.color}">${p.emoji} ${p.name}</span>
      &nbsp;–&nbsp; Arrows left: ${'🏹'.repeat(ARCHERY.arrowsLeft)}
    `;
  }

  if (p && p.name && p.name.startsWith('CPU') && ARCHERY.running && ARCHERY.arrowsLeft > 0) {
    setTimeout(() => {
      if (ARCHERY.running && ARCHERY.arrowsLeft > 0) archeryShoot();
    }, 600 + Math.random() * 400);
  }
}

// Keyboard & button trigger
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && document.getElementById('screen-archery').classList.contains('active')) {
    e.preventDefault();
    archeryShoot();
  }
});
