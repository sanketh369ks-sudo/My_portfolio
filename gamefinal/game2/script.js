/* T20 CRICKET CHAMPIONSHIP - 3D WEBGL ENGINE & COMPLETE GAME LOGIC */

// ==========================================
// 1. AUDIO SYNTHESIZER ENGINE (Web Audio API)
// ==========================================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playBatHit() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(170, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);
    
    gain.gain.setValueAtTime(1.0, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);

    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    noise.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now);
  }

  playCoinFlip() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  playFour() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.3, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.25);
    });
  }

  playSix() {
    if (!this.enabled) return;
    this.playFour();
    this.playCheer();
  }

  playWicket() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playCheer() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 1.5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
    noise.stop(now + 1.5);
  }
}

const sounds = new SoundEngine();

// ==========================================
// 2. THREE.JS 3D WEBGL STADIUM ENGINE
// ==========================================
class Cricket3DEngine {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.width = this.container.clientWidth || 800;
    this.height = this.container.clientHeight || 340;
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.ballMesh = null;
    this.batsmanMesh = null;
    this.batMesh = null;
    this.bailsGroup = null;
    this.stumpsGroup = null;

    this.isThreeLoaded = typeof THREE !== "undefined";

    if (this.isThreeLoaded) {
      this.init3D();
    }
  }

  init3D() {
    // 3D Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x080c14);
    this.scene.fog = new THREE.FogExp2(0x080c14, 0.005);

    // 3D Camera (Behind Bowler Broadcast Angle)
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 12, -35);
    this.camera.lookAt(0, 2, 20);

    // 3D Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(20, 40, -20);
    mainLight.castShadow = true;
    this.scene.add(mainLight);

    // 3D Ground (Grass Field)
    const groundGeo = new THREE.CylinderGeometry(60, 60, 0.2, 64);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0a2e1c, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 3D Pitch Strip
    const pitchGeo = new THREE.BoxGeometry(4, 0.22, 22);
    const pitchMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 0.6 });
    const pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.position.set(0, 0.01, 0);
    pitch.receiveShadow = true;
    this.scene.add(pitch);

    // 3D Boundary Line Ring
    const ringGeo = new THREE.RingGeometry(55, 55.5, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.05;
    this.scene.add(ring);

    // 3D Stadium Light Towers
    this.createStadiumTower(-45, 45);
    this.createStadiumTower(45, 45);
    this.createStadiumTower(-45, -45);
    this.createStadiumTower(45, -45);

    // 3D Stumps & Bails at Batsman end (Z = 10)
    this.stumpsGroup = this.createStumps(0, 0, 10);
    this.scene.add(this.stumpsGroup);

    // 3D Batsman Model with Bat
    this.create3DBatsman(0.5, 0, 10);

    // 3D Red Leather Ball
    const ballGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xd62828, roughness: 0.3 });
    this.ballMesh = new THREE.Mesh(ballGeo, ballMat);
    this.ballMesh.position.set(0, 1, -10);
    this.ballMesh.visible = false;
    this.scene.add(this.ballMesh);

    // Start 60fps Animation Loop
    this.animateLoop();

    // Window Resize Handler
    window.addEventListener("resize", () => {
      if (this.container && this.renderer) {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
      }
    });
  }

  createStadiumTower(x, z) {
    const poleGeo = new THREE.CylinderGeometry(0.4, 0.6, 25, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(x, 12.5, z);
    this.scene.add(pole);

    const lightGeo = new THREE.BoxGeometry(4, 2, 1);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
    const lightHead = new THREE.Mesh(lightGeo, lightMat);
    lightHead.position.set(x, 25, z);
    this.scene.add(lightHead);
  }

  createStumps(x, y, z) {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });

    for (let i = -1; i <= 1; i++) {
      const sGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8);
      const stump = new THREE.Mesh(sGeo, woodMat);
      stump.position.set(x + i * 0.25, y + 0.7, z);
      group.add(stump);
    }

    // Bails
    const bGeo = new THREE.BoxGeometry(0.7, 0.06, 0.08);
    const bMat = new THREE.MeshStandardMaterial({ color: 0xeab308 });
    const bails = new THREE.Mesh(bGeo, bMat);
    bails.position.set(x, y + 1.43, z);
    group.add(bails);

    return group;
  }

  create3DBatsman(x, y, z) {
    const group = new THREE.Group();

    // Body Jersey
    const jerseyColor = (GameState.match && GameState.match.innings1) ? GameState.match.innings1.battingTeam.color : 0x0066cc;
    const bodyMat = new THREE.MeshStandardMaterial({ color: jerseyColor });
    const bodyGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.4, 8);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.3;
    group.add(body);

    // Head / Helmet
    const headGeo = new THREE.SphereGeometry(0.3, 12, 12);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.2;
    group.add(head);

    // Legs (White Pads)
    const padMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc });
    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.2, 8), padMat);
    leg1.position.set(-0.2, 0.6, 0);
    group.add(leg1);

    const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.2, 8), padMat);
    leg2.position.set(0.2, 0.6, 0);
    group.add(leg2);

    // 3D Wooden Cricket Bat
    const batGeo = new THREE.BoxGeometry(0.15, 1.2, 0.35);
    const batMat = new THREE.MeshStandardMaterial({ color: 0xe2b87f, roughness: 0.3 });
    this.batMesh = new THREE.Mesh(batGeo, batMat);
    this.batMesh.position.set(-0.5, 1.1, -0.3);
    this.batMesh.rotation.z = Math.PI / 6;
    group.add(this.batMesh);

    group.position.set(x, y, z);
    this.batsmanMesh = group;
    this.scene.add(group);
  }

  animateLoop() {
    const loop = () => {
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
      requestAnimationFrame(loop);
    };
    loop();
  }

  animate3DDelivery(outcome, callback) {
    if (!this.isThreeLoaded || !this.ballMesh) {
      if (callback) callback();
      return;
    }

    this.ballMesh.visible = true;
    this.ballMesh.position.set(0, 1.2, -10);

    let targetX = 0, targetY = 1.0, targetZ = 10;

    if (outcome === 4) {
      targetX = 25; targetY = 0.3; targetZ = 45;
    } else if (outcome === 6) {
      targetX = 35; targetY = 15; targetZ = 50;
    } else if (outcome === "W") {
      targetX = 0; targetY = 0.8; targetZ = 10;
    } else if (typeof outcome === "number" && outcome > 0) {
      targetX = (Math.random() > 0.5 ? 1 : -1) * (10 + outcome * 4);
      targetY = 0.5;
      targetZ = 20 + outcome * 5;
    }

    const startPos = { x: 0, y: 1.2, z: -10 };
    const steps = 40;
    let currentStep = 0;

    const animInterval = setInterval(() => {
      currentStep++;
      const t = currentStep / steps;

      // Parabolic Arc Y
      const heightArc = Math.sin(t * Math.PI) * (outcome === 6 ? 12 : 3);

      this.ballMesh.position.x = startPos.x + (targetX - startPos.x) * t;
      this.ballMesh.position.y = startPos.y + (targetY - startPos.y) * t + heightArc;
      this.ballMesh.position.z = startPos.z + (targetZ - startPos.z) * t;

      // Bat swing animation at impact (t = 0.5)
      if (t >= 0.45 && this.batMesh) {
        this.batMesh.rotation.y = Math.PI / 3;
      }

      if (currentStep >= steps) {
        clearInterval(animInterval);
        setTimeout(() => {
          this.ballMesh.visible = false;
          if (this.batMesh) this.batMesh.rotation.y = 0;
          if (callback) callback();
        }, 300);
      }
    }, 20);
  }
}

