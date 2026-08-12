/* ======================================================
   PARTY CLASH – MAIN SCRIPT
   Handles: Screens, State, Background, Sound, Players
   ====================================================== */

// ──────────────────────────────────────────────────────
// GLOBAL STATE
// ──────────────────────────────────────────────────────
const State = {
  playerCount: 2,
  players: [],
  currentGame: null,
  scores: {},       // { 'Player 1': 0, ... }
  tournScores: {},  // cumulative
  sfx: true,
  music: false,
  anim: true,
  theme: 'dark',
};

const PLAYER_DEFAULTS = [
  { name: 'Player 1', color: '#ff4d6d', cls: 'p1', emoji: '🔴', icon: '😎', symbol: '✕' },
  { name: 'Player 2', color: '#4db8ff', cls: 'p2', emoji: '🔵', icon: '🤩', symbol: '◯' },
  { name: 'Player 3', color: '#4dff91', cls: 'p3', emoji: '🟢', icon: '😈', symbol: '△' },
  { name: 'Player 4', color: '#ffd44d', cls: 'p4', emoji: '🟡', icon: '🤖', symbol: '□' },
];

const GAMES = [
  // ── ORIGINALS ──────────────────────────────────────────
  { id: 'ttt', name: 'Tic-Tac-Toe', icon: '❌⭕', minP: 2, maxP: 4, badge: 'hot', badgeText: 'HOT', fn: () => startTTT() },
  { id: 'wam', name: 'Whack-a-Mole', icon: '🐹', minP: 1, maxP: 4, badge: '', badgeText: '', fn: () => startWAM() },
  { id: 'mem', name: 'Memory', icon: '🧠', minP: 1, maxP: 4, badge: '', badgeText: '', fn: () => startMem() },
  { id: 'snake', name: 'Snakes', icon: '🐍', minP: 1, maxP: 2, badge: '', badgeText: '', fn: () => startSnake() },
  { id: 'archery', name: 'Archery', icon: '🏹', minP: 1, maxP: 4, badge: '', badgeText: '', fn: () => startArchery() },
  { id: 'math', name: 'Maths', icon: '➗', minP: 1, maxP: 4, badge: '', badgeText: '', fn: () => startMath() },
  { id: 'tug', name: 'Tug of War', icon: '🤼', minP: 2, maxP: 4, badge: '', badgeText: '', fn: () => startTug() },
  // ── REACTION ────────────────────────────────────────────
  { id: 'reaction', name: 'Reaction Test', icon: '⚡', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startReaction() },
  { id: 'stopclock', name: 'Stop the Clock', icon: '⏱️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startStopClock() },
  { id: 'quickdraw', name: 'Quick Draw', icon: '🎯', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startQuickDraw() },
  { id: 'bomb', name: 'Bomb Defuse', icon: '💣', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBomb() },
  // ── CARDS ───────────────────────────────────────────────
  { id: 'highlow', name: 'Higher or Lower', icon: '🃏', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startHigherLower() },
  { id: 'dice', name: 'Dice Duel', icon: '🎲', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startDice() },
  { id: 'rps', name: 'Rock Paper Scissors', icon: '🪨', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startRPS() },
  { id: 'slots', name: 'Slot Machine', icon: '🎰', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSlots() },
  { id: 'cardwar', name: 'Card War', icon: '⚔️', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startCardWar() },
  // ── SPORTS ──────────────────────────────────────────────
  { id: 'pong', name: 'Ping Pong', icon: '🏓', minP: 1, maxP: 2, badge: 'new', badgeText: 'NEW', fn: () => startPong() },
  { id: 'basketball', name: 'Basketball', icon: '🏀', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBasketball() },
  { id: 'bowling', name: 'Bowling', icon: '🎳', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBowling() },
  { id: 'penalty', name: 'Penalty Kick', icon: '⚽', minP: 2, maxP: 2, badge: 'new', badgeText: 'NEW', fn: () => startPenalty() },
  { id: 'minigolf', name: 'Mini Golf', icon: '⛳', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startMiniGolf() },
  // ── ARCADE ──────────────────────────────────────────────
  { id: 'flappy', name: 'Flappy Bird', icon: '🐦', minP: 1, maxP: 2, badge: 'new', badgeText: 'NEW', fn: () => startFlappy() },
  { id: 'numrush', name: 'Number Rush', icon: '🔢', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startNumRush() },
  { id: 'bubble', name: 'Bubble Pop', icon: '🔵', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBubble() },
  { id: 'racing', name: 'Racing Cars', icon: '🏎️', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startRacing() },
  { id: 'gravjump', name: 'Gravity Jump', icon: '🌙', minP: 1, maxP: 2, badge: 'new', badgeText: 'NEW', fn: () => startGravJump() },
  // ── WORDS ───────────────────────────────────────────────
  { id: 'scramble', name: 'Word Scramble', icon: '🔤', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startScramble() },
  { id: 'typerace', name: 'Typing Race', icon: '⌨️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startTypeRace() },
  { id: 'findemoji', name: 'Find the Emoji', icon: '🔍', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startFindEmoji() },
  { id: 'colormatch', name: 'Color Match', icon: '🎨', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startColorMatch() },
  // ── MUSIC ───────────────────────────────────────────────
  { id: 'simon', name: 'Simon Says', icon: '🎵', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSimon() },
  { id: 'noter', name: 'Note Rush', icon: '🎸', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startNoter() },
  // ── BOARD ───────────────────────────────────────────────
  { id: 'snakeladder', name: 'Snakes & Ladders', icon: '🐍🪜', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSnakeLadder() },
  { id: 'spinwheel', name: 'Spin the Wheel', icon: '🌀', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSpinWheel() },
  { id: 'slidepuzz', name: 'Slide Puzzle', icon: '🧩', minP: 1, maxP: 1, badge: 'new', badgeText: 'NEW', fn: () => startSlidePuzz() },
  // ── BATTLE ──────────────────────────────────────────────
  { id: 'swordduel', name: 'Sword Duel', icon: '⚔️', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSwordDuel() },
  { id: 'boxing', name: 'Boxing', icon: '🥊', minP: 2, maxP: 2, badge: 'new', badgeText: 'NEW', fn: () => startBoxing() },
  { id: 'weightlift', name: 'Weight Lifting', icon: '🏋️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startWeightLift() },
  { id: 'paintfight', name: 'Paint Fight', icon: '🎨', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startPaintFight() },
  { id: 'fireworks', name: 'Fireworks', icon: '🎆', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startFireworks() },
  // ── PARTY ───────────────────────────────────────────────
  { id: 'impostor', name: 'Impostor', icon: '🕵️', minP: 3, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startImpostor() },
  { id: 'charades', name: 'Charades', icon: '🎭', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startCharades() },
  { id: 'spinbottle', name: 'Spin Bottle', icon: '🍾', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSpinBottle() },
  // ── MISC ────────────────────────────────────────────────
  { id: 'iceblock', name: 'Ice Block', icon: '❄️', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startIceBlock() },
  { id: 'rocket', name: 'Rocket Launch', icon: '🚀', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startRocket() },
  { id: 'magnet', name: 'Magnet Match', icon: '🧲', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startMagnet() },
  { id: 'circus', name: 'Circus Catch', icon: '🤹', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startCircus() },
  { id: 'hopscotch', name: 'Hop Scotch', icon: '🦘', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startHopscotch() },
  { id: 'darts', name: 'Darts', icon: '📍', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startDarts() },
  { id: 'solitaire', name: 'Solitaire', icon: '🂠', minP: 1, maxP: 1, badge: 'new', badgeText: 'NEW', fn: () => startSolitaire() },
  // ── PUZZLE ──────────────────────────────────────────────
  { id: 'mathdash', name: 'Math Dash', icon: '➗', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startMathDash() },
  { id: 'memmatrix', name: 'Memory Matrix', icon: '🔲', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startMemMatrix() },
  { id: 'oddoneout', name: 'Odd One Out', icon: '👁️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startOddOneOut() },
  { id: 'anagram', name: 'Anagram Hunt', icon: '🔤', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startAnagram() },
  { id: 'sudoku', name: 'Mini Sudoku', icon: '🔢', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startMiniSudoku() },
  { id: 'shapefit', name: 'Shape Matcher', icon: '📐', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startShapeFit() },
  { id: 'sequence', name: 'Number Sequence', icon: '🔢', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSequence() },
  { id: 'colorblind', name: 'Color Matrix Test', icon: '👁️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startColorBlind() },
  { id: 'blackjack', name: 'Blackjack 21', icon: '🃏', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBlackjack() },
  { id: 'domino', name: 'Domino Match', icon: '🀩', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startDomino() },
  { id: 'connect4', name: 'Connect Four', icon: '🔴', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startConnect4() },
  { id: 'boggle', name: 'Word Boggle', icon: '🔤', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBoggle() },
  // ── RETRO ───────────────────────────────────────────────
  { id: 'pacrun', name: 'Pac-Runner', icon: '🟡', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startPacRun() },
  { id: 'spaceinvader', name: 'Space Defender', icon: '👾', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSpaceInvader() },
  { id: 'breakout', name: 'Brick Breaker', icon: '🧱', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBreakout() },
  { id: 'asteroids', name: 'Asteroid Dodge', icon: '☄️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startAsteroids() },
  { id: 'stacker', name: 'Block Stacker', icon: '🏢', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startStacker() },
  { id: 'frogger', name: 'Street Hopper', icon: '🐸', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startStreetHopper() },
  { id: 'pinball', name: 'Mini Pinball', icon: '🎰', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startPinball() },
  { id: 'dinojump', name: 'Dino Runner', icon: '🦖', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startDinoJump() },
  { id: 'mazeescape', name: 'Maze Escape', icon: '🌀', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startMazeEscape() },
  { id: 'retrosnake2', name: 'Retro Snake 2', icon: '🐍', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startRetroSnake2() },
  { id: 'tankbattle', name: 'Tank Battle', icon: '🚀', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startTankBattle() },
  { id: 'pixelracer', name: 'Pixel Racer', icon: '🏎️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startPixelRacer() },
  // ── ACTION ──────────────────────────────────────────────
  { id: 'ninja', name: 'Ninja Slice', icon: '🥷', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startNinjaSlice() },
  { id: 'whackalien', name: 'Whack An Alien', icon: '🛸', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startWhackAlien() },
  { id: 'duckhunt', name: 'Duck Hunt', icon: '🦆', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startDuckHunt() },
  { id: 'hammer', name: 'Hammer Time', icon: '🔨', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startHammer() },
  { id: 'dodgeball', name: 'Dodgeball Arena', icon: '🤾', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startDodgeball() },
  { id: 'lasergrid', name: 'Laser Dodge', icon: '⚡', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startLaserGrid() },
  { id: 'volcano', name: 'Lava Escape', icon: '🌋', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startLavaEscape() },
  { id: 'tictactoe4', name: 'Tic-Tac-Toe 4x4', icon: '❌', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startTTT4() },
  { id: 'tennis', name: 'Tennis Rally', icon: '🎾', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startTennis() },
  { id: 'hurdles', name: '100m Hurdles', icon: '🏃', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startHurdles() },
  { id: 'sumo', name: 'Sumo Push', icon: '🤼', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSumoPush() },
  { id: 'hockey', name: 'Air Hockey', icon: '🏒', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startAirHockey() },
  { id: 'billiards', name: '8-Ball Cue', icon: '🎱', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBilliards() },
  // ── MORE PARTY ──────────────────────────────────────────
  { id: 'hotpotato', name: 'Hot Potato', icon: '🥔', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startHotPotato() },
  { id: 'simonsays2', name: 'Commander Says', icon: '👮', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startCommander() },
  { id: 'musicalchairs', name: 'Musical Chairs', icon: '🪑', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startMusicalChairs() },
  { id: 'donkeytail', name: 'Pin The Tail', icon: '🐴', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startPinTail() },
  { id: 'balancetower', name: 'Jenga Tower', icon: '🧱', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startJenga() },
  { id: 'balloonpop', name: 'Balloon Pump', icon: '🎈', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBalloonPop() },
  { id: 'coinflip', name: 'Coin Streak', icon: '🪙', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startCoinFlip() },
  { id: 'fortune', name: 'Fortune Cookie', icon: '🥠', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startFortune() },
  { id: 'trivia', name: 'Party Quiz', icon: '❓', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startTrivia() },
  { id: 'boxingpower', name: 'Power Punch', icon: '🥊', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startPowerPunch() },
  { id: 'battleship', name: 'Sea Battle', icon: '🚢', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSeaBattle() },
  { id: 'skating', name: 'Skate Ramp', icon: '🛹', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSkating() },
  { id: 'finalclash', name: 'The Ultimate Clash', icon: '🏆', minP: 1, maxP: 4, badge: 'hot', badgeText: 'HOT', fn: () => startFinalClash() },

  // ── STRATEGY & BRAIN (Games 101-125) ────────────────────
  { id: 'chesstactic', name: 'Chess Tactics', icon: '♟️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startChessTactic() },
  { id: 'colorflood', name: 'Color Flood', icon: '🌊', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startColorFlood() },
  { id: 'pipemaze', name: 'Pipe Plumber', icon: '🔧', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startPipeMaze() },
  { id: 'lightup', name: 'Lights Out', icon: '💡', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startLightsOut() },
  { id: 'towerofhanoi', name: 'Tower of Hanoi', icon: '🗼', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startHanoi() },
  { id: 'nonogram', name: 'Mini Nonogram', icon: '🧩', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startNonogram() },
  { id: 'patternlock', name: 'Pattern Unlock', icon: '🔒', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startPatternLock() },
  { id: 'calcace', name: 'Calc Master', icon: '🧮', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startCalcAce() },
  { id: 'wordchain', name: 'Word Chain', icon: '🔗', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startWordChain() },
  { id: 'memorycards2', name: 'Card Pair Blitz', icon: '🃏', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startCardPairBlitz() },
  { id: 'weightbalance', name: 'Scale Balance', icon: '⚖️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startScaleBalance() },
  { id: 'numbergrid', name: 'Merge 2048', icon: '🔢', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startMerge2048() },
  { id: 'symbolspin', name: 'Symbol Alignment', icon: '🎰', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSymbolAlign() },
  { id: 'logicpath', name: 'Logic Circuit', icon: '⚡', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startLogicCircuit() },
  { id: 'codecracker', name: 'Code Cracker', icon: '🔐', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startCodeCracker() },
  { id: 'shadowmatch', name: 'Shadow Silhouette', icon: '👥', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startShadowMatch() },
  { id: 'speedmath', name: 'Speed Multiply', icon: '✖️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSpeedMultiply() },
  { id: 'wordladder', name: 'Word Ladder', icon: '🪜', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startWordLadder() },
  { id: 'blockfit', name: 'Block Fit 1010', icon: '🔲', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBlockFit() },
  { id: 'crossword', name: 'Mini Crossword', icon: '📝', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startMiniCrossword() },
  { id: 'shapefold', name: 'Shape Folding', icon: '📄', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startShapeFold() },
  { id: 'colorblind2', name: 'Hue Sort', icon: '🎨', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startHueSort() },
  { id: 'numberjump', name: 'Number Hop Grid', icon: '🦘', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startNumberHop() },
  { id: 'dicebuilder', name: 'Dice Builder', icon: '🎲', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startDiceBuilder() },
  { id: 'brainoverload', name: 'Dual Task Brain', icon: '🤯', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startDualTask() },

  // ── ARCADE BLAST (Games 126-150) ────────────────────────
  { id: 'galaxian', name: 'Galactic Defender', icon: '🛸', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startGalacticDef() },
  { id: 'centipede', name: 'Insect Crawler', icon: '🐛', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startInsectCrawler() },
  { id: 'tronlight', name: 'Light Cycle Race', icon: '🏍️', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startLightCycle() },
  { id: 'lunarlander', name: 'Lunar Lander', icon: '🚀', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startLunarLander() },
  { id: 'paperboy', name: 'Paper Express', icon: '📰', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startPaperExpress() },
  { id: 'marblemadness', name: 'Marble Run', icon: '🔮', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startMarbleRun() },
  { id: 'roadfighter', name: 'Highway Racer', icon: '🏎️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startHighwayRacer() },
  { id: 'bomberman', name: 'Bomb Grid Blitz', icon: '💣', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBombGrid() },
  { id: 'contra', name: 'Commando Run', icon: '🎖️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startCommandoRun() },
  { id: 'tempest', name: 'Vortex Shooter', icon: '🌀', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startVortexShooter() },
  { id: 'rallyx', name: 'Radar Racer', icon: '🏁', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startRadarRacer() },
  { id: 'digdug', name: 'Tunnel Digger', icon: '⛏️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startTunnelDigger() },
  { id: 'xevious', name: 'Zevion Fighter', icon: '✈️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startZevionFighter() },
  { id: 'bubblebobble', name: 'Bubble Dragon', icon: '🐲', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBubbleDragon() },
  { id: 'spyhunter', name: 'Spy Car', icon: '🚘', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSpyCar() },
  { id: 'zaxxon', name: 'Isometric Flyer', icon: '📐', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startIsometricFlyer() },
  { id: 'outrun', name: 'Coast Cruise', icon: '🏎️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startCoastCruise() },
  { id: 'choplifter', name: 'Helicopter Rescue', icon: '🚁', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startHeliRescue() },
  { id: 'excitebike', name: 'Motocross Jump', icon: '🏍️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startMotocrossJump() },
  { id: 'trackfield', name: 'Track Dash', icon: '🏃', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startTrackDash() },
  { id: 'gauntlet', name: 'Dungeon Crawler', icon: '🏰', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startDungeonCrawler() },
  { id: 'kungfumaster', name: 'Kung Fu Kick', icon: '🥋', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startKungFuKick() },
  { id: 'shinobi', name: 'Ninja Star Shoot', icon: '🥷', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startNinjaStar() },
  { id: 'metalSlug', name: 'Tank Slug', icon: '💥', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startTankSlug() },
  { id: 'superpro', name: 'Pro Skater 2D', icon: '🛹', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startProSkater2D() },

  // ── SPORTS & PHYSICS (Games 151-175) ────────────────────
  { id: 'archerywind', name: 'Crosswind Archery', icon: '🏹', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startCrosswindArchery() },
  { id: 'volleyball', name: 'Beach Volleyball', icon: '🏐', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBeachVolley() },
  { id: 'curling', name: 'Ice Curling', icon: '🥌', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startIceCurling() },
  { id: 'rugby', name: 'Rugby Conversion', icon: '🏉', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startRugbyKick() },
  { id: 'skiing', name: 'Slalom Skiing', icon: '⛷️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSlalomSkiing() },
  { id: 'cricket', name: 'Sixer Hit', icon: '🏏', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startCricketHit() },
  { id: 'kayak', name: 'Rapid Kayak', icon: '🚣', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startRapidKayak() },
  { id: 'baseball', name: 'Home Run Derby', icon: '⚾', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startHomeRunDerby() },
  { id: 'darts501', name: '501 Darts Countdown', icon: '🎯', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startDarts501() },
  { id: 'golfputting', name: 'Precision Putting', icon: '⛳', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startPrecisionPutting() },
  { id: 'tabletennis', name: 'Spin Ping Pong', icon: '🏓', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSpinPingPong() },
  { id: 'frisbee', name: 'Frisbee Toss', icon: '🥏', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startFrisbeeToss() },
  { id: 'boxingknockout', name: 'Combo Boxing', icon: '🥊', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startComboBoxing() },
  { id: 'bmxstunt', name: 'BMX Flip', icon: '🚲', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBMXFlip() },
  { id: 'skydiving', name: 'Parachute Drop', icon: '🪂', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startParachuteDrop() },
  { id: 'climbing', name: 'Rock Climb', icon: '🧗', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startRockClimb() },
  { id: 'bobsled', name: 'Bobsled Drift', icon: '🛷', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBobsledDrift() },
  { id: 'snowboard', name: 'Halfpipe Trick', icon: '🏂', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startHalfpipeTrick() },
  { id: 'fencing', name: 'Fencing Parry', icon: '🤺', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startFencingParry() },
  { id: 'badminton', name: 'Smash Badminton', icon: '🏸', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSmashBadminton() },
  { id: 'slapshot', name: 'Ice Hockey Slap', icon: '🏒', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startIceHockeySlap() },
  { id: 'waterpolo', name: 'Water Polo Throw', icon: '🤽', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startWaterPolo() },
  { id: 'sumo2', name: 'Ring Domination', icon: '🤼', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startRingDomination() },
  { id: 'powerlift', name: 'Deadlift Challenge', icon: '🏋️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startDeadlift() },
  { id: 'bowlingstrike', name: 'Strike Bowling 10', icon: '🎳', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startStrikeBowling10() },

  // ── PARTY & SHOWDOWN (Games 176-200) ────────────────────
  { id: 'partyroulette', name: 'Party Roulette', icon: '🎰', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startPartyRoulette() },
  { id: 'quickdraw2', name: 'Showdown Duel', icon: '🤠', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startShowdownDuel() },
  { id: 'truthordare', name: 'Truth or Dare', icon: '❓', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startTruthOrDare() },
  { id: 'sayword', name: 'Fast Category Word', icon: '🗣️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startCategoryWord() },
  { id: 'emojiquiz', name: 'Emoji Movie Quiz', icon: '🎬', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startEmojiMovieQuiz() },
  { id: 'guesswho', name: 'Face Guess', icon: '👤', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startFaceGuess() },
  { id: 'blindfolddraw', name: 'Blind Canvas', icon: '🎨', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBlindCanvas() },
  { id: 'soundquiz', name: 'Sound Effect Quiz', icon: '🔊', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSoundEffectQuiz() },
  { id: 'fasthands', name: 'Slap Card', icon: '🖐️', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSlapCard() },
  { id: 'riddles', name: 'Riddle Solver', icon: '🧩', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startRiddleSolver() },
  { id: 'balanceball', name: 'Tilt Balance', icon: '🎯', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startTiltBalance() },
  { id: 'pirateduel', name: 'Pirate Ship Duel', icon: '🏴‍☠️', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startPirateDuel() },
  { id: 'cookieclicker', name: 'Cookie Mash', icon: '🍪', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startCookieMash() },
  { id: 'piñata', name: 'Piñata Smash', icon: '🪅', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startPinataSmash() },
  { id: 'whackmole2', name: 'Golden Mole Rampage', icon: '🐹', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startGoldenMole() },
  { id: 'cardmatch2', name: 'Memory Card Royale', icon: '🃏', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startCardRoyale() },
  { id: 'spinfavor', name: 'Spin Fortune Wheel', icon: '🎡', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSpinFortuneWheel() },
  { id: 'typingblitz', name: '60-Second Typing', icon: '⌨️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startTyping60() },
  { id: 'battleship2', name: 'Fleet Destroyer', icon: '🚢', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startFleetDestroyer() },
  { id: 'partybingo', name: 'Party Bingo', icon: '🔢', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startPartyBingo() },
  { id: 'lasergun', name: 'Laser Tag', icon: '🔫', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startLaserTag() },
  { id: 'highstriker', name: 'Ring The Bell', icon: '🔨', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startRingTheBell() },
  { id: 'alienblast', name: 'UFO Invaders 2', icon: '👾', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startUFOInvaders2() },
  { id: 'megamath', name: 'Mega Math Challenge', icon: '🧮', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startMegaMath() },
  { id: 'grandchampionship', name: 'Grand Champion 200', icon: '🏆', minP: 1, maxP: 4, badge: 'hot', badgeText: 'HOT', fn: () => startGrandChampion() },

  // ── BRAIN & LOGIC 300 (Games 201-225) ────────────────────
  { id: 'sudokuextreme', name: 'Sudoku Extreme', icon: '🔢', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSudokuExtreme() },
  { id: 'binarypuzzle', name: 'Binary Matrix', icon: '🔳', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBinaryMatrix() },
  { id: 'kakuro', name: 'Kakuro Sums', icon: '🧮', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startKakuro() },
  { id: 'mathpyramid', name: 'Math Pyramid', icon: '🔺', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startMathPyramid() },
  { id: 'bridgespuzz', name: 'Bridges & Islands', icon: '🌉', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBridges() },
  { id: 'slidingtiles', name: '15-Tile Slider', icon: '🧩', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startTileSlider15() },
  { id: 'waterpour', name: 'Water Pouring Riddle', icon: '🧪', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startWaterPour() },
  { id: 'geometrix', name: 'Geometry Angle Quiz', icon: '📐', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startGeometryQuiz() },
  { id: 'wordwheel', name: 'Word Wheel 8-Letter', icon: '🎡', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startWordWheel() },
  { id: 'cryptogram', name: 'Cryptogram Cipher', icon: '🔐', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startCryptogram() },
  { id: 'slitherlink', name: 'Slither Loop', icon: '➰', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSlitherLoop() },
  { id: 'mathcross', name: 'Math Crossword', icon: '➕', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startMathCrossword() },
  { id: 'patterns3d', name: '3D Cube Folding', icon: '🧊', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startCubeFolding() },
  { id: 'colormixing', name: 'Color Mixing Lab', icon: '🧪', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startColorMixing() },
  { id: 'memorymatrix2', name: 'Memory Matrix 5x5', icon: '🔲', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startMemMatrix5x5() },
  { id: 'dominochain', name: 'Domino Chain Reaction', icon: '🀩', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startDominoChain() },
  { id: 'logicgrid', name: 'Logic Detective Clues', icon: '🕵️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startLogicDetective() },
  { id: 'numberline', name: 'Number Line Blitz', icon: '📈', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startNumberLineBlitz() },
  { id: 'wordsearches', name: 'Word Search 6x6', icon: '🔍', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startWordSearch6x6() },
  { id: 'scalebalance2', name: 'Triple Scale Balance', icon: '⚖️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startTripleScale() },
  { id: 'chessknight', name: 'Knight Tour Hop', icon: '♞', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startKnightTour() },
  { id: 'sudoku4x4', name: '4x4 Speed Sudoku', icon: '⏱️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSpeedSudoku4x4() },
  { id: 'shapematch2', name: 'Symmetry Matcher', icon: '🦋', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSymmetryMatch() },
  { id: 'calcace2', name: 'Equations Master', icon: '➗', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startEquationsMaster() },
  { id: 'brainblitz300', name: 'Brain Overload 300', icon: '🤯', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBrainOverload300() },

  // ── ARCADE BLAST 300 (Games 226-250) ────────────────────
  { id: 'pacrun2', name: 'Pac-Mania Deluxe', icon: '🟡', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startPacMania() },
  { id: 'spaceinvader2', name: 'Galaga Assault', icon: '👾', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startGalagaAssault() },
  { id: 'asteroids2', name: 'Hyperspace Asteroids', icon: '☄️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startHyperspaceAst() },
  { id: 'pinball2', name: 'Cyber Pinball FX', icon: '🎰', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startCyberPinball() },
  { id: 'breakout2', name: 'Neon Brick Breaker', icon: '🧱', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startNeonBreakout() },
  { id: 'dinojump2', name: 'T-Rex Desert Runner', icon: '🦖', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startTRexRunner() },
  { id: 'stacker2', name: 'Skyscraper Stacker', icon: '🏢', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSkyStacker() },
  { id: 'frogger2', name: 'River Crossing Frog', icon: '🐸', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startRiverFrog() },
  { id: 'retrosnake3', name: 'Snake 3D Arcade', icon: '🐍', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSnake3DArcade() },
  { id: 'pixelracer2', name: 'Turbo Rally 80s', icon: '🏎️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startTurboRally80s() },
  { id: 'tankbattle2', name: 'Panzer Blitz 2D', icon: '💥', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startPanzerBlitz() },
  { id: 'bomberman2', name: 'Super Bomb Arena', icon: '💣', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSuperBombArena() },
  { id: 'contra2', name: 'Jungle Commando', icon: '🎖️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startJungleCommando() },
  { id: 'kungfumaster2', name: 'Dragon Kick Fighter', icon: '🥋', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startDragonKick() },
  { id: 'metalSlug2', name: 'Tank Assault Slug', icon: '💥', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startTankAssaultSlug() },
  { id: 'gauntlet2', name: 'Wizard Dungeon 2D', icon: '🏰', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startWizardDungeon() },
  { id: 'spyhunter2', name: 'Spy Speedboat', icon: '🚤', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSpySpeedboat() },
  { id: 'paperboy2', name: 'Bike Delivery Rush', icon: '🚲', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBikeDelivery() },
  { id: 'lunarlander2', name: 'Apollo Moon Landing', icon: '🚀', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startApolloLanding() },
  { id: 'excitebike2', name: 'Super BMX Track', icon: '🏍️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSuperBMXTrack() },
  { id: 'bubblebobble2', name: 'Bubble Bust Monster', icon: '🐲', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBubbleBust() },
  { id: 'shinobi2', name: 'Shuriken Storm', icon: '🥷', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startShurikenStorm() },
  { id: 'outrun2', name: 'Ferrari Outrun', icon: '🏎️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startFerrariOutrun() },
  { id: 'tempest2', name: 'Neon Vector Tunnel', icon: '🌀', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startNeonVector() },
  { id: 'superpro2', name: 'Skate Park 300', icon: '🛹', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSkatePark300() },

  // ── SPORTS & PHYSICS 300 (Games 251-275) ─────────────────
  { id: 'soccershootout', name: 'Penalty Shootout Pro', icon: '⚽', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startShootoutPro() },
  { id: 'basketball3pt', name: '3-Point Contest', icon: '🏀', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startThreePointContest() },
  { id: 'bowlingpro', name: 'Bowling Strike 300', icon: '🎳', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBowlingStrike300() },
  { id: 'tennispro', name: 'Grand Slam Tennis', icon: '🎾', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startGrandSlamTennis() },
  { id: 'golfpro', name: 'Hole-In-One Golf', icon: '⛳', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startHoleInOneGolf() },
  { id: 'baseballpro', name: 'Baseball Pitching Target', icon: '⚾', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startPitchingTarget() },
  { id: 'archerypro', name: 'Bullseye Archery', icon: '🏹', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBullseyeArchery() },
  { id: 'boxingpro', name: 'Knockout Boxing', icon: '🥊', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startKnockoutBoxing() },
  { id: 'cricketpro', name: 'T20 Cricket Hit', icon: '🏏', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startT20Cricket() },
  { id: 'rugbypro', name: 'Rugby Tackle', icon: '🏉', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startRugbyTackle() },
  { id: 'volleyballpro', name: 'Volleyball Spike Pro', icon: '🏐', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSpikePro() },
  { id: 'skiingpro', name: 'Alpine Downhill Ski', icon: '⛷️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startAlpineSki() },
  { id: 'kayakpro', name: 'Kayak Slalom', icon: '🚣', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startKayakSlalom() },
  { id: 'curlingpro', name: 'Curling Center Sweep', icon: '🥌', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startCurlingCenter() },
  { id: 'icehockeypro', name: 'Ice Hockey Penalty', icon: '🏒', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startHockeyPenalty() },
  { id: 'dartspro', name: 'Darts Bullseye 501', icon: '🎯', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startDartsBullseye501() },
  { id: 'frisbeepro', name: 'Disc Golf Toss', icon: '🥏', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startDiscGolfToss() },
  { id: 'bmxpro', name: 'BMX Mega Ramp', icon: '🚲', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBMXMegaRamp() },
  { id: 'skydivingpro', name: 'Skydiving Target Drop', icon: '🪂', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSkydivingTarget() },
  { id: 'rockclimbpro', name: 'Speed Rock Climb', icon: '🧗', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSpeedRockClimb() },
  { id: 'badmintonpro', name: 'Badminton Drop Shot', icon: '🏸', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startDropShotBadminton() },
  { id: 'fencingpro', name: 'Fencing Toucher', icon: '🤺', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startFencingToucher() },
  { id: 'sumopro', name: 'Sumo Pushout Max', icon: '🤼', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSumoPushoutMax() },
  { id: 'waterpolopro', name: 'Water Polo Goal Shoot', icon: '🤽', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startWaterPoloGoal() },
  { id: 'powerliftpro', name: 'Bench Press Max', icon: '🏋️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBenchPressMax() },

  // ── PARTY & SHOWDOWN 300 (Games 276-300) ────────────────
  { id: 'partyroulette2', name: 'Jackpot Party Wheel', icon: '🎰', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startJackpotPartyWheel() },
  { id: 'quickdraw300', name: 'Outlaw Quick Draw', icon: '🤠', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startOutlawQuickDraw() },
  { id: 'truthordare2', name: 'Extreme Truth or Dare', icon: '❓', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startExtremeTruthOrDare() },
  { id: 'sayword2', name: 'Category Word Blitz', icon: '🗣️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startCategoryWordBlitz() },
  { id: 'emojiquiz2', name: 'Emoji Song Quiz', icon: '🎵', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startEmojiSongQuiz() },
  { id: 'guesswho2', name: 'Celebrity Guess', icon: '👤', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startCelebrityGuess() },
  { id: 'blindfolddraw2', name: 'Pictionary Draw', icon: '🎨', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startPictionaryDraw() },
  { id: 'soundquiz2', name: 'Instrument Sound Quiz', icon: '🎻', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startInstrumentQuiz() },
  { id: 'fasthands2', name: 'Red Light Green Light', icon: '🚦', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startRedLightGreenLight() },
  { id: 'riddles2', name: 'Genius Riddles', icon: '🧠', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startGeniusRiddles() },
  { id: 'balanceball2', name: '3D Marble Balance', icon: '🔮', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startMarbleBalance3D() },
  { id: 'pirateduel2', name: 'Pirate Treasure Hunt', icon: '🏴‍☠️', minP: 2, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startPirateTreasure() },
  { id: 'cookieclicker2', name: 'Cookie Factory Clicker', icon: '🍪', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startCookieFactory() },
  { id: 'piñataparty', name: 'Party Piñata Explosion', icon: '🪅', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startPinataExplosion() },
  { id: 'whackmole3', name: 'Whack-A-Ghost', icon: '👻', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startWhackAGhost() },
  { id: 'cardmatch3', name: 'Casino Memory Pairs', icon: '🎰', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startCasinoMemory() },
  { id: 'spinfavor2', name: 'Lucky Mega Spin', icon: '🎡', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startLuckyMegaSpin() },
  { id: 'typingblitz2', name: 'Speed Typer 300', icon: '⌨️', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSpeedTyper300() },
  { id: 'battleship3', name: 'Submarine Hunter', icon: '🚢', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSubmarineHunter() },
  { id: 'partybingo2', name: 'Bingo Royale', icon: '🔢', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startBingoRoyale() },
  { id: 'lasergun2', name: 'Laser Maze Run', icon: '🔫', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startLaserMazeRun() },
  { id: 'highstriker2', name: 'Strongman Hammer', icon: '🔨', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startStrongmanHammer() },
  { id: 'alienblast2', name: 'Space Invader Boss', icon: '👾', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startSpaceInvaderBoss() },
  { id: 'megamath2', name: 'Math Super Brain', icon: '🧮', minP: 1, maxP: 4, badge: 'new', badgeText: 'NEW', fn: () => startMathSuperBrain() },
  { id: 'grandchampion300', name: 'Grand Champion 300', icon: '🏆', minP: 1, maxP: 4, badge: 'hot', badgeText: 'HOT', fn: () => startGrandChampion300() },
];

// ──────────────────────────────────────────────────────
// SCREEN MANAGEMENT
// ──────────────────────────────────────────────────────
function showScreen(id) {
  stopAllGames();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  if (id === 'screen-tournament') renderTournament();
  if (id === 'screen-games') {
    if (State.originalPlayers && State.originalPlayers.length > 0) {
      State.players = State.originalPlayers.map(p => ({ ...p }));
      State.playerCount = State.players.length;
    }
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    const container = document.getElementById('game-grid-container');
    if (container) container.scrollTop = 0;
  }
}

// ──────────────────────────────────────────────────────
// UNIVERSAL SHELL SETUP (used by games)
// ──────────────────────────────────────────────────────
function shellSetup(title, { useCanvas = false, cw = 400, ch = 320 } = {}) {
  document.getElementById('shell-title').textContent = title;
  document.getElementById('shell-main').innerHTML = '';
  document.getElementById('shell-footer').innerHTML = '';
  document.getElementById('shell-status').innerHTML = '';
  document.getElementById('shell-scores').innerHTML = '';
  const cv = document.getElementById('shell-canvas');
  if (useCanvas) {
    cv.width = cw;
    cv.height = ch;
    cv.style.display = 'block';
  } else {
    cv.style.display = 'none';
  }
  showScreen('screen-shell');
}

function shellCanvas() { return document.getElementById('shell-canvas'); }
function shellCtx() { return shellCanvas().getContext('2d'); }
function shellMain() { return document.getElementById('shell-main'); }
function shellStatus() { return document.getElementById('shell-status'); }
function shellFooter() { return document.getElementById('shell-footer'); }
function shellScores() { return document.getElementById('shell-scores'); }

// ──────────────────────────────────────────────────────
// UNIVERSAL TOUCH CONTROLLER HELPERS
// ──────────────────────────────────────────────────────
function renderVirtualDPad(container, onDirection, onAction, actionLabel = 'ACTION') {
  const parent = typeof container === 'string' ? document.getElementById(container) : container;
  if (!parent) return;

  const existing = parent.querySelector('.virtual-touch-pad');
  if (existing) existing.remove();

  const dpad = document.createElement('div');
  dpad.className = 'virtual-touch-pad';
  dpad.innerHTML = `
    <div class="touch-dpad-row">
      <div class="touch-dpad-grid">
        <button class="touch-dir-btn touch-dir-up" data-dir="up">▲</button>
        <button class="touch-dir-btn touch-dir-left" data-dir="left">◀</button>
        <button class="touch-dir-btn touch-dir-right" data-dir="right">▶</button>
        <button class="touch-dir-btn touch-dir-down" data-dir="down">▼</button>
      </div>
      ${onAction ? `<button class="touch-act-btn" id="touch-act-main">${actionLabel}</button>` : ''}
    </div>
  `;

  dpad.querySelectorAll('.touch-dir-btn').forEach(btn => {
    const dir = btn.dataset.dir;
    const trigger = (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.add('active-touch');
      if (typeof onDirection === 'function') onDirection(dir);
      setTimeout(() => btn.classList.remove('active-touch'), 150);
    };
    btn.addEventListener('pointerdown', trigger);
  });

  if (onAction) {
    const actBtn = dpad.querySelector('#touch-act-main');
    if (actBtn) {
      actBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        actBtn.classList.add('active-touch');
        if (typeof onAction === 'function') onAction();
        setTimeout(() => actBtn.classList.remove('active-touch'), 150);
      });
    }
  }

  parent.appendChild(dpad);
}

function renderMultiplayerTouchBar(container, count, onPlayerTap) {
  const parent = typeof container === 'string' ? document.getElementById(container) : container;
  if (!parent) return;

  const existing = parent.querySelector('.multi-touch-bar');
  if (existing) existing.remove();

  const bar = document.createElement('div');
  bar.className = 'multi-touch-bar';

  for (let i = 0; i < count; i++) {
    const p = State.players[i] || PLAYER_DEFAULTS[i];
    const btn = document.createElement('button');
    btn.className = `player-touch-btn p${i + 1}-touch`;
    btn.innerHTML = `<span>${p.emoji}</span> <span>${p.name}</span>`;
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof onPlayerTap === 'function') onPlayerTap(i, p);
    });
    bar.appendChild(btn);
  }

  parent.appendChild(bar);
}

function bindCanvasTap(canvasEl, onTap) {
  if (!canvasEl) return;
  const trigger = (e) => {
    e.preventDefault();
    if (typeof onTap === 'function') onTap(e);
  };
  canvasEl.removeEventListener('pointerdown', canvasEl._tapHandler || (() => { }));
  canvasEl._tapHandler = trigger;
  canvasEl.addEventListener('pointerdown', trigger);
}


// ──────────────────────────────────────────────────────
// MAIN MENU – PLAYER COUNT
// ──────────────────────────────────────────────────────
function selectPlayerCount(n) {
  State.playerCount = n;
  document.querySelectorAll('.pc-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('pc' + n).classList.add('selected');

  const playBtn = document.getElementById('btn-play');
  playBtn.disabled = false;
  playBtn.classList.add('pulse-glow');

  playSound('click');
}

// ──────────────────────────────────────────────────────
// PLAYER SELECTION SCREEN
// ──────────────────────────────────────────────────────
function goToPlayerSelect() {
  buildPlayerCards();
  showScreen('screen-players');
  playSound('whoosh');
}

function buildPlayerCards() {
  const container = document.getElementById('player-cards-container');
  container.innerHTML = '';

  for (let i = 0; i < State.playerCount; i++) {
    const pd = PLAYER_DEFAULTS[i];
    const card = document.createElement('div');
    card.className = `player-card ${pd.cls}`;
    card.style.animationDelay = `${i * 0.08}s`;

    card.innerHTML = `
      <div class="player-avatar">${pd.icon}</div>
      <div class="player-info">
        <input class="player-name-input"
               id="player-name-${i}"
               type="text"
               value="${pd.name}"
               maxlength="16"
               placeholder="Enter name..." />
        <div class="player-tag">${pd.emoji} PLAYER ${i + 1}</div>
      </div>
    `;

    container.appendChild(card);

    if (i < State.playerCount - 1) {
      const vs = document.createElement('div');
      vs.className = 'vs-divider';
      vs.textContent = 'VS';
      container.appendChild(vs);
    }
  }
}

function collectPlayerNames() {
  State.players = [];
  for (let i = 0; i < State.playerCount; i++) {
    const input = document.getElementById(`player-name-${i}`);
    const name = input ? input.value.trim() || PLAYER_DEFAULTS[i].name : PLAYER_DEFAULTS[i].name;
    State.players.push({ ...PLAYER_DEFAULTS[i], name });
    State.scores[name] = State.scores[name] || 0;
  }
  State.originalPlayers = State.players.map(p => ({ ...p }));
}

// ──────────────────────────────────────────────────────
// GAME SELECTION
// ──────────────────────────────────────────────────────
function scrollToTopGames() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  const container = document.getElementById('game-grid-container');
  if (container) container.scrollTop = 0;
  const screen = document.getElementById('screen-games');
  if (screen) screen.scrollTop = 0;
}

function resetToGameOne() {
  currentCategory = 'all';
  currentRange = 'all';
  const searchInput = document.getElementById('game-search');
  if (searchInput) searchInput.value = '';
  document.querySelectorAll('#range-pills .cat-pill').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#category-pills .cat-pill').forEach(b => b.classList.remove('active'));
  const firstRangePill = document.querySelector('#range-pills .cat-pill');
  const firstCatPill = document.querySelector('#category-pills .cat-pill');
  if (firstRangePill) firstRangePill.classList.add('active');
  if (firstCatPill) firstCatPill.classList.add('active');
  buildGameGrid();
  scrollToTopGames();

  // Gold pulse effect on Card #1 Tic-Tac-Toe
  setTimeout(() => {
    const card1 = document.getElementById('gc-ttt');
    if (card1) {
      card1.style.transition = 'transform 0.3s, box-shadow 0.3s, border-color 0.3s';
      card1.style.borderColor = 'var(--gold)';
      card1.style.boxShadow = '0 0 30px var(--gold)';
      card1.style.transform = 'scale(1.08)';
      setTimeout(() => {
        card1.style.borderColor = '';
        card1.style.boxShadow = '';
        card1.style.transform = '';
      }, 1500);
    }
  }, 100);
}

function goToGameSelect() {
  collectPlayerNames();
  currentCategory = 'all';
  currentRange = 'all';
  const searchInput = document.getElementById('game-search');
  if (searchInput) searchInput.value = '';
  document.querySelectorAll('#range-pills .cat-pill').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#category-pills .cat-pill').forEach(b => b.classList.remove('active'));
  const firstRangePill = document.querySelector('#range-pills .cat-pill');
  const firstCatPill = document.querySelector('#category-pills .cat-pill');
  if (firstRangePill) firstRangePill.classList.add('active');
  if (firstCatPill) firstCatPill.classList.add('active');
  buildGameGrid();
  showScreen('screen-games');
  scrollToTopGames();
  playSound('whoosh');
}

const CATEGORY_MAP = {
  strategy: ['chesstactic', 'colorflood', 'pipemaze', 'lightup', 'towerofhanoi', 'nonogram', 'patternlock', 'calcace', 'wordchain', 'memorycards2', 'weightbalance', 'numbergrid', 'symbolspin', 'logicpath', 'codecracker', 'shadowmatch', 'speedmath', 'wordladder', 'blockfit', 'crossword', 'shapefold', 'colorblind2', 'numberjump', 'dicebuilder', 'brainoverload', 'sudokuextreme', 'binarypuzzle', 'kakuro', 'mathpyramid', 'bridgespuzz', 'slidingtiles', 'waterpour', 'geometrix', 'wordwheel', 'cryptogram', 'slitherlink', 'mathcross', 'patterns3d', 'colormixing', 'memorymatrix2', 'dominochain', 'logicgrid', 'numberline', 'wordsearches', 'scalebalance2', 'chessknight', 'sudoku4x4', 'shapematch2', 'calcace2', 'brainblitz300'],
  puzzle: ['math', 'mathdash', 'memmatrix', 'oddoneout', 'anagram', 'sudoku', 'shapefit', 'sequence', 'colorblind', 'blackjack', 'domino', 'connect4', 'boggle'],
  retro: ['pacrun', 'spaceinvader', 'breakout', 'asteroids', 'stacker', 'frogger', 'pinball', 'dinojump', 'mazeescape', 'retrosnake2', 'tankbattle', 'pixelracer', 'galaxian', 'centipede', 'tronlight', 'lunarlander', 'paperboy', 'marblemadness', 'roadfighter', 'bomberman', 'contra', 'tempest', 'rallyx', 'digdug', 'xevious', 'bubblebobble', 'spyhunter', 'zaxxon', 'outrun', 'choplifter', 'excitebike', 'trackfield', 'gauntlet', 'kungfumaster', 'shinobi', 'metalSlug', 'superpro', 'pacrun2', 'spaceinvader2', 'asteroids2', 'pinball2', 'breakout2', 'dinojump2', 'stacker2', 'frogger2', 'retrosnake3', 'pixelracer2', 'tankbattle2', 'bomberman2', 'contra2', 'kungfumaster2', 'metalSlug2', 'gauntlet2', 'spyhunter2', 'paperboy2', 'lunarlander2', 'excitebike2', 'bubblebobble2', 'shinobi2', 'outrun2', 'tempest2', 'superpro2'],
  action: ['ttt', 'wam', 'mem', 'snake', 'archery', 'tug', 'reaction', 'stopclock', 'quickdraw', 'bomb', 'ninja', 'whackalien', 'duckhunt', 'hammer', 'dodgeball', 'lasergrid', 'volcano', 'tictactoe4', 'tennis', 'hurdles', 'sumo', 'hockey', 'billiards'],
  party: ['impostor', 'charades', 'spinbottle', 'hotpotato', 'simonsays2', 'musicalchairs', 'donkeytail', 'balancetower', 'balloonpop', 'coinflip', 'fortune', 'trivia', 'boxingpower', 'battleship', 'skating', 'finalclash', 'partyroulette', 'quickdraw2', 'truthordare', 'sayword', 'emojiquiz', 'guesswho', 'blindfolddraw', 'soundquiz', 'fasthands', 'riddles', 'balanceball', 'pirateduel', 'cookieclicker', 'piñata', 'whackmole2', 'cardmatch2', 'spinfavor', 'typingblitz', 'battleship2', 'partybingo', 'lasergun', 'highstriker', 'alienblast', 'megamath', 'grandchampionship', 'partyroulette2', 'quickdraw300', 'truthordare2', 'sayword2', 'emojiquiz2', 'guesswho2', 'blindfolddraw2', 'soundquiz2', 'fasthands2', 'riddles2', 'balanceball2', 'pirateduel2', 'cookieclicker2', 'piñataparty', 'whackmole3', 'cardmatch3', 'spinfavor2', 'typingblitz2', 'battleship3', 'partybingo2', 'lasergun2', 'highstriker2', 'alienblast2', 'megamath2', 'grandchampion300'],
  sports: ['pong', 'basketball', 'bowling', 'penalty', 'minigolf', 'tennis', 'hurdles', 'sumo', 'hockey', 'billiards', 'skating', 'archerywind', 'volleyball', 'curling', 'rugby', 'skiing', 'cricket', 'kayak', 'baseball', 'darts501', 'golfputting', 'tabletennis', 'frisbee', 'boxingknockout', 'bmxstunt', 'skydiving', 'climbing', 'bobsled', 'snowboard', 'fencing', 'badminton', 'slapshot', 'waterpolo', 'sumo2', 'powerlift', 'bowlingstrike', 'soccershootout', 'basketball3pt', 'bowlingpro', 'tennispro', 'golfpro', 'baseballpro', 'archerypro', 'boxingpro', 'cricketpro', 'rugbypro', 'volleyballpro', 'skiingpro', 'kayakpro', 'curlingpro', 'icehockeypro', 'dartspro', 'frisbeepro', 'bmxpro', 'skydivingpro', 'rockclimbpro', 'badmintonpro', 'fencingpro', 'sumopro', 'waterpolopro', 'powerliftpro'],
  cards: ['highlow', 'dice', 'rps', 'slots', 'cardwar', 'blackjack', 'solitaire', 'memorycards2', 'cardmatch2', 'cardmatch3'],
  arcade: ['flappy', 'numrush', 'bubble', 'racing', 'gravjump'],
  words: ['scramble', 'typerace', 'findemoji', 'colormatch', 'anagram', 'boggle', 'wordchain', 'wordladder', 'wordwheel', 'wordsearches', 'sayword2'],
  music: ['simon', 'noter', 'soundquiz', 'soundquiz2', 'emojiquiz2'],
  board: ['snakeladder', 'spinwheel', 'slidepuzz', 'domino', 'connect4'],
  misc: ['iceblock', 'rocket', 'magnet', 'circus', 'hopscotch', 'darts', 'solitaire']
};

const CATEGORIES = [
  { id: 'strategy', name: '🧠 STRATEGY & BRAIN' },
  { id: 'puzzle', name: '🧩 PUZZLE & LOGIC' },
  { id: 'retro', name: '👾 RETRO ARCADE' },
  { id: 'action', name: '⚡ ACTION & FIGHTING' },
  { id: 'party', name: '🎉 PARTY & SHOWDOWN' },
  { id: 'sports', name: '⚽ SPORTS & PHYSICS' },
  { id: 'cards', name: '🃏 CARDS & CASINO' },
  { id: 'arcade', name: '🕹️ ARCADE BLAST' },
  { id: 'words', name: '🔤 WORD GAMES' },
  { id: 'music', name: '🎵 MUSIC & RHYTHM' },
  { id: 'board', name: '🪜 BOARD GAMES' },
  { id: 'misc', name: '🎲 MISC CHALLENGES' }
];

function getGameCat(gameId) {
  for (const catKey in CATEGORY_MAP) {
    if (CATEGORY_MAP[catKey].includes(gameId)) return catKey;
  }
  return 'misc';
}

let currentCategory = 'all';
let currentRange = 'all';

function selectCategory(cat, btn) {
  currentCategory = cat;
  currentRange = 'all';

  document.querySelectorAll('#category-pills .cat-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  document.querySelectorAll('#range-pills .cat-pill').forEach(b => b.classList.remove('active'));
  const allRangePill = document.querySelector('#range-pills .cat-pill');
  if (allRangePill) allRangePill.classList.add('active');

  filterGames();
  scrollToTopGames();
}

function selectRange(range, btn) {
  currentRange = range;
  currentCategory = 'all';

  document.querySelectorAll('#range-pills .cat-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  document.querySelectorAll('#category-pills .cat-pill').forEach(b => b.classList.remove('active'));
  const allCatPill = document.querySelector('#category-pills .cat-pill');
  if (allCatPill) allCatPill.classList.add('active');

  filterGames();
  scrollToTopGames();
}

function filterGames() {
  const query = (document.getElementById('game-search')?.value || '').toLowerCase().trim();
  buildGameGrid(currentCategory, query, currentRange);
}

function buildGameGrid(cat = currentCategory, query = '', range = currentRange) {
  const container = document.getElementById('game-grid-container') || document.getElementById('game-grid');
  if (!container) return;
  container.innerHTML = '';

  let filteredGames = GAMES.filter(game => {
    if (game.locked) return false;
    const gameNum = GAMES.indexOf(game) + 1;
    if (range !== 'all') {
      const [start, end] = range.split('-').map(Number);
      if (gameNum < start || gameNum > end) return false;
    }
    if (cat !== 'all') {
      const gameCat = getGameCat(game.id);
      if (gameCat !== cat) return false;
    }
    if (query) {
      const matchName = game.name.toLowerCase().includes(query);
      const matchIcon = game.icon.includes(query);
      if (!matchName && !matchIcon) return false;
    }
    return true;
  });

  // Top list header banner
  const listHeader = document.createElement('div');
  listHeader.className = 'all-games-list-heading';
  listHeader.style.cssText = 'width:100%;text-align:center;padding:14px 18px;background:linear-gradient(135deg, var(--surface), #261f4d);border:2px solid var(--gold);border-radius:14px;font-family:"Fredoka One",cursive;font-size:1.15rem;color:var(--gold);margin-bottom:18px;box-shadow:0 8px 24px rgba(255,215,0,0.25);letter-spacing:1px;';
  const rangeLabel = range !== 'all' ? `(GAMES #${range})` : '(START FROM GAME #1 TO END #300)';
  listHeader.innerHTML = `🚩 START FROM GAME #1 (Tic-Tac-Toe) TO END #300 ${rangeLabel} – ${filteredGames.length} GAMES AVAILABLE`;
  container.appendChild(listHeader);

  if (filteredGames.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.style.cssText = 'text-align:center;padding:50px 20px;color:var(--text-dim);font-weight:800;font-size:1.2rem;width:100%;';
    emptyMsg.textContent = '🎮 No games found matching your search. Try another category!';
    container.appendChild(emptyMsg);
    return;
  }

  // Sequential grid rendering (1, 2, 3, 4 ... 297, 298, 299, 300)
  const grid = document.createElement('div');
  grid.className = 'game-grid';

  filteredGames.forEach(game => {
    const gameNum = GAMES.indexOf(game) + 1;
    const card = document.createElement('div');
    card.className = 'game-card';
    card.id = 'gc-' + game.id;
    card.dataset.gameId = game.id;

    let badgeHTML = '';
    if (game.badge) {
      badgeHTML = `<span class="gc-badge ${game.badge}">${game.badgeText}</span>`;
    }

    card.innerHTML = `
      <span class="gc-num-tag">#${gameNum}</span>
      ${badgeHTML}
      <div class="gc-icon">${game.icon}</div>
      <div class="gc-name">#${gameNum} ${game.name}</div>
      <div class="gc-players">${game.minP}–${game.maxP} players</div>
    `;

    grid.appendChild(card);
  });

  container.appendChild(grid);

  const triggerGridLaunch = (e) => {
    const card = e.target.closest('.game-card:not(.locked)');
    if (!card || !card.dataset.gameId) return;
    const game = GAMES.find(g => g.id === card.dataset.gameId);
    if (game) {
      console.log('[DEBUG] Card clicked – game id:', game.id);
      e.preventDefault();
      launchGame(game);
    }
  };

  grid.addEventListener('pointerdown', triggerGridLaunch);
  grid.addEventListener('click', triggerGridLaunch);
}

let isLaunchingGame = false;

function launchGame(game) {
  if (!game || isLaunchingGame) return;
  console.log('[DEBUG] launchGame called for', game.id);
  isLaunchingGame = true;
  setTimeout(() => { isLaunchingGame = false; }, 350);

  try {
    State.currentGame = game;

    if (!State.players || State.players.length === 0) {
      State.players = [];
      const count = State.playerCount || 2;
      for (let i = 0; i < count; i++) {
        State.players.push({ ...PLAYER_DEFAULTS[i] });
        State.scores[PLAYER_DEFAULTS[i].name] = 0;
      }
      State.originalPlayers = State.players.map(p => ({ ...p }));
    } else if (State.originalPlayers && State.originalPlayers.length > 0) {
      State.players = State.originalPlayers.map(p => ({ ...p }));
    }

    // Ensure enough players for minP by auto-filling CPU opponents
    while (State.players.length < game.minP) {
      const idx = State.players.length;
      const def = PLAYER_DEFAULTS[idx] || { name: `CPU ${idx + 1}`, color: '#ff8800', cls: `p${idx + 1}`, emoji: '🤖', icon: '🤖', symbol: '🤖' };
      State.players.push({ ...def, name: `CPU ${idx + 1}` });
      State.scores[`CPU ${idx + 1}`] = 0;
    }

    State.playerCount = State.players.length;
    playSound('start');

    if (typeof game.fn === 'function') {
      game.fn();
    } else if (typeof window['start' + game.id] === 'function') {
      window['start' + game.id]();
    } else {
      console.warn(`Function for game ${game.id} not found.`);
    }
  } catch (err) {
    console.error('[ERROR] launchGame failed:', err);
    // rethrow to keep existing error handling
    throw err;
  }
}

function launchGame(game) {
  if (!game || isLaunchingGame) return;
  isLaunchingGame = true;
  setTimeout(() => { isLaunchingGame = false; }, 350);

  State.currentGame = game;

  if (!State.players || State.players.length === 0) {
    State.players = [];
    const count = State.playerCount || 2;
    for (let i = 0; i < count; i++) {
      State.players.push({ ...PLAYER_DEFAULTS[i] });
      State.scores[PLAYER_DEFAULTS[i].name] = 0;
    }
    State.originalPlayers = State.players.map(p => ({ ...p }));
  } else if (State.originalPlayers && State.originalPlayers.length > 0) {
    State.players = State.originalPlayers.map(p => ({ ...p }));
  }

  // Ensure enough players for minP by auto-filling CPU opponents
  while (State.players.length < game.minP) {
    const idx = State.players.length;
    const def = PLAYER_DEFAULTS[idx] || { name: `CPU ${idx + 1}`, color: '#ff8800', cls: `p${idx + 1}`, emoji: '🤖', icon: '🤖', symbol: '🤖' };
    State.players.push({ ...def, name: `CPU ${idx + 1}` });
    State.scores[`CPU ${idx + 1}`] = 0;
  }

  State.playerCount = State.players.length;
  playSound('start');

  try {
    if (typeof game.fn === 'function') {
      game.fn();
    } else if (typeof window['start' + game.id] === 'function') {
      window['start' + game.id]();
    } else {
      console.warn(`Function for game ${game.id} not found.`);
    }
  } catch (err) {
    console.error(`Error launching game ${game.id}:`, err);
  }
}

function pickRandomGame() {
  const available = GAMES.filter(g => !g.locked);
  if (available.length === 0) return;
  const pick = available[Math.floor(Math.random() * available.length)];

  // Highlight the chosen card briefly
  document.querySelectorAll('.game-card').forEach(c => c.style.transform = '');
  const el = document.getElementById('gc-' + pick.id);
  if (el) {
    el.style.transform = 'scale(1.1)';
    el.style.borderColor = '#ffd700';
    el.style.boxShadow = '0 0 30px rgba(255,215,0,0.5)';
    setTimeout(() => launchGame(pick), 700);
  }
}

// ──────────────────────────────────────────────────────
// QUIT GAME
// ──────────────────────────────────────────────────────
function stopAllGames() {
  if (typeof wamStop === 'function') wamStop();
  if (typeof snakeStop === 'function') snakeStop();
  if (typeof archeryStop === 'function') archeryStop();
  if (typeof tugStop === 'function') tugStop();
  if (typeof wordStop === 'function') wordStop();
  if (typeof musicStop === 'function') musicStop();
  if (typeof boardStop === 'function') boardStop();
  if (typeof battleStop === 'function') battleStop();
  if (typeof partyStop === 'function') partyStop();
  if (typeof miscStop === 'function') miscStop();
  if (typeof puzzleStop === 'function') puzzleStop();
  if (typeof retroStop === 'function') retroStop();
  if (typeof actionStop === 'function') actionStop();
  if (typeof partyMoreStop === 'function') partyMoreStop();
  if (typeof stratStop === 'function') stratStop();
  if (typeof arcadeMoreStop === 'function') arcadeMoreStop();
  if (typeof sportsMoreStop === 'function') sportsMoreStop();
  if (typeof partyUltStop === 'function') partyUltStop();
  if (typeof brain300Stop === 'function') brain300Stop();
  if (typeof arcade300Stop === 'function') arcade300Stop();
  if (typeof sports300Stop === 'function') sports300Stop();
  if (typeof party300Stop === 'function') party300Stop();

  if (typeof STC !== 'undefined' && STC.iv) { clearInterval(STC.iv); STC.running = false; }
  if (typeof BOMB !== 'undefined' && BOMB.iv) { clearInterval(BOMB.iv); BOMB.running = false; }
  if (typeof BBALL !== 'undefined' && BBALL.iv) { clearInterval(BBALL.iv); }
  if (typeof BOWL !== 'undefined' && BOWL.iv) { clearInterval(BOWL.iv); }
  if (typeof GOLF !== 'undefined' && GOLF.iv) { clearInterval(GOLF.iv); }
  if (typeof FLAP !== 'undefined' && FLAP.frame) { cancelAnimationFrame(FLAP.frame); FLAP.running = false; }
  if (typeof BPOP !== 'undefined') { clearInterval(BPOP.iv); clearInterval(BPOP.spawnIv); BPOP.running = false; }
  if (typeof RACE !== 'undefined' && RACE.frame) { cancelAnimationFrame(RACE.frame); RACE.running = false; }
  if (typeof GJ !== 'undefined' && GJ.frame) { cancelAnimationFrame(GJ.frame); GJ.running = false; }
  if (typeof PONG !== 'undefined' && PONG.frame) { cancelAnimationFrame(PONG.frame); PONG.running = false; }
}

function quitGame() {
  stopAllGames();
  showScreen('screen-games');
}

function renderTournament() {
  const body = document.getElementById('tournament-body');
  const scoresEl = document.getElementById('tournament-scores');
  if (!body || !scoresEl) return;

  const entries = Object.entries(State.tournScores);
  if (entries.length === 0) {
    body.style.display = 'block';
    scoresEl.style.display = 'none';
  } else {
    body.style.display = 'none';
    scoresEl.style.display = 'flex';
    scoresEl.innerHTML = '';
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    sorted.forEach(([name, pts], idx) => {
      const player = State.players.find(p => p.name === name) || PLAYER_DEFAULTS.find(p => p.name === name) || { emoji: '🎮', color: '#fff' };
      const row = document.createElement('div');
      row.className = 'result-score-row' + (idx === 0 ? ' winner-row' : '');
      row.innerHTML = `
        <span>${idx === 0 ? '🏆 ' : ''}${player.emoji || ''} ${name}</span>
        <span class="result-score-points" style="color:${player.color || '#fff'}">${pts} pts</span>
      `;
      scoresEl.appendChild(row);
    });
  }
}

// ──────────────────────────────────────────────────────
// RESULT / WINNER SCREEN
// ──────────────────────────────────────────────────────
function showResult(scoresObj, winnerName, isDraw) {
  // Update persistent scores
  Object.entries(scoresObj).forEach(([name, pts]) => {
    State.tournScores[name] = (State.tournScores[name] || 0) + pts;
  });

  const sorted = Object.entries(scoresObj).sort((a, b) => b[1] - a[1]);

  // Trophy & title
  const trophy = document.getElementById('result-trophy');
  const title = document.getElementById('result-title');
  const nameEl = document.getElementById('result-name');
  const scoresEl = document.getElementById('result-scores');

  if (isDraw) {
    trophy.textContent = '🤝';
    title.textContent = "IT'S A DRAW!";
    nameEl.textContent = 'Nobody wins this round';
    nameEl.style.color = 'var(--text-dim)';
  } else {
    trophy.textContent = '🏆';
    title.textContent = 'WINNER!';
    const winner = State.players.find(p => p.name === winnerName) || State.players[0];
    nameEl.textContent = `${winner.emoji} ${winnerName}`;
    nameEl.style.color = winner.color;
  }

  scoresEl.innerHTML = '';
  sorted.forEach(([name, pts], idx) => {
    const player = State.players.find(p => p.name === name) || State.players[idx];
    const row = document.createElement('div');
    row.className = 'result-score-row' + (idx === 0 && !isDraw ? ' winner-row' : '');
    row.innerHTML = `
      <span>${player ? player.emoji : ''} ${name}</span>
      <span class="result-score-points" style="color:${player ? player.color : '#fff'}">${pts} pts</span>
    `;
    scoresEl.appendChild(row);
  });

  launchConfetti();
  showScreen('screen-result');
  playSound('win');
}

function playAgainSameGame() {
  if (State.currentGame) launchGame(State.currentGame);
}

// ──────────────────────────────────────────────────────
// CONFETTI
// ──────────────────────────────────────────────────────
function launchConfetti() {
  const container = document.getElementById('confetti-container');
  container.innerHTML = '';
  const colors = ['#ff4d6d', '#4db8ff', '#4dff91', '#ffd44d', '#c86ef5', '#7c6af7'];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${6 + Math.random() * 10}px;
      height: ${6 + Math.random() * 10}px;
      animation-duration: ${1.5 + Math.random() * 2.5}s;
      animation-delay: ${Math.random() * 0.8}s;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
    `;
    container.appendChild(el);
  }
}

// ──────────────────────────────────────────────────────
// SCORE STRIP HELPER
// ──────────────────────────────────────────────────────
function buildScoreStrip(containerId, scores) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';
  State.players.forEach(p => {
    const chip = document.createElement('div');
    chip.className = 'score-chip';
    chip.id = `score-chip-${p.name.replace(/\s/g, '_')}`;
    chip.innerHTML = `
      <div class="score-dot" style="background:${p.color}"></div>
      <span style="color:${p.color}">${p.name}</span>
      <span id="sc-${p.name.replace(/\s/g, '_')}">${scores[p.name] || 0}</span>
    `;
    el.appendChild(chip);
  });
}

function updateScoreChip(name, val) {
  const el = document.getElementById(`sc-${name.replace(/\s/g, '_')}`);
  if (el) {
    el.textContent = val;
    el.parentElement.classList.add('pop-in');
    setTimeout(() => el.parentElement.classList.remove('pop-in'), 300);
  }
}

// ──────────────────────────────────────────────────────
// SETTINGS
// ──────────────────────────────────────────────────────
function toggleSetting(key) {
  if (key === 'sfx') State.sfx = document.getElementById('sfx-toggle').checked;
  if (key === 'music') State.music = document.getElementById('music-toggle').checked;
  if (key === 'anim') State.anim = document.getElementById('anim-toggle').checked;
  if (key === 'theme') State.theme = document.getElementById('theme-toggle').checked ? 'dark' : 'light';
  playSound('click');
}

// ──────────────────────────────────────────────────────
// SOUND (Web Audio API – simple beeps)
// ──────────────────────────────────────────────────────
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playSound(type) {
  if (!State.sfx) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
        break;
      case 'whoosh':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now); osc.stop(now + 0.25);
        break;
      case 'start':
        [523, 659, 784].forEach((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.type = 'sine';
          o.frequency.setValueAtTime(f, now + i * 0.12);
          g.gain.setValueAtTime(0.2, now + i * 0.12);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.15);
          o.start(now + i * 0.12); o.stop(now + i * 0.12 + 0.2);
        });
        return;
      case 'win':
        [523, 659, 784, 1047].forEach((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.type = 'triangle';
          o.frequency.setValueAtTime(f, now + i * 0.15);
          g.gain.setValueAtTime(0.25, now + i * 0.15);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.3);
          o.start(now + i * 0.15); o.stop(now + i * 0.15 + 0.35);
        });
        return;
      case 'place':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now); osc.stop(now + 0.12);
        break;
      case 'whack':
        osc.type = 'square';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
        break;
      case 'flip':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now); osc.stop(now + 0.08);
        break;
      case 'match':
        [523, 659].forEach((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.type = 'sine';
          o.frequency.setValueAtTime(f, now + i * 0.1);
          g.gain.setValueAtTime(0.18, now + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.15);
          o.start(now + i * 0.1); o.stop(now + i * 0.1 + 0.2);
        });
        return;
      case 'eat':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.exponentialRampToValueAtTime(1047, now + 0.1);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
        break;
      case 'die':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now); osc.stop(now + 0.4);
        break;
      case 'draw':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(220, now + 0.3);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
        break;
      default:
        return;
    }
  } catch (e) { /* Audio not available */ }
}

// ──────────────────────────────────────────────────────
// BACKGROUND PARTICLE CANVAS
// ──────────────────────────────────────────────────────
(function initBG() {
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  const COLORS = ['rgba(124,106,247,', 'rgba(200,110,245,', 'rgba(255,77,109,', 'rgba(77,184,255,'];

  for (let i = 0; i < 55; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 1 + Math.random() * 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      opacity: 0.15 + Math.random() * 0.4,
    });
  }

  function drawBG() {
    ctx.clearRect(0, 0, W, H);

    // Gradient bg
    const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.75);
    grad.addColorStop(0, '#1a1a35');
    grad.addColorStop(1, '#0d0d1a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.opacity + ')';
      ctx.fill();
    });

    requestAnimationFrame(drawBG);
  }

  drawBG();
})();

// ──────────────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  buildGameGrid();
  showScreen('screen-menu');
  // Pre-select 2 players
  selectPlayerCount(2);
});
