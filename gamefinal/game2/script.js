/* T20 CRICKET CHAMPIONSHIP - COMPLETE GAME ENGINE */

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

  // Bat hitting ball (solid wood crack)
  playBatHit() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    
    // Thump oscillator
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.1);
    
    gain.gain.setValueAtTime(1.0, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);

    // Noise snap
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.8, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    noise.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now);
  }

  // Coin Flip Ping
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

  // Four Chime
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

  // Six Fanfare & Crowd Roar
  playSix() {
    if (!this.enabled) return;
    this.playFour();
    this.playCheer();
  }

  // Wicket Clatter
  playWicket() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    // Low crash
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Crowd Cheer Noise
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
    
    // Filter noise to sound like crowd
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
// 2. GAME STATE & APP CONTROLLER
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
  toss: {
    userCall: null,
    result: null,
    winner: null,
    decision: null
  },
  match: null
};

// Initialize App on DOM Load
document.addEventListener("DOMContentLoaded", () => {
  initTeamSelection();
  bindEvents();
});

// Navigation Screen Switcher
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(screenId);
  if (target) target.classList.add("active");
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 3. TEAM SELECTION SYSTEM (Phase 4)
// ==========================================
function initTeamSelection() {
  const userSelect = document.getElementById("select-user-team");
  const oppSelect = document.getElementById("select-opp-team");

  userSelect.innerHTML = "";
  oppSelect.innerHTML = "";

  TEAMS_DATA.forEach((team, index) => {
    const opt1 = new Option(`${team.flag} ${team.name}`, team.id);
    const opt2 = new Option(`${team.flag} ${team.name}`, team.id);
    userSelect.add(opt1);
    oppSelect.add(opt2);
  });

  // Default choices: India vs Australia
  userSelect.value = "ind";
  oppSelect.value = "aus";

  updateTeamSelectionUI();

  userSelect.addEventListener("change", () => {
    if (userSelect.value === oppSelect.value) {
      // Don't allow same team selection
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
// 4. PLAYING XI SYSTEM (Phase 5)
// ==========================================
function renderPlayingXIScreen() {
  document.getElementById("xi-team-name").innerText = `${GameState.userTeam.name} Squad`;
  const container = document.getElementById("squad-grid-container");
  container.innerHTML = "";

  // Auto select first 11 by default if empty
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
          <div class="player-info-sub">${player.role} • Bat:${player.battingSkill} Bowl:${player.bowlingSkill}</div>
        </div>
      </div>
      <div class="player-tags">
        <button class="tag-btn ${isCap ? 'active' : ''}" data-cap="${player.id}">👑 C</button>
        <button class="tag-btn ${isWk ? 'active' : ''}" data-wk="${player.id}">🧤 WK</button>
      </div>
    `;

    // Checkbox toggle handler
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

    // Captain / Keeper buttons
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
  // Sort players by skill & pick best 11
  const squad = [...GameState.userTeam.players];
  // Ensure 1 WK, 4 Bowlers minimum
  const wks = squad.filter(p => p.role === "Wicketkeeper");
  const bowlers = squad.filter(p => p.role === "Bowler");
  const batsmen = squad.filter(p => p.role === "Batsman" || p.role === "All-Rounder");

  const xi = [];
  if (wks.length > 0) xi.push(wks[0]);
  bowlers.slice(0, 4).forEach(b => xi.push(b));
  batsmen.forEach(b => { if (xi.length < 11 && !xi.includes(b)) xi.push(b); });
  
  // Fill remaining if needed
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
// 5. TOSS SYSTEM (Phase 6)
// ==========================================
function startTossAnimation(userCall) {
  sounds.playCoinFlip();
  GameState.toss.userCall = userCall;
  const coin = document.getElementById("coin-element");
  coin.classList.add("flipping");

  document.getElementById("toss-call-section").style.display = "none";

  setTimeout(() => {
    coin.classList.remove("flipping");
    // Random Toss result
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
      // AI toss decision
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
// 6. MATCH SETUP & ENGINE (Phases 7 to 16)
// ==========================================
function setupMatchObject() {
  const oversLimit = parseInt(GameState.settings.oversLimit, 10);
  GameState.pitchCondition = document.getElementById("select-pitch").value;

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

  // Pick Bowlers (only bowlers and all-rounders prefered)
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
    totalBalls: 0, // legal balls
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

// ==========================================
// 7. BATTING & BOWLING LOGIC ENGINE
// ==========================================
function playBall(shotChoice, deliveryChoice) {
  const inn = getCurrentInnings();
  if (!inn || GameState.match.isGameOver) return;

  const striker = inn.battingXI[inn.currentStrikerIndex];
  const nonStriker = inn.battingXI[inn.currentNonStrikerIndex];
  const bowler = inn.availableBowlers[inn.currentBowlerIndex];

  const strikerStat = inn.batsmenStats.get(striker.id);
  const bowlerStat = inn.bowlerStats.get(bowler.id);

  // If choices not passed (AI mode), generate choices
  if (!shotChoice) shotChoice = getAIShotChoice(striker, inn);
  if (!deliveryChoice) deliveryChoice = getAIDeliveryChoice(bowler);

  // Probability resolution
  const outcome = resolveBallOutcome(shotChoice, deliveryChoice, striker, bowler, GameState.pitchCondition);

  sounds.playBatHit();

  let ballText = "";
  let runValue = 0;
  let isWicket = false;

  if (outcome === "W") {
    isWicket = true;
    strikerStat.isOut = true;
    strikerStat.balls++;
    inn.totalWickets++;
    inn.totalBalls++;
    bowlerStat.wickets++;
    bowlerStat.ballsInCurrentOver++;

    // Dismissal type text generator
    const dismissalTypes = ["b", "c & b", "lbw", "c fielder b"];
    const dt = dismissalTypes[Math.floor(Math.random() * dismissalTypes.length)];
    strikerStat.dismissalText = `${dt} ${bowler.name}`;

    sounds.playWicket();
    showEventOverlay("💥 OUT!", "event-wicket");
    ballText = "W";
    inn.overHistory.push("W");

    // Commentary
    addCommentary(inn, `${striker.name} OUT! ${strikerStat.dismissalText} for ${strikerStat.runs} (${strikerStat.balls}b).`);

    // Partnership reset
    inn.partnershipRuns = 0;
    inn.partnershipBalls = 0;

    // Next batsman comes in if available
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
    ballText = "4";
    inn.overHistory.push("4");
    addCommentary(inn, `FOUR! Beautiful shot by ${striker.name} through the field for 4 runs.`);

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
    ballText = "6";
    inn.overHistory.push("6");
    addCommentary(inn, `SIX! MASSIVE HIT! ${striker.name} launches it high over the boundary!`);

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

    ballText = `${runValue}`;
    inn.overHistory.push(`${runValue}`);
    addCommentary(inn, `${striker.name} plays a ${shotChoice} to ${bowler.name} for ${runValue} run(s).`);

    // Swap striker on odd runs
    if (runValue % 2 !== 0) {
      swapStrikers(inn);
    }
  }

  // Check end of over (6 legal deliveries)
  if (inn.totalBalls % 6 === 0) {
    bowlerStat.overs++;
    bowlerStat.ballsInCurrentOver = 0;

    // Check maiden
    // Swap striker at end of over
    swapStrikers(inn);

    // Rotate bowler
    rotateBowler(inn);
    inn.overHistory = [];
    addCommentary(inn, `--- End of Over ${Math.floor(inn.totalBalls / 6)} ---`);
  }

  // Check Innings End / Target reached
  checkInningsStatus();

  updateMatchUI();
}

function resolveBallOutcome(shot, delivery, striker, bowler, pitch) {
  let rand = Math.random() * 100;

  // Skill difference modifier
  const skillDiff = striker.battingSkill - bowler.bowlingSkill;
  let boundaryBoost = Math.max(-10, Math.min(15, skillDiff * 0.3));

  if (pitch === "green" && (delivery === "fast" || delivery === "bouncer")) rand -= 10;
  if (pitch === "dry" && delivery === "spin") rand -= 10;
  if (pitch === "flat") rand += 10;

  rand += boundaryBoost;

  if (shot === "defend") {
    if (rand < 5) return "W";
    if (rand < 70) return 0;
    return 1;
  } else if (shot === "single") {
    if (rand < 8) return "W";
    if (rand < 60) return 1;
    if (rand < 90) return 2;
    return 3;
  } else if (shot === "lofted") {
    if (rand < 20) return "W";
    if (rand < 40) return 1;
    if (rand < 65) return 2;
    if (rand < 88) return 4;
    return 6;
  } else if (shot === "power") {
    if (rand < 30) return "W";
    if (rand < 50) return 0;
    if (rand < 75) return 4;
    return 6;
  } else if (shot === "scoop") {
    if (rand < 35) return "W";
    if (rand < 60) return 4;
    return 6;
  }
  return 1;
}

function getAIShotChoice(striker, inn) {
  const shots = ["defend", "single", "lofted", "power", "scoop"];
  // If high required rate, be aggressive
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
  // Rotate bowler index to next available bowler
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

  // 2nd Innings Target Pass Check
  if (GameState.match.currentInnings === 2) {
    if (inn.totalRuns >= GameState.match.target) {
      endMatch();
      return;
    }
  }

  // Innings Completion Check (10 Wickets or max overs reached)
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

  // Swapped batting and bowling teams
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

  // Calculate Awards
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
// 8. UI UPDATE & SCOREBOARD BINDING
// ==========================================
function updateMatchUI() {
  const inn = getCurrentInnings();
  if (!inn) return;

  // Header info
  document.getElementById("match-batting-flag").innerText = inn.battingTeam.flag;
  document.getElementById("match-batting-name").innerText = inn.battingTeam.name;
  document.getElementById("match-innings-label").innerText = `Innings ${GameState.match.currentInnings}`;

  document.getElementById("match-score-runs").innerText = `${inn.totalRuns} / ${inn.totalWickets}`;
  document.getElementById("match-overs-text").innerText = `${formatOvers(inn.totalBalls)} / ${GameState.match.oversLimit}.0 Overs`;

  // Run Rates
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

  // Striker / Non-Striker details
  const striker = inn.battingXI[inn.currentStrikerIndex];
  const nonStriker = inn.battingXI[inn.currentNonStrikerIndex];
  const strikerStat = inn.batsmenStats.get(striker.id);
  const nonStrikerStat = inn.batsmenStats.get(nonStriker.id);

  document.getElementById("striker-name").innerText = striker.name;
  document.getElementById("striker-stats").innerText = `${strikerStat.runs} (${strikerStat.balls})`;

  document.getElementById("non-striker-name").innerText = nonStriker.name;
  document.getElementById("non-striker-stats").innerText = `${nonStrikerStat.runs} (${nonStrikerStat.balls})`;

  document.getElementById("partnership-runs").innerText = `${inn.partnershipRuns} runs (${inn.partnershipBalls}b)`;

  // Bowler details
  const bowler = inn.availableBowlers[inn.currentBowlerIndex];
  const bowlerStat = inn.bowlerStats.get(bowler.id);
  document.getElementById("bowler-name").innerText = bowler.name;
  document.getElementById("bowler-figures").innerText = `${bowlerStat.overs}.${bowlerStat.ballsInCurrentOver} - ${bowlerStat.runsConceded} - ${bowlerStat.wickets}`;

  // Over History Ticker
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

  // Controls Panel Toggle (Batting vs Bowling controls)
  const batControls = document.getElementById("batting-controls");
  const bowlControls = document.getElementById("bowling-controls");
  const title = document.getElementById("control-panel-title");

  if (inn.isUserBatting) {
    batControls.style.display = "grid";
    bowlControls.style.display = "none";
    title.innerText = "Choose Shot Type (You are Batting):";
  } else {
    batControls.style.display = "none";
    bowlControls.style.display = "grid";
    title.innerText = "Choose Delivery Variation (You are Bowling):";
  }

  // Commentary Update
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

  // Animated Ball movement
  const ball = document.getElementById("animated-ball");
  ball.style.display = "block";
  ball.style.left = "20%";
  ball.style.top = "50%";
  setTimeout(() => {
    ball.style.transition = "all 0.5s ease-out";
    ball.style.left = "80%";
    ball.style.top = `${30 + Math.random() * 40}%`;
  }, 50);

  setTimeout(() => {
    overlay.classList.remove("active");
    ball.style.display = "none";
    ball.style.transition = "none";
  }, 1400);
}

// ==========================================
// 9. SCORECARD MODAL GENERATOR
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
// 10. EVENT BINDINGS & HANDLERS
// ==========================================
function bindEvents() {
  // Navigation Bar
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

  // Home Screen Cards
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

  // Settings Modal
  document.getElementById("btn-close-settings").addEventListener("click", () => {
    document.getElementById("modal-settings").classList.remove("active");
  });
  document.getElementById("btn-save-settings").addEventListener("click", () => {
    GameState.settings.oversLimit = parseInt(document.getElementById("setting-overs").value, 10);
    GameState.settings.difficulty = document.getElementById("setting-difficulty").value;
    document.getElementById("modal-settings").classList.remove("active");
  });

  // Team Selection Proceed
  document.getElementById("btn-proceed-xi").addEventListener("click", () => {
    renderPlayingXIScreen();
    showScreen("screen-playing-xi");
  });

  // Playing XI Screen Buttons
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

  // Toss Screen Call Buttons
  document.getElementById("btn-call-heads").addEventListener("click", () => {
    startTossAnimation("heads");
  });
  document.getElementById("btn-call-tails").addEventListener("click", () => {
    startTossAnimation("tails");
  });

  // Toss Decision Buttons
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

  // Shot Controls (User Batting)
  document.querySelectorAll("[data-shot]").forEach(btn => {
    btn.addEventListener("click", () => {
      const shot = btn.getAttribute("data-shot");
      playBall(shot, null);
    });
  });

  // Delivery Controls (User Bowling)
  document.querySelectorAll("[data-delivery]").forEach(btn => {
    btn.addEventListener("click", () => {
      const delivery = btn.getAttribute("data-delivery");
      playBall(null, delivery);
    });
  });

  // Quick Sim Controls
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

  // Innings Break Screen Button
  document.getElementById("btn-start-innings2").addEventListener("click", () => {
    startSecondInnings();
  });

  // Result Screen Buttons
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