let stadium3D;

// ==========================================
// 3. INTERACTIVE SHOT TIMING METER
// ==========================================
class TimingMeter {
  constructor() {
    this.pointerPos = 0;
    this.direction = 1;
    this.speed = 2.2;
    this.animating = true;
    this.pointerEl = document.getElementById("timing-pointer");
    this.startLoop();
  }

  startLoop() {
    const loop = () => {
      if (this.animating) {
        this.pointerPos += this.direction * this.speed;
        if (this.pointerPos >= 100) {
          this.pointerPos = 100;
          this.direction = -1;
        } else if (this.pointerPos <= 0) {
          this.pointerPos = 0;
          this.direction = 1;
        }
        if (this.pointerEl) {
          this.pointerEl.style.left = `${this.pointerPos}%`;
        }
      }
      requestAnimationFrame(loop);
    };
    loop();
  }

  getCurrentTiming() {
    const pos = this.pointerPos;
    if (pos >= 35 && pos <= 65) {
      return "perfect";
    } else if (pos < 35) {
      return "early";
    } else {
      return "late";
    }
  }
}

let timingMeter;

// ==========================================
// 4. GAME STATE & APP CONTROLLER
// ==========================================
const GameState = {
  settings: {
    oversLimit: 20,
    difficulty: "medium",
    soundEnabled: true
  },
  userTeam: null,
  oppTeam: null,
  userPlayingXI: [],
  oppPlayingXI: [],
  captainId: null,
  keeperId: null,
  pitchCondition: "flat",
  fieldPreset: "balanced",
  toss: {
    userCall: null,
    result: null,
    winner: null,
    decision: null
  },
  match: null
};

document.addEventListener("DOMContentLoaded", () => {
  initTeamSelection();
  bindEvents();
  stadium3D = new Cricket3DEngine("stadium-3d-container");
  timingMeter = new TimingMeter();
});

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(screenId);
  if (target) target.classList.add("active");
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 5. TEAM SELECTION SYSTEM
// ==========================================
function initTeamSelection() {
  const userSelect = document.getElementById("select-user-team");
  const oppSelect = document.getElementById("select-opp-team");

  userSelect.innerHTML = "";
  oppSelect.innerHTML = "";

  TEAMS_DATA.forEach((team) => {
    const opt1 = new Option(`${team.flag} ${team.name}`, team.id);
    const opt2 = new Option(`${team.flag} ${team.name}`, team.id);
    userSelect.add(opt1);
    oppSelect.add(opt2);
  });

  userSelect.value = "ind";
  oppSelect.value = "aus";

  updateTeamSelectionUI();

  userSelect.addEventListener("change", () => {
    if (userSelect.value === oppSelect.value) {
      const fallback = TEAMS_DATA.find(t => t.id !== userSelect.value);
      oppSelect.value = fallback.id;
    }
    updateTeamSelectionUI();
  });

  oppSelect.addEventListener("change", () => {
    if (oppSelect.value === userSelect.value) {
      const fallback = TEAMS_DATA.find(t => t.id !== oppSelect.value);
      userSelect.value = fallback.id;
    }
    updateTeamSelectionUI();
  });
}

function updateTeamSelectionUI() {
  const uId = document.getElementById("select-user-team").value;
  const oId = document.getElementById("select-opp-team").value;

  GameState.userTeam = TEAMS_DATA.find(t => t.id === uId);
  GameState.oppTeam = TEAMS_DATA.find(t => t.id === oId);

  document.getElementById("user-flag").innerText = GameState.userTeam.flag;
  document.getElementById("user-bat-stat").innerText = GameState.userTeam.battingRating;
  document.getElementById("user-bowl-stat").innerText = GameState.userTeam.bowlingRating;

  document.getElementById("opp-flag").innerText = GameState.oppTeam.flag;
  document.getElementById("opp-bat-stat").innerText = GameState.oppTeam.battingRating;
  document.getElementById("opp-bowl-stat").innerText = GameState.oppTeam.bowlingRating;
}

// ==========================================
// 6. PLAYING XI SYSTEM
// ==========================================
function renderPlayingXIScreen() {
  document.getElementById("xi-team-name").innerText = `${GameState.userTeam.name} Squad`;
  const container = document.getElementById("squad-grid-container");
  container.innerHTML = "";

  if (GameState.userPlayingXI.length !== 11) {
    autoSelectUserXI();
  }

  GameState.userTeam.players.forEach(player => {
    const isSelected = GameState.userPlayingXI.some(p => p.id === player.id);
    const isCap = GameState.captainId === player.id;
    const isWk = GameState.keeperId === player.id;

    const card = document.createElement("div");
    card.className = `player-item-card ${isSelected ? 'selected' : ''}`;
    
    let roleIcon = "🏏";
    if (player.role === "Bowler") roleIcon = "🎯";
    else if (player.role === "All-Rounder") roleIcon = "⚡";
    else if (player.role === "Wicketkeeper") roleIcon = "🧤";

    card.innerHTML = `
      <div class="player-left">
        <input type="checkbox" ${isSelected ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
        <div class="player-role-badge">${roleIcon}</div>
        <div>
          <div class="player-info-name">${player.name}</div>
          <div class="player-info-sub">${player.role} • ${player.battingStyle}</div>
        </div>
      </div>
      <div class="player-tags">
        <button class="tag-btn ${isCap ? 'active' : ''}" data-cap="${player.id}">👑 C</button>
        <button class="tag-btn ${isWk ? 'active' : ''}" data-wk="${player.id}">🧤 WK</button>
      </div>
    `;

    const chk = card.querySelector("input[type=checkbox]");
    chk.addEventListener("change", (e) => {
      e.stopPropagation();
      toggleUserPlayerSelection(player);
    });
    card.addEventListener("click", (e) => {
      if (e.target.tagName !== "BUTTON" && e.target.tagName !== "INPUT") {
        chk.checked = !chk.checked;
        toggleUserPlayerSelection(player);
      }
    });

    card.querySelector(`[data-cap]`).addEventListener("click", (e) => {
      e.stopPropagation();
      GameState.captainId = player.id;
      if (!isSelected) toggleUserPlayerSelection(player);
      renderPlayingXIScreen();
    });

    card.querySelector(`[data-wk]`).addEventListener("click", (e) => {
      e.stopPropagation();
      GameState.keeperId = player.id;
      if (!isSelected) toggleUserPlayerSelection(player);
      renderPlayingXIScreen();
    });

    container.appendChild(card);
  });

  updateXICountBadge();
}

function toggleUserPlayerSelection(player) {
  const idx = GameState.userPlayingXI.findIndex(p => p.id === player.id);
  if (idx >= 0) {
    if (GameState.userPlayingXI.length <= 11) {
      GameState.userPlayingXI.splice(idx, 1);
    }
  } else {
    if (GameState.userPlayingXI.length < 11) {
      GameState.userPlayingXI.push(player);
    }
  }
  updateXICountBadge();
  renderPlayingXIScreen();
}

function autoSelectUserXI() {
  const squad = [...GameState.userTeam.players];
  const wks = squad.filter(p => p.role === "Wicketkeeper");
  const bowlers = squad.filter(p => p.role === "Bowler");
  const batsmen = squad.filter(p => p.role === "Batsman" || p.role === "All-Rounder");

  const xi = [];
  if (wks.length > 0) xi.push(wks[0]);
  bowlers.slice(0, 4).forEach(b => xi.push(b));
  batsmen.forEach(b => { if (xi.length < 11 && !xi.includes(b)) xi.push(b); });
  squad.forEach(p => { if (xi.length < 11 && !xi.includes(p)) xi.push(p); });

  GameState.userPlayingXI = xi;
  GameState.captainId = xi[0].id;
  GameState.keeperId = (wks.length > 0 ? wks[0].id : xi[1].id);
}

function updateXICountBadge() {
  document.getElementById("xi-count-badge").innerText = `Selected: ${GameState.userPlayingXI.length} / 11`;
}

function autoSelectOpponentXI() {
  const squad = [...GameState.oppTeam.players];
  const wks = squad.filter(p => p.role === "Wicketkeeper");
  const bowlers = squad.filter(p => p.role === "Bowler");
  const batsmen = squad.filter(p => p.role === "Batsman" || p.role === "All-Rounder");

  const xi = [];
  if (wks.length > 0) xi.push(wks[0]);
  bowlers.slice(0, 4).forEach(b => xi.push(b));
  batsmen.forEach(b => { if (xi.length < 11 && !xi.includes(b)) xi.push(b); });
  squad.forEach(p => { if (xi.length < 11 && !xi.includes(p)) xi.push(p); });

  GameState.oppPlayingXI = xi;
}

// ==========================================
// 7. TOSS SYSTEM
// ==========================================
function startTossAnimation(userCall) {
  sounds.playCoinFlip();
  GameState.toss.userCall = userCall;
  const coin = document.getElementById("coin-element");
  coin.classList.add("flipping");

  document.getElementById("toss-call-section").style.display = "none";

  setTimeout(() => {
    coin.classList.remove("flipping");
    const isHeads = Math.random() >= 0.5;
    const tossResult = isHeads ? "heads" : "tails";
    GameState.toss.result = tossResult;

    if (tossResult === "tails") {
      coin.style.transform = "rotateY(180deg)";
    } else {
      coin.style.transform = "rotateY(0deg)";
    }

    const isUserWinner = (userCall === tossResult);
    GameState.toss.winner = isUserWinner ? "user" : "opp";

    const resultBox = document.getElementById("toss-result-section");
    const winnerTitle = document.getElementById("toss-winner-title");
    const decisionPrompt = document.getElementById("toss-decision-prompt");
    const decisionBtns = document.getElementById("toss-decision-btns");

    resultBox.style.display = "block";

    if (isUserWinner) {
      winnerTitle.innerText = "🎉 You Won the Toss!";
      decisionPrompt.innerText = "Choose your match strategy:";
      decisionBtns.style.display = "flex";
    } else {
      winnerTitle.innerText = `🪙 ${GameState.oppTeam.name} Won the Toss!`;
      const aiDecision = Math.random() > 0.4 ? "bat" : "bowl";
      GameState.toss.decision = aiDecision;
      decisionPrompt.innerText = `${GameState.oppTeam.name} elected to ${aiDecision.toUpperCase()} first.`;
      decisionBtns.style.display = "none";

      setTimeout(() => {
        setupMatchObject();
        showScreen("screen-match");
      }, 2000);
    }
  }, 2500);
}

// ==========================================
// 8. MATCH ENGINE & BALL SYSTEM
// ==========================================
function setupMatchObject() {
  const oversLimit = parseInt(GameState.settings.oversLimit, 10);
  GameState.pitchCondition = document.getElementById("select-pitch").value;
  GameState.fieldPreset = document.getElementById("select-field-preset").value;

  let teamBattingFirst, teamBowlingFirst;
  let isUserBattingFirst;

  if (GameState.toss.winner === "user") {
    if (GameState.toss.decision === "bat") {
      teamBattingFirst = GameState.userTeam;
      teamBowlingFirst = GameState.oppTeam;
      isUserBattingFirst = true;
    } else {
      teamBattingFirst = GameState.oppTeam;
      teamBowlingFirst = GameState.userTeam;
      isUserBattingFirst = false;
    }
  } else {
    if (GameState.toss.decision === "bat") {
      teamBattingFirst = GameState.oppTeam;
      teamBowlingFirst = GameState.userTeam;
      isUserBattingFirst = false;
    } else {
      teamBattingFirst = GameState.userTeam;
      teamBowlingFirst = GameState.oppTeam;
      isUserBattingFirst = true;
    }
  }

  const battingXI = isUserBattingFirst ? GameState.userPlayingXI : GameState.oppPlayingXI;
  const bowlingXI = isUserBattingFirst ? GameState.oppPlayingXI : GameState.userPlayingXI;

  GameState.match = {
    oversLimit: oversLimit,
    pitchCondition: GameState.pitchCondition,
    currentInnings: 1,
    target: null,
    isGameOver: false,
    innings1: createInningsObject(teamBattingFirst, teamBowlingFirst, battingXI, bowlingXI, isUserBattingFirst),
    innings2: null
  };

  updateMatchUI();
}

function createInningsObject(battingTeam, bowlingTeam, battingXI, bowlingXI, isUserBatting) {
  const batsmenStats = new Map();
  battingXI.forEach(player => {
    batsmenStats.set(player.id, {
      player: player,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      isOut: false,
      dismissalText: "not out"
    });
  });

  const bowlerStats = new Map();
  bowlingXI.forEach(player => {
    bowlerStats.set(player.id, {
      player: player,
      overs: 0,
      ballsInCurrentOver: 0,
      maidens: 0,
      runsConceded: 0,
      wickets: 0
    });
  });

  const availableBowlers = bowlingXI.filter(p => p.role === "Bowler" || p.role === "All-Rounder" || p.bowlingSkill > 40);

  return {
    battingTeam: battingTeam,
    bowlingTeam: bowlingTeam,
    isUserBatting: isUserBatting,
    battingXI: battingXI,
    bowlingXI: bowlingXI,
    availableBowlers: availableBowlers,
    totalRuns: 0,
    totalWickets: 0,
    totalBalls: 0,
    currentStrikerIndex: 0,
    currentNonStrikerIndex: 1,
    currentBowlerIndex: 0,
    batsmenStats: batsmenStats,
    bowlerStats: bowlerStats,
    overHistory: [],
    commentary: [],
    partnershipRuns: 0,
    partnershipBalls: 0
  };
}

function getCurrentInnings() {
  if (!GameState.match) return null;
  return GameState.match.currentInnings === 1 ? GameState.match.innings1 : GameState.match.innings2;
}

function playBall(shotChoice, deliveryChoice) {
  const inn = getCurrentInnings();
  if (!inn || GameState.match.isGameOver) return;

  const striker = inn.battingXI[inn.currentStrikerIndex];
  const bowler = inn.availableBowlers[inn.currentBowlerIndex];

  const strikerStat = inn.batsmenStats.get(striker.id);
  const bowlerStat = inn.bowlerStats.get(bowler.id);

  if (!shotChoice) shotChoice = getAIShotChoice(striker, inn);
  if (!deliveryChoice) deliveryChoice = getAIDeliveryChoice(bowler);

  const timingQuality = timingMeter.getCurrentTiming();
  const speedKm = generateBallSpeed(deliveryChoice);
  document.getElementById("ball-speed-val").innerText = `${speedKm} km/h`;

  const outcome = resolveBallOutcome(shotChoice, deliveryChoice, striker, bowler, GameState.pitchCondition, timingQuality);

  sounds.playBatHit();

  // 3D Delivery Animation
  stadium3D.animate3DDelivery(outcome, () => {
    let runValue = 0;

    if (outcome === "W") {
      strikerStat.isOut = true;
      strikerStat.balls++;
      inn.totalWickets++;
      inn.totalBalls++;
      bowlerStat.wickets++;
      bowlerStat.ballsInCurrentOver++;

      const dismissalTypes = ["b", "c & b", "lbw", "c fielder b"];
      const dt = dismissalTypes[Math.floor(Math.random() * dismissalTypes.length)];
      strikerStat.dismissalText = `${dt} ${bowler.name}`;

      sounds.playWicket();
      showEventOverlay("💥 OUT!", "event-wicket");
      inn.overHistory.push("W");
      addCommentary(inn, `${striker.name} OUT! ${strikerStat.dismissalText} for ${strikerStat.runs} (${strikerStat.balls}b) [${speedKm} km/h].`);

      inn.partnershipRuns = 0;
      inn.partnershipBalls = 0;

      const nextIdx = Math.max(inn.currentStrikerIndex, inn.currentNonStrikerIndex) + 1;
      if (nextIdx < inn.battingXI.length && inn.totalWickets < 10) {
        inn.currentStrikerIndex = nextIdx;
      }

    } else if (outcome === 4) {
      runValue = 4;
      strikerStat.runs += 4;
      strikerStat.balls++;
      strikerStat.fours++;
      inn.totalRuns += 4;
      inn.totalBalls++;
      bowlerStat.runsConceded += 4;
      bowlerStat.ballsInCurrentOver++;
      inn.partnershipRuns += 4;
      inn.partnershipBalls++;

      sounds.playFour();
      showEventOverlay("4️⃣ FOUR!", "event-four");
      inn.overHistory.push("4");
      addCommentary(inn, `FOUR! ${striker.name} hits a gorgeous boundary! (${speedKm} km/h). [Timing: ${timingQuality.toUpperCase()}]`);

    } else if (outcome === 6) {
      runValue = 6;
      strikerStat.runs += 6;
      strikerStat.balls++;
      strikerStat.sixes++;
      inn.totalRuns += 6;
      inn.totalBalls++;
      bowlerStat.runsConceded += 6;
      bowlerStat.ballsInCurrentOver++;
      inn.partnershipRuns += 6;
      inn.partnershipBalls++;

      sounds.playSix();
      showEventOverlay("6️⃣ SIX!", "event-six");
      inn.overHistory.push("6");
      addCommentary(inn, `SIX! HUGE 3D HIT! ${striker.name} launches it into the stadium stands! (${speedKm} km/h) [Timing: ${timingQuality.toUpperCase()}]`);

    } else {
      runValue = parseInt(outcome, 10) || 0;
      strikerStat.runs += runValue;
      strikerStat.balls++;
      inn.totalRuns += runValue;
      inn.totalBalls++;
      bowlerStat.runsConceded += runValue;
      bowlerStat.ballsInCurrentOver++;
      inn.partnershipRuns += runValue;
      inn.partnershipBalls++;

      inn.overHistory.push(`${runValue}`);
      addCommentary(inn, `${striker.name} plays ${shotChoice} to ${bowler.name} for ${runValue} run(s). (${speedKm} km/h)`);

      if (runValue % 2 !== 0) {
        swapStrikers(inn);
      }
    }

    if (inn.totalBalls % 6 === 0) {
      bowlerStat.overs++;
      bowlerStat.ballsInCurrentOver = 0;
      swapStrikers(inn);
      rotateBowler(inn);
      inn.overHistory = [];
      addCommentary(inn, `--- End of Over ${Math.floor(inn.totalBalls / 6)} ---`);
    }

    checkInningsStatus();
    updateMatchUI();
  });
}

function generateBallSpeed(delivery) {
  if (delivery === "fast") return (142 + Math.random() * 12).toFixed(1);
  if (delivery === "yorker") return (138 + Math.random() * 10).toFixed(1);
  if (delivery === "bouncer") return (140 + Math.random() * 12).toFixed(1);
  if (delivery === "spin") return (86 + Math.random() * 12).toFixed(1);
  return (112 + Math.random() * 10).toFixed(1);
}

function resolveBallOutcome(shot, delivery, striker, bowler, pitch, timing) {
  let rand = Math.random() * 100;

  if (timing === "perfect") rand += 25;
  if (timing === "early") rand -= 15;
  if (timing === "late") rand -= 20;

  const skillDiff = striker.battingSkill - bowler.bowlingSkill;
  rand += skillDiff * 0.25;

  if (pitch === "green" && (delivery === "fast" || delivery === "bouncer")) rand -= 10;
  if (pitch === "dry" && delivery === "spin") rand -= 10;
  if (pitch === "flat") rand += 10;

  if (shot === "defend") {
    if (rand < 5) return "W";
    if (rand < 70) return 0;
    return 1;
  } else if (shot === "single") {
    if (rand < 6) return "W";
    if (rand < 60) return 1;
    if (rand < 90) return 2;
    return 3;
  } else if (shot === "lofted") {
    if (rand < 15) return "W";
    if (rand < 35) return 1;
    if (rand < 60) return 2;
    if (rand < 82) return 4;
    return 6;
  } else if (shot === "power") {
    if (rand < 25) return "W";
    if (rand < 45) return 0;
    if (rand < 70) return 4;
    return 6;
  } else if (shot === "scoop") {
    if (rand < 30) return "W";
    if (rand < 60) return 4;
    return 6;
  }
  return 1;
}

function getAIShotChoice(striker, inn) {
  const shots = ["defend", "single", "lofted", "power", "scoop"];
  if (GameState.match.currentInnings === 2 && GameState.match.target) {
    const runsNeeded = GameState.match.target - inn.totalRuns;
    const ballsRemaining = (GameState.match.oversLimit * 6) - inn.totalBalls;
    const rrr = ballsRemaining > 0 ? (runsNeeded / ballsRemaining) * 6 : 10;

    if (rrr > 10) return Math.random() > 0.4 ? "power" : "lofted";
  }
  return shots[Math.floor(Math.random() * shots.length)];
}

function getAIDeliveryChoice(bowler) {
  const deliveries = ["fast", "yorker", "bouncer", "spin", "slower"];
  return deliveries[Math.floor(Math.random() * deliveries.length)];
}

function swapStrikers(inn) {
  const temp = inn.currentStrikerIndex;
  inn.currentStrikerIndex = inn.currentNonStrikerIndex;
  inn.currentNonStrikerIndex = temp;
}

function rotateBowler(inn) {
  const len = inn.availableBowlers.length;
  if (len > 1) {
    inn.currentBowlerIndex = (inn.currentBowlerIndex + 1) % len;
  }
}

function addCommentary(inn, text) {
  const oversFormatted = `${Math.floor(inn.totalBalls / 6)}.${inn.totalBalls % 6}`;
  inn.commentary.unshift({ ball: oversFormatted, text: text });
  if (inn.commentary.length > 30) inn.commentary.pop();
}

function checkInningsStatus() {
  const inn = getCurrentInnings();
  const maxBalls = GameState.match.oversLimit * 6;

  if (GameState.match.currentInnings === 2) {
    if (inn.totalRuns >= GameState.match.target) {
      endMatch();
      return;
    }
  }

  if (inn.totalWickets >= 10 || inn.totalBalls >= maxBalls) {
    if (GameState.match.currentInnings === 1) {
      startInningsBreak();
    } else {
      endMatch();
    }
  }
}

function startInningsBreak() {
  const i1 = GameState.match.innings1;
  const target = i1.totalRuns + 1;
  GameState.match.target = target;

  document.getElementById("break-team-score").innerText = `${i1.battingTeam.name} scored ${i1.totalRuns}/${i1.totalWickets} in ${formatOvers(i1.totalBalls)}`;
  document.getElementById("break-target-text").innerText = `Target: ${target} Runs to Win`;

  showScreen("screen-innings-break");
}

function startSecondInnings() {
  GameState.match.currentInnings = 2;

  const teamBattingSecond = GameState.match.innings1.bowlingTeam;
  const teamBowlingSecond = GameState.match.innings1.battingTeam;
  const battingXI = GameState.match.innings1.bowlingXI;
  const bowlingXI = GameState.match.innings1.battingXI;
  const isUserBattingSecond = !GameState.match.innings1.isUserBatting;

  GameState.match.innings2 = createInningsObject(teamBattingSecond, teamBowlingSecond, battingXI, bowlingXI, isUserBattingSecond);

  showScreen("screen-match");
  updateMatchUI();
}

function endMatch() {
  GameState.match.isGameOver = true;
  sounds.playCheer();

  const i1 = GameState.match.innings1;
  const i2 = GameState.match.innings2;

  let winnerName = "";
  let marginText = "";

  if (i2.totalRuns >= GameState.match.target) {
    winnerName = `${i2.battingTeam.name} WIN!`;
    const wicketsLeft = 10 - i2.totalWickets;
    marginText = `Won by ${wicketsLeft} wicket(s)`;
  } else if (i1.totalRuns > i2.totalRuns) {
    winnerName = `${i1.battingTeam.name} WIN!`;
    const runDiff = i1.totalRuns - i2.totalRuns;
    marginText = `Won by ${runDiff} run(s)`;
  } else {
    winnerName = `MATCH TIED! 🤝`;
    marginText = `Both teams scored ${i1.totalRuns} runs!`;
  }

  document.getElementById("result-winner-title").innerText = winnerName;
  document.getElementById("result-margin-text").innerText = marginText;

  document.getElementById("result-t1-name").innerText = i1.battingTeam.name;
  document.getElementById("result-t1-score").innerText = `${i1.totalRuns}/${i1.totalWickets} (${formatOvers(i1.totalBalls)})`;

  document.getElementById("result-t2-name").innerText = i2.battingTeam.name;
  document.getElementById("result-t2-score").innerText = `${i2.totalRuns}/${i2.totalWickets} (${formatOvers(i2.totalBalls)})`;

  const potm = calculatePlayerOfTheMatch(i1, i2);
  document.getElementById("potm-name").innerText = potm.name;
  document.getElementById("potm-stat").innerText = potm.stat;

  const topBat = findTopScorer(i1, i2);
  document.getElementById("top-batsman-name").innerText = topBat.name;
  document.getElementById("top-batsman-stat").innerText = `${topBat.runs} Runs (${topBat.balls}b)`;

  const bestBowl = findBestBowler(i1, i2);
  document.getElementById("best-bowler-name").innerText = bestBowl.name;
  document.getElementById("best-bowler-stat").innerText = `${bestBowl.wickets}/${bestBowl.runsConceded} (${bestBowl.overs} Overs)`;

  populateScorecardModal();
  showScreen("screen-result");
}

function calculatePlayerOfTheMatch(i1, i2) {
  let bestPoints = -1;
  let bestPlayer = null;
  let bestStat = "";

  [i1, i2].forEach(inn => {
    inn.batsmenStats.forEach(stat => {
      const pts = stat.runs + (stat.fours * 2) + (stat.sixes * 4);
      if (pts > bestPoints) {
        bestPoints = pts;
        bestPlayer = stat.player;
        bestStat = `${stat.runs} Runs (${stat.balls}b)`;
      }
    });
    inn.bowlerStats.forEach(stat => {
      const pts = (stat.wickets * 25) - (stat.runsConceded * 0.5);
      if (pts > bestPoints) {
        bestPoints = pts;
        bestPlayer = stat.player;
        bestStat = `${stat.wickets}/${stat.runsConceded} (${stat.overs} Overs)`;
      }
    });
  });

  return { name: bestPlayer ? bestPlayer.name : "Match Star", stat: bestStat };
}

function findTopScorer(i1, i2) {
  let top = { name: "N/A", runs: 0, balls: 0 };
  [i1, i2].forEach(inn => {
    inn.batsmenStats.forEach(stat => {
      if (stat.runs >= top.runs) {
        top = { name: stat.player.name, runs: stat.runs, balls: stat.balls };
      }
    });
  });
  return top;
}

function findBestBowler(i1, i2) {
  let best = { name: "N/A", wickets: 0, runsConceded: 999, overs: 0 };
  [i1, i2].forEach(inn => {
    inn.bowlerStats.forEach(stat => {
      if (stat.wickets > best.wickets || (stat.wickets === best.wickets && stat.runsConceded < best.runsConceded)) {
        best = { name: stat.player.name, wickets: stat.wickets, runsConceded: stat.runsConceded, overs: stat.overs };
      }
    });
  });
  return best;
}

// ==========================================
// 9. UI UPDATE & SCOREBOARD BINDING
// ==========================================
function updateMatchUI() {
  const inn = getCurrentInnings();
  if (!inn) return;

  document.getElementById("match-batting-flag").innerText = inn.battingTeam.flag;
  document.getElementById("match-batting-name").innerText = inn.battingTeam.name;
  document.getElementById("match-innings-label").innerText = `Innings ${GameState.match.currentInnings}`;

  document.getElementById("match-score-runs").innerText = `${inn.totalRuns} / ${inn.totalWickets}`;
  document.getElementById("match-overs-text").innerText = `${formatOvers(inn.totalBalls)} / ${GameState.match.oversLimit}.0 Overs`;

  const crr = inn.totalBalls > 0 ? (inn.totalRuns / (inn.totalBalls / 6)).toFixed(2) : "0.00";
  document.getElementById("match-crr").innerText = crr;

  const rrrContainer = document.getElementById("rrr-container");
  const targetContainer = document.getElementById("target-container");

  if (GameState.match.currentInnings === 2 && GameState.match.target) {
    rrrContainer.style.display = "block";
    targetContainer.style.display = "block";
    document.getElementById("match-target").innerText = GameState.match.target;

    const runsNeeded = GameState.match.target - inn.totalRuns;
    const ballsLeft = (GameState.match.oversLimit * 6) - inn.totalBalls;
    const rrr = ballsLeft > 0 ? ((runsNeeded / ballsLeft) * 6).toFixed(2) : "0.00";
    document.getElementById("match-rrr").innerText = rrr;
  } else {
    rrrContainer.style.display = "none";
    targetContainer.style.display = "none";
  }

  const striker = inn.battingXI[inn.currentStrikerIndex];
  const nonStriker = inn.battingXI[inn.currentNonStrikerIndex];
  const strikerStat = inn.batsmenStats.get(striker.id);
  const nonStrikerStat = inn.batsmenStats.get(nonStriker.id);

  document.getElementById("striker-name").innerText = striker.name;
  document.getElementById("striker-stats").innerText = `${strikerStat.runs} (${strikerStat.balls})`;

  document.getElementById("non-striker-name").innerText = nonStriker.name;
  document.getElementById("non-striker-stats").innerText = `${nonStrikerStat.runs} (${nonStrikerStat.balls})`;

  document.getElementById("partnership-runs").innerText = `${inn.partnershipRuns} runs (${inn.partnershipBalls}b)`;

  const bowler = inn.availableBowlers[inn.currentBowlerIndex];
  const bowlerStat = inn.bowlerStats.get(bowler.id);
  document.getElementById("bowler-name").innerText = bowler.name;
  document.getElementById("bowler-figures").innerText = `${bowlerStat.overs}.${bowlerStat.ballsInCurrentOver} - ${bowlerStat.runsConceded} - ${bowlerStat.wickets}`;

  const overBar = document.getElementById("over-history-bar");
  overBar.innerHTML = "";
  if (inn.overHistory.length === 0) {
    overBar.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-muted);">Over starting...</span>`;
  } else {
    inn.overHistory.forEach(b => {
      const badge = document.createElement("span");
      let cls = `b-${b.toLowerCase()}`;
      badge.className = `ball-badge ${cls}`;
      badge.innerText = b;
      overBar.appendChild(badge);
    });
  }

  const batControls = document.getElementById("batting-controls");
  const bowlControls = document.getElementById("bowling-controls");
  const title = document.getElementById("control-panel-title");

  if (inn.isUserBatting) {
    batControls.style.display = "grid";
    bowlControls.style.display = "none";
    title.innerText = "Select Shot Type (You are Batting):";
  } else {
    batControls.style.display = "none";
    bowlControls.style.display = "grid";
    title.innerText = "Select Delivery Variation (You are Bowling):";
  }

  renderCommentary(inn);
  updateWinProbability();
}

function formatOvers(legalBalls) {
  return `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
}

function renderCommentary(inn) {
  const container = document.getElementById("commentary-container");
  container.innerHTML = "";
  inn.commentary.forEach(item => {
    const div = document.createElement("div");
    div.className = "commentary-item";
    div.innerHTML = `<span class="commentary-ball">${item.ball}</span><span class="commentary-text">${item.text}</span>`;
    container.appendChild(div);
  });
}

function updateWinProbability() {
  const inn = getCurrentInnings();
  if (!inn) return;

  let p1 = 50, p2 = 50;
  if (GameState.match.currentInnings === 1) {
    const runRate = inn.totalBalls > 0 ? (inn.totalRuns / (inn.totalBalls / 6)) : 6;
    p1 = Math.min(85, Math.max(15, 50 + (runRate - 7) * 5 - (inn.totalWickets * 4)));
    p2 = 100 - p1;
  } else {
    const target = GameState.match.target;
    const runsNeeded = target - inn.totalRuns;
    const ballsLeft = (GameState.match.oversLimit * 6) - inn.totalBalls;
    const rrr = ballsLeft > 0 ? (runsNeeded / ballsLeft) * 6 : 99;

    if (rrr < 6) p2 = 80;
    else if (rrr < 9) p2 = 60;
    else if (rrr < 12) p2 = 35;
    else p2 = 15;
    p1 = 100 - p2;
  }

  document.getElementById("win-prob-bar1").style.width = `${p1}%`;
  document.getElementById("win-prob-bar2").style.width = `${p2}%`;
  document.getElementById("win-prob-team1-txt").innerText = `${GameState.match.innings1.battingTeam.shortName} ${Math.round(p1)}%`;
  document.getElementById("win-prob-team2-txt").innerText = `${GameState.match.innings1.bowlingTeam.shortName} ${Math.round(p2)}%`;
}

function showEventOverlay(text, className) {
  const overlay = document.getElementById("event-overlay-text");
  overlay.innerText = text;
  overlay.className = `event-overlay active ${className}`;

  setTimeout(() => {
    overlay.classList.remove("active");
  }, 1400);
}

// ==========================================
// 10. SCORECARD MODAL GENERATOR
// ==========================================
function populateScorecardModal() {
  const i1 = GameState.match.innings1;
  const i2 = GameState.match.innings2;

  document.getElementById("modal-i1-title").innerText = `${i1.battingTeam.name} Innings (${i1.totalRuns}/${i1.totalWickets} in ${formatOvers(i1.totalBalls)} Ov)`;
  renderInningsTable("scorecard-i1-batting", "scorecard-i1-bowling", i1);

  if (i2) {
    document.getElementById("modal-i2-title").innerText = `${i2.battingTeam.name} Innings (${i2.totalRuns}/${i2.totalWickets} in ${formatOvers(i2.totalBalls)} Ov)`;
    renderInningsTable("scorecard-i2-batting", "scorecard-i2-bowling", i2);
  }
}

function renderInningsTable(battingBodyId, bowlingBodyId, inn) {
  const batBody = document.getElementById(battingBodyId);
  const bowlBody = document.getElementById(bowlingBodyId);

  batBody.innerHTML = "";
  bowlBody.innerHTML = "";

  inn.batsmenStats.forEach(stat => {
    const sr = stat.balls > 0 ? ((stat.runs / stat.balls) * 100).toFixed(1) : "0.0";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${stat.player.name}</strong> <small style="color:var(--text-muted);">${stat.dismissalText}</small></td>
      <td><strong>${stat.runs}</strong></td>
      <td>${stat.balls}</td>
      <td>${stat.fours}</td>
      <td>${stat.sixes}</td>
      <td>${sr}</td>
    `;
    batBody.appendChild(tr);
  });

  inn.bowlerStats.forEach(stat => {
    const totalBowledBalls = (stat.overs * 6) + stat.ballsInCurrentOver;
    const econ = totalBowledBalls > 0 ? ((stat.runsConceded / totalBowledBalls) * 6).toFixed(2) : "0.00";
    const oversText = `${stat.overs}.${stat.ballsInCurrentOver}`;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${stat.player.name}</strong></td>
      <td>${oversText}</td>
      <td>${stat.maidens}</td>
      <td>${stat.runsConceded}</td>
      <td><strong style="color:var(--primary);">${stat.wickets}</strong></td>
      <td>${econ}</td>
    `;
    bowlBody.appendChild(tr);
  });
}

// ==========================================
// 11. EVENT BINDINGS & HANDLERS
// ==========================================
function bindEvents() {
  document.getElementById("btn-sound-toggle").addEventListener("click", () => {
    const isEnabled = sounds.toggleSound();
    document.getElementById("sound-icon").innerText = isEnabled ? "🔊" : "🔇";
  });

  document.getElementById("btn-nav-rules").addEventListener("click", () => {
    document.getElementById("modal-rules").classList.add("active");
  });
  document.getElementById("btn-close-rules").addEventListener("click", () => {
    document.getElementById("modal-rules").classList.remove("active");
  });

  document.getElementById("btn-nav-home").addEventListener("click", () => {
    showScreen("screen-home");
  });

  document.getElementById("card-play-match").addEventListener("click", () => {
    showScreen("screen-team-select");
  });
  document.getElementById("card-practice").addEventListener("click", () => {
    showScreen("screen-team-select");
  });
  document.getElementById("card-teams").addEventListener("click", () => {
    showScreen("screen-team-select");
  });
  document.getElementById("card-settings").addEventListener("click", () => {
    document.getElementById("modal-settings").classList.add("active");
  });

  document.getElementById("btn-close-settings").addEventListener("click", () => {
    document.getElementById("modal-settings").classList.remove("active");
  });
  document.getElementById("btn-save-settings").addEventListener("click", () => {
    GameState.settings.oversLimit = parseInt(document.getElementById("setting-overs").value, 10);
    GameState.settings.difficulty = document.getElementById("setting-difficulty").value;
    document.getElementById("modal-settings").classList.remove("active");
  });

  document.getElementById("btn-proceed-xi").addEventListener("click", () => {
    renderPlayingXIScreen();
    showScreen("screen-playing-xi");
  });

  document.getElementById("btn-auto-xi").addEventListener("click", () => {
    autoSelectUserXI();
    renderPlayingXIScreen();
  });

  document.getElementById("btn-proceed-toss").addEventListener("click", () => {
    if (GameState.userPlayingXI.length !== 11) {
      alert("Please select exactly 11 players for your team!");
      return;
    }
    autoSelectOpponentXI();
    showScreen("screen-toss");
  });

  document.getElementById("btn-call-heads").addEventListener("click", () => {
    startTossAnimation("heads");
  });
  document.getElementById("btn-call-tails").addEventListener("click", () => {
    startTossAnimation("tails");
  });

  document.getElementById("btn-choose-bat").addEventListener("click", () => {
    GameState.toss.decision = "bat";
    setupMatchObject();
    showScreen("screen-match");
  });
  document.getElementById("btn-choose-bowl").addEventListener("click", () => {
    GameState.toss.decision = "bowl";
    setupMatchObject();
    showScreen("screen-match");
  });

  document.querySelectorAll("[data-shot]").forEach(btn => {
    btn.addEventListener("click", () => {
      const shot = btn.getAttribute("data-shot");
      playBall(shot, null);
    });
  });

  document.querySelectorAll("[data-delivery]").forEach(btn => {
    btn.addEventListener("click", () => {
      const delivery = btn.getAttribute("data-delivery");
      playBall(null, delivery);
    });
  });

  document.getElementById("btn-auto-ball").addEventListener("click", () => {
    playBall(null, null);
  });
  document.getElementById("btn-auto-over").addEventListener("click", () => {
    for (let i = 0; i < 6; i++) {
      if (GameState.match.isGameOver) break;
      playBall(null, null);
    }
  });
  document.getElementById("btn-auto-innings").addEventListener("click", () => {
    let count = 0;
    while (!GameState.match.isGameOver && count < 120) {
      const inn = getCurrentInnings();
      if (!inn) break;
      const prevInnings = GameState.match.currentInnings;
      playBall(null, null);
      if (GameState.match.currentInnings !== prevInnings) break;
      count++;
    }
  });

  document.getElementById("btn-start-innings2").addEventListener("click", () => {
    startSecondInnings();
  });

  document.getElementById("btn-view-scorecard").addEventListener("click", () => {
    document.getElementById("modal-scorecard").classList.add("active");
  });
  document.getElementById("btn-close-scorecard").addEventListener("click", () => {
    document.getElementById("modal-scorecard").classList.remove("active");
  });

  document.getElementById("btn-rematch").addEventListener("click", () => {
    showScreen("screen-team-select");
  });
}
