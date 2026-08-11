/* ==========================================================================
   HD REAL HUMAN BOXING CHAMPION - GAME ENGINE
   Features: High-Definition Anatomical Human Boxer Rendering (Male & Female),
   Realistic Muscular Definition (6-Pack Abs, Chest, Deltoids, Facial Features),
   Dynamic Punch Animations, Sweat Drops, Ring Atmosphere, Web Audio API.
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. SOUND ENGINE (Web Audio API)
// --------------------------------------------------------------------------
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.bgmTimer = null;
        this.isBgmPlaying = false;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted && this.isBgmPlaying) this.stopBGM();
        else if (!this.muted && !this.isBgmPlaying) this.startBGM();
        return this.muted;
    }

    playWhoosh() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const bufferSize = this.ctx.sampleRate * 0.08;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(170, this.ctx.currentTime + 0.08);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
        noise.stop(this.ctx.currentTime + 0.08);
    }

    playHit(isHeavy = false) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = isHeavy ? 'triangle' : 'sine';
        const startFreq = isHeavy ? 180 : 260;
        const endFreq = isHeavy ? 25 : 45;
        const duration = isHeavy ? 0.32 : 0.18;

        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);

        gain.gain.setValueAtTime(isHeavy ? 0.95 : 0.65, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);

        if (isHeavy) this.playWhoosh();
    }

    playBlock() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playBell() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        [850, 1300, 2600].forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 1.4);
        });
    }

    playCheer() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = this.ctx.currentTime + idx * 0.08;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.25, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.0);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 1.0);
        });
    }

    startBGM() {
        if (this.muted || this.isBgmPlaying) return;
        this.init();
        if (!this.ctx) return;

        this.isBgmPlaying = true;
        let step = 0;
        const bassNotes = [110, 110, 130, 98, 110, 146, 130, 98];

        this.bgmTimer = setInterval(() => {
            if (this.muted || !this.isBgmPlaying || !this.ctx) return;
            const freq = bassNotes[step % bassNotes.length];
            step++;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.22);
        }, 250);
    }

    stopBGM() {
        this.isBgmPlaying = false;
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    }
}

const audio = new SoundEngine();

// --------------------------------------------------------------------------
// 2. FIGHTERS DATA & ROSTER
// --------------------------------------------------------------------------
const FIGHTERS = [
    // MALE CHAMPIONS (Fair Skill-Based Base Stats)
    {
        id: 'iron_spike',
        name: 'IRON SPIKE',
        gender: 'male',
        styleType: 'OUT-BOXER ⚡ (Speedster)',
        title: 'Heavyweight Champion',
        avatar: '🥊',
        maxHealth: 100,
        power: 15,
        speed: 1.0,
        defense: 10,
        color: '#00f5d4',
        skinColor: '#e0ac69',
        shortsColor: '#ffffff',
        hairColor: '#111111',
        superName: 'THUNDER HOOK'
    },
    {
        id: 'thunder_punch',
        name: 'THUNDER PUNCH',
        gender: 'male',
        styleType: 'SLUGGER 💥 (Power Brawler)',
        title: 'Power Brawler',
        avatar: '🦍',
        maxHealth: 100,
        power: 15,
        speed: 1.0,
        defense: 10,
        color: '#ff9e00',
        skinColor: '#8d5524',
        shortsColor: '#ffffff',
        hairColor: '#000000',
        superName: 'EARTHQUAKE SLAM'
    },
    {
        id: 'shadow_blade',
        name: 'SHADOW BLADE',
        gender: 'male',
        styleType: 'COUNTER-PUNCHER 🛡️ (Technician)',
        title: 'Lightweight Striker',
        avatar: '🥷',
        maxHealth: 100,
        power: 15,
        speed: 1.0,
        defense: 10,
        color: '#7b2cbf',
        skinColor: '#f1c27d',
        shortsColor: '#ffffff',
        hairColor: '#3d2314',
        superName: 'SHADOW FLURRY'
    },

    // FEMALE CHAMPIONS (Fair Skill-Based Base Stats)
    {
        id: 'viper_valkyrie',
        name: 'VIPER VALKYRIE',
        gender: 'female',
        styleType: 'OUT-BOXER ⚡ (Speedster)',
        title: 'Welterweight Valkyrie',
        avatar: '⚡',
        maxHealth: 100,
        power: 15,
        speed: 1.0,
        defense: 10,
        color: '#ff0054',
        skinColor: '#f3c89b',
        shortsColor: '#ff0054',
        hairColor: '#ffb703',
        superName: 'VALKYRIE UPPERCUT'
    },
    {
        id: 'titaness_apex',
        name: 'TITANESS APEX',
        gender: 'female',
        styleType: 'IN-FIGHTER 🐂 (Heavy Tank)',
        title: 'Championship Queen',
        avatar: '👑',
        maxHealth: 100,
        power: 15,
        speed: 1.0,
        defense: 10,
        color: '#ffb703',
        skinColor: '#7a4923',
        shortsColor: '#ffb703',
        hairColor: '#111111',
        superName: 'APEX CRUSH'
    },
    {
        id: 'fire_phoenix',
        name: 'FIRE PHOENIX',
        gender: 'female',
        styleType: 'SLUGGER 🔥 (Inferno Brawler)',
        title: 'Inferno Contender',
        avatar: '🔥',
        maxHealth: 100,
        power: 15,
        speed: 1.0,
        defense: 10,
        color: '#ff4d6d',
        skinColor: '#e0ac69',
        shortsColor: '#d90429',
        hairColor: '#d90429',
        superName: 'PHOENIX STRIKE'
    },

    // EXTRA LEVEL CHAMPIONS (Fair Skill-Based Base Stats)
    {
        id: 'master_ryu',
        name: 'MASTER RYU',
        gender: 'male',
        styleType: 'COUNTER-PUNCHER 🥋 (Grandmaster)',
        title: 'Grandmaster Counter Puncher',
        avatar: '🥋',
        maxHealth: 100,
        power: 15,
        speed: 1.0,
        defense: 10,
        color: '#38b000',
        skinColor: '#e0ac69',
        shortsColor: '#1e293b',
        hairColor: '#000000',
        superName: 'DRAGON UPPERCUT'
    },
    {
        id: 'titan_goliath',
        name: 'TITAN GOLIATH',
        gender: 'male',
        styleType: 'SLUGGER 🗿 (Super Heavyweight)',
        title: 'Undefeated Giant',
        avatar: '🗿',
        maxHealth: 100,
        power: 15,
        speed: 1.0,
        defense: 10,
        color: '#ef4444',
        skinColor: '#6e431f',
        shortsColor: '#d90429',
        hairColor: '#111111',
        superName: 'TITAN CRUSH'
    },
    {
        id: 'phantom_kage',
        name: 'PHANTOM KAGE',
        gender: 'male',
        styleType: 'OUT-BOXER 👤 (Shadow Assassin)',
        title: 'Shadow Realm Champion',
        avatar: '👤',
        maxHealth: 100,
        power: 15,
        speed: 1.0,
        defense: 10,
        color: '#7b2cbf',
        skinColor: '#f1c27d',
        shortsColor: '#000000',
        hairColor: '#1e1b4b',
        superName: 'PHANTOM STRIKE'
    },
    {
        id: 'golden_legend',
        name: 'THE GOLDEN LEGEND',
        gender: 'male',
        styleType: 'WORLD CHAMPION 🏆 (P4P King)',
        title: 'Undisputed World Champion',
        avatar: '🏆',
        maxHealth: 100,
        power: 15,
        speed: 1.0,
        defense: 10,
        color: '#ffb703',
        skinColor: '#e0ac69',
        shortsColor: '#ffffff',
        hairColor: '#ffb703',
        superName: 'LEGENDARY FINISHER'
    }
];

// 100 CAMPAIGN LEVEL MATCHES CONFIGURATION (Level 1 to Level 100 God Champion)
const CAMPAIGN_LEVELS = [];
const OPPONENT_IDS = ['shadow_blade', 'viper_valkyrie', 'thunder_punch', 'titaness_apex', 'fire_phoenix', 'iron_spike', 'master_ryu', 'titan_goliath', 'phantom_kage', 'golden_legend'];
const LEVEL_TITLES = [
    "Rookie Debut", "Valkyrie Trial", "Brawler Showdown", "Queen of the Ring", "Inferno Challenge",
    "Iron Spike Rematch", "Grandmaster Dojo", "Titan Colosseum", "Shadow Realm", "World Championship",
    "Rising Star", "Iron Fist Trial", "Speed Demon", "Thunder Ridge", "Phoenix Rising",
    "Steel Wall", "Dragon Gate", "Colossus Strike", "Kage Shadows", "Apex Tier",
    "Bronze Contender", "Silver Striker", "Gold Division", "Platinum Glove", "Diamond Belt",
    "Master Class", "Grand Master", "Overlord Trial", "God Realm", "Supreme Showdown"
];

for (let l = 1; l <= 100; l++) {
    let diff = 'easy';
    if (l > 10) diff = 'medium';
    if (l > 30) diff = 'hard';
    if (l > 60) diff = 'champ';
    if (l > 85) diff = 'god';

    const oppId = OPPONENT_IDS[(l - 1) % OPPONENT_IDS.length];
    let name = l === 100 ? "THE GOD OF BOXING 👑 (LEVEL 100)" : `${LEVEL_TITLES[(l - 1) % LEVEL_TITLES.length]} (LVL ${l})`;
    if (l % 10 === 0 && l < 100) name = `TIER ${l / 10} CHAMPION MATCH 🥊 (LVL ${l})`;

    CAMPAIGN_LEVELS.push({
        level: l,
        name: name,
        opponentId: oppId,
        diff: diff,
        rewardCoins: l * 400 + (l === 100 ? 50000 : 0)
    });
}

// --------------------------------------------------------------------------
// 3. HD REALISTIC HUMAN FIGHTER RENDERER (Muscular Anatomical Vectors)
// --------------------------------------------------------------------------
class RealHumanFighter {
    constructor(data, isPlayer = true) {
        this.data = data;
        this.isPlayer = isPlayer;

        this.x = isPlayer ? 220 : 740;
        this.y = 350;
        this.width = 85;
        this.height = 175;

        this.maxHealth = data.maxHealth;
        this.health = data.maxHealth;
        this.maxStamina = 100;
        this.stamina = 100;
        this.superMeter = 0;

        this.state = 'idle'; // idle, moving, duck, jab, heavy, super, block, hit, down, ko
        this.stateTimer = 0;
        this.facing = isPlayer ? 1 : -1;

        this.knockdowns = 0;
        this.getUpProgress = 0;

        this.stats = {
            punches: 0,
            hitsLanded: 0,
            damageDealt: 0,
            maxCombo: 0,
            currentCombo: 0
        };

        this.animFrame = Math.random() * 10;
        this.bodySway = 0;
    }

    update(dt) {
        this.animFrame += dt * 6;
        this.bodySway = Math.sin(this.animFrame) * 4;

        if (this.state === 'idle' || this.state === 'moving' || this.state === 'duck') {
            this.stamina = Math.min(this.maxStamina, this.stamina + dt * 30);
        }

        if (this.stateTimer > 0) {
            this.stateTimer -= dt;
            if (this.stateTimer <= 0) {
                if (this.state !== 'down' && this.state !== 'ko') {
                    this.state = 'idle';
                }
            }
        }
    }

    move2D(dirX, dirY, ringWidth = 960, ringHeight = 460) {
        if (this.state !== 'idle' && this.state !== 'moving' && this.state !== 'duck') return;

        const speedMult = this.state === 'duck' ? 0.5 : 1.0;
        const moveSpeed = 240 * this.data.speed * speedMult;

        this.x += dirX * moveSpeed * 0.016;
        this.y += dirY * (moveSpeed * 0.65) * 0.016;

        if (this.state !== 'duck') this.state = 'moving';

        this.x = Math.max(120, Math.min(ringWidth - 120, this.x));
        this.y = Math.max(260, Math.min(410, this.y));

        if (dirX !== 0) this.facing = dirX > 0 ? 1 : -1;
    }

    move(dir, ringWidth = 960) {
        this.move2D(dir, 0, ringWidth);
    }

    duck() {
        if (this.state !== 'idle' && this.state !== 'moving') return;
        this.state = 'duck';
        this.stateTimer = 0.4;
    }

    jab() {
        if (this.state !== 'idle' && this.state !== 'moving' && this.state !== 'duck') return false;
        if (this.stamina < 12) return false;

        this.stamina -= 12;
        this.state = 'jab';
        this.stateTimer = 0.18;
        this.stats.punches++;
        audio.playWhoosh();
        return true;
    }

    heavy() {
        if (this.state !== 'idle' && this.state !== 'moving' && this.state !== 'duck') return false;
        if (this.stamina < 28) return false;

        this.stamina -= 28;
        this.state = 'heavy';
        this.stateTimer = 0.38;
        this.stats.punches++;
        audio.playWhoosh();
        return true;
    }

    superAttack() {
        if (this.state !== 'idle' && this.state !== 'moving') return false;
        if (this.superMeter < 100) return false;

        this.superMeter = 0;
        this.state = 'super';
        this.stateTimer = 0.55;
        this.stats.punches++;
        audio.playWhoosh();
        return true;
    }

    block() {
        if (this.state !== 'idle' && this.state !== 'moving') return;
        this.state = 'block';
        this.stateTimer = 0.45;
    }

    takeDamage(amount, attacker) {
        if (this.state === 'down' || this.state === 'ko') return;

        if (this.state === 'duck' && attacker.state === 'jab') return;

        let actualDamage = amount;
        if (this.state === 'block') {
            actualDamage *= 0.2;
            audio.playBlock();
        } else {
            this.state = 'hit';
            this.stateTimer = 0.28;
            this.x += attacker.facing * 20;
            audio.playHit(amount > 16);
        }

        this.health = Math.max(0, this.health - actualDamage);

        attacker.superMeter = Math.min(100, attacker.superMeter + 20);
        attacker.stats.hitsLanded++;
        attacker.stats.damageDealt += Math.round(actualDamage);
        attacker.stats.currentCombo++;
        if (attacker.stats.currentCombo > attacker.stats.maxCombo) {
            attacker.stats.maxCombo = attacker.stats.currentCombo;
        }

        if (this.health <= 0) {
            this.knockdowns++;
            this.state = 'down';
            this.getUpProgress = 0;
        }
    }

    tryGetUp() {
        if (this.state !== 'down') return;
        this.getUpProgress += 25;
        if (this.getUpProgress >= 100) {
            this.health = 35;
            this.stamina = 80;
            this.state = 'idle';
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        const depthScale = 0.8 + ((this.y - 260) / 150) * 0.35;
        ctx.scale(depthScale, depthScale);

        // Floor Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 48, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        const dir = this.facing;
        let duckOffsetY = 0;
        if (this.state === 'duck') duckOffsetY = 35;

        if (this.state === 'down' || this.state === 'ko') {
            ctx.rotate(dir * (Math.PI / 2.1));
            ctx.translate(0, 40);
        }

        const sway = (this.state === 'idle' || this.state === 'moving') ? this.bodySway : 0;
        const isFemale = this.data.gender === 'female';

        // 1. Legs & Boxing Boots
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-22, -32 + duckOffsetY, 16, 32);
        ctx.fillRect(6, -32 + duckOffsetY, 16, 32);

        // Boot Trims & Laces
        ctx.fillStyle = this.data.shortsColor;
        ctx.fillRect(-22, -12 + duckOffsetY, 16, 12);
        ctx.fillRect(6, -12 + duckOffsetY, 16, 12);

        // 2. Boxing Shorts (White Shorts with Red Waistband and Red Side Stripes)
        const isWhiteShorts = !isFemale; // White shorts for male boxer
        ctx.fillStyle = isWhiteShorts ? '#ffffff' : this.data.shortsColor;
        const shortsWidth = isFemale ? 52 : 60;
        ctx.fillRect(-shortsWidth / 2, -78 + sway + duckOffsetY, shortsWidth, 46);

        // Red Side Stripes for White Shorts (or white stripes for female shorts)
        ctx.fillStyle = isWhiteShorts ? '#d90429' : '#ffffff';
        ctx.fillRect(-shortsWidth / 2, -78 + sway + duckOffsetY, 6, 46);
        ctx.fillRect(shortsWidth / 2 - 6, -78 + sway + duckOffsetY, 6, 46);

        // Red Waistband (White Shorts Spec)
        ctx.fillStyle = isWhiteShorts ? '#d90429' : '#ffffff';
        ctx.fillRect(-shortsWidth / 2, -78 + sway + duckOffsetY, shortsWidth, 10);

        // White Drawstring Bow Tie at Waistband
        ctx.strokeStyle = isWhiteShorts ? '#ffffff' : '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(-4, -72 + sway + duckOffsetY, 5, 0, Math.PI * 2);
        ctx.arc(4, -72 + sway + duckOffsetY, 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -78 + sway + duckOffsetY); ctx.lineTo(-4, -64 + sway + duckOffsetY);
        ctx.moveTo(0, -78 + sway + duckOffsetY); ctx.lineTo(4, -64 + sway + duckOffsetY);
        ctx.stroke();

        // 3. Torso & Muscular Definition
        ctx.fillStyle = this.data.skinColor;
        const torsoWidth = isFemale ? 25 : 30;
        ctx.beginPath();
        ctx.ellipse(0, -122 + sway + duckOffsetY, torsoWidth, 48, 0, 0, Math.PI * 2);
        ctx.fill();

        if (isFemale) {
            // Female Sports Top
            ctx.fillStyle = this.data.shortsColor;
            ctx.beginPath();
            ctx.ellipse(0, -135 + sway + duckOffsetY, 26, 18, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Male Chest Pectorals & Serratus Cuts (Reference Style)
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.lineWidth = 2.8;

            // Chest Pectoral Plates
            ctx.beginPath();
            ctx.arc(-11, -134 + sway + duckOffsetY, 13, 0, Math.PI);
            ctx.arc(11, -134 + sway + duckOffsetY, 13, 0, Math.PI);
            ctx.stroke();

            // 6-Pack Abs Line
            ctx.beginPath();
            ctx.moveTo(0, -145 + sway + duckOffsetY);
            ctx.lineTo(0, -82 + sway + duckOffsetY);
            ctx.stroke();

            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(-13, -124 + (i * 12) + sway + duckOffsetY);
                ctx.lineTo(13, -124 + (i * 12) + sway + duckOffsetY);
                ctx.stroke();
            }
        }

        // 4. Deltoid Shoulders
        ctx.fillStyle = this.data.skinColor;
        ctx.beginPath();
        ctx.arc(-27 * dir, -144 + sway + duckOffsetY, 15, 0, Math.PI * 2);
        ctx.arc(27 * dir, -144 + sway + duckOffsetY, 15, 0, Math.PI * 2);
        ctx.fill();

        // 5. Head, Face & Intense Eyebrows (Reference Style)
        ctx.beginPath();
        ctx.arc(0, -180 + sway + duckOffsetY, 25, 0, Math.PI * 2);
        ctx.fill();

        // Jawline
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, -177 + sway + duckOffsetY, 23, Math.PI / 4, (3 * Math.PI) / 4);
        ctx.stroke();

        // Eyebrows & Eyes
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.moveTo(dir * 5, -188 + sway + duckOffsetY);
        ctx.lineTo(dir * 18, -184 + sway + duckOffsetY);
        ctx.lineTo(dir * 18, -180 + sway + duckOffsetY);
        ctx.closePath();
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(dir * 8, -182 + sway + duckOffsetY, 8, 6);
        ctx.fillStyle = '#000000';
        ctx.fillRect(dir * 11, -181 + sway + duckOffsetY, 4, 4);

        // Determined Mouthline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(dir * 6, -170 + sway + duckOffsetY);
        ctx.lineTo(dir * 16, -170 + sway + duckOffsetY);
        ctx.stroke();

        // Stylized Pompadour Hair (Reference Style)
        ctx.fillStyle = this.data.hairColor || '#111111';
        if (isFemale) {
            ctx.beginPath();
            ctx.arc(-4 * dir, -188 + sway + duckOffsetY, 25, Math.PI, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(-24 * dir, -175 + sway + duckOffsetY, 16, 6, -dir * 0.4, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Pompadour Spiky Hair
            ctx.beginPath();
            ctx.moveTo(-25 * dir, -185 + sway + duckOffsetY);
            ctx.quadraticCurveTo(-15 * dir, -215 + sway + duckOffsetY, 10 * dir, -210 + sway + duckOffsetY);
            ctx.quadraticCurveTo(25 * dir, -195 + sway + duckOffsetY, 25 * dir, -185 + sway + duckOffsetY);
            ctx.closePath();
            ctx.fill();
        }

        // 6. Leather Boxing Gloves & White Hand Wraps (2-Hand Dual Boxing Stance)
        // Default Guard Stance: Both fists raised near face (Reference Spec)
        let leftGlove = { x: -18 * dir, y: -168 + sway + duckOffsetY };
        let rightGlove = { x: 22 * dir, y: -165 + sway + duckOffsetY };

        if (this.state === 'jab') {
            // Left Jab: Left Hand extends straight forward, Right Hand guards chin
            leftGlove = { x: 96 * dir, y: -168 + sway + duckOffsetY };
            rightGlove = { x: 18 * dir, y: -165 + sway + duckOffsetY };

            // Left Jab speedline trail
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.fillRect(-10 * dir, -172 + sway + duckOffsetY, 90 * dir, 10);
        } else if (this.state === 'heavy') {
            // Right Heavy Hook: Right Hand power swing forward, Left Hand guards face
            leftGlove = { x: -22 * dir, y: -165 + sway + duckOffsetY };
            rightGlove = { x: 112 * dir, y: -155 + sway + duckOffsetY };

            // Heavy Hook red power burst
            ctx.fillStyle = 'rgba(255, 0, 84, 0.45)';
            ctx.beginPath();
            ctx.arc(rightGlove.x, rightGlove.y, 34, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.state === 'super') {
            // Super Uppercut: Right Fist launches upward, Left Fist guards body
            leftGlove = { x: -24 * dir, y: -145 + sway + duckOffsetY };
            rightGlove = { x: 88 * dir, y: -212 + sway + duckOffsetY };

            ctx.fillStyle = 'rgba(224, 170, 255, 0.65)';
            ctx.beginPath();
            ctx.arc(rightGlove.x, rightGlove.y, 42, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.state === 'block') {
            // Block: Both hands raised together in front of face
            leftGlove = { x: 10 * dir, y: -175 + sway + duckOffsetY };
            rightGlove = { x: 26 * dir, y: -175 + sway + duckOffsetY };

            ctx.strokeStyle = 'rgba(0, 245, 212, 0.85)';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(18 * dir, -170 + sway + duckOffsetY, 44, -Math.PI / 2, Math.PI / 2, dir < 0);
            ctx.stroke();
        } else if (this.state === 'hit') {
            ctx.translate(-dir * 12, 8);
        }

        // Render Gloves with White Hand Wraps (User Spec)
        [leftGlove, rightGlove].forEach(g => {
            // White Hand Wraps on Wrist
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(g.x - 14, g.y + 8, 28, 12);
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(g.x - 14, g.y + 8, 28, 12);

            // Glove Body
            ctx.fillStyle = '#1e293b';
            ctx.beginPath(); ctx.arc(g.x, g.y, 20, 0, Math.PI * 2); ctx.fill();

            // Red Cuff Trim
            ctx.fillStyle = '#d90429';
            ctx.fillRect(g.x - 12, g.y + 14, 24, 6);

            // White Brand Label
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(g.x - 8, g.y - 6, 16, 6);
        });

        ctx.restore();
    }
}

// --------------------------------------------------------------------------
// 4. MAIN GAME CONTROLLER
// --------------------------------------------------------------------------
class RealBoxingGame {
    constructor() {
        this.container = document.getElementById('ringWrapper');
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.selectedFighterId = 'iron_spike';
        this.selectedGenderFilter = 'all';
        this.difficulty = 'medium';
        this.gameMode = 'quick';

        this.tournamentRound = 1;
        this.tournamentOpponents = ['viper_valkyrie', 'thunder_punch', 'titaness_apex'];

        this.player = null;
        this.enemy = null;

        this.time = 60;
        this.round = 1;
        this.refereeCount = 0;
        this.gameOver = false;
        this.isPaused = false;
        this.cameraShake = 0;

        this.timerInterval = null;
        this.aiInterval = null;
        this.lastTime = 0;

        this.keys = {};
        this.particles = [];
        this.cameraFlashes = [];

        this.unlockedLevels = parseInt(localStorage.getItem('boxing_unlocked_levels') || '1');
        this.levelStars = JSON.parse(localStorage.getItem('boxing_level_stars') || '{}');
        this.playerCoins = parseInt(localStorage.getItem('boxing_player_coins') || '1500');
        this.currentCampaignLevel = 1;

        this.initDOM();
        this.resizeCanvasHD();
        this.updateCoinsDisplay();
        this.renderFighterSelect();
        this.renderLevelSelect();
        this.setupEventListeners();
        window.addEventListener('resize', () => this.resizeCanvasHD());
    }

    updateCoinsDisplay() {
        const coinElem = document.getElementById('coinText');
        if (coinElem) coinElem.textContent = this.playerCoins.toLocaleString();
    }

    initDOM() {
        this.screens = {
            mainMenuScreen: document.getElementById('mainMenuScreen'),
            selectScreen: document.getElementById('selectScreen'),
            levelSelectScreen: document.getElementById('levelSelectScreen'),
            tournamentScreen: document.getElementById('tournamentScreen'),
            gameScreen: document.getElementById('gameScreen')
        };
    }

    filterLevelRange(rangeStr) {
        this.selectedLevelRange = rangeStr;
        document.querySelectorAll('.level-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.range === rangeStr);
        });
        this.renderLevelSelect();
    }

    getCampaignLevelConfig(levelNum) {
        if (levelNum <= 100) {
            return CAMPAIGN_LEVELS.find(l => l.level === levelNum) || CAMPAIGN_LEVELS[0];
        }
        // Dynamic Infinity Level Generator (Level 101+)
        const oppId = OPPONENT_IDS[(levelNum - 1) % OPPONENT_IDS.length];
        return {
            level: levelNum,
            name: `INFINITY LEVEL ${levelNum} ♾️`,
            opponentId: oppId,
            diff: 'god',
            rewardCoins: levelNum * 600,
            isInfinity: true
        };
    }

    renderLevelSelect() {
        const grid = document.getElementById('levelGrid');
        if (!grid) return;
        grid.innerHTML = '';

        const rangeStr = this.selectedLevelRange || '1-20';
        let levelList = [];

        if (rangeStr === 'infinity') {
            const maxInf = Math.max(101, (this.unlockedLevels > 100 ? this.unlockedLevels + 5 : 105));
            for (let l = 101; l <= maxInf; l++) {
                levelList.push(this.getCampaignLevelConfig(l));
            }
        } else {
            const [minL, maxL] = rangeStr.split('-').map(Number);
            levelList = CAMPAIGN_LEVELS.filter(l => l.level >= minL && l.level <= maxL);
        }

        levelList.forEach(lvl => {
            const isUnlocked = lvl.level <= this.unlockedLevels || (lvl.level > 100 && this.unlockedLevels >= 100);
            const starsCount = this.levelStars[lvl.level] || 0;
            const starsText = isUnlocked ? ('⭐'.repeat(starsCount) + '☆'.repeat(3 - starsCount)) : '🔒 LOCKED';
            const opp = FIGHTERS.find(f => f.id === lvl.opponentId) || FIGHTERS[0];

            const card = document.createElement('div');
            card.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            if (isUnlocked) card.onclick = () => this.startLevelMatch(lvl.level);

            const isGodBoss = lvl.level === 100;
            const isInf = lvl.level > 100;

            if (isGodBoss) {
                card.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.35), rgba(217, 4, 41, 0.45))';
                card.style.borderColor = '#ffd700';
            } else if (isInf) {
                card.style.background = 'linear-gradient(135deg, rgba(123, 44, 191, 0.35), rgba(0, 245, 212, 0.25))';
                card.style.borderColor = '#00f5d4';
            }

            card.innerHTML = `
                <div class="level-number">${isGodBoss ? '👑 LEVEL 100 GOD' : (isInf ? `♾️ LEVEL ${lvl.level}` : 'LEVEL ' + lvl.level)}</div>
                <div style="font-size: 2.2rem; margin: 4px 0;">${isUnlocked ? opp.avatar : '🔒'}</div>
                <div class="level-opponent-name">${lvl.name}</div>
                <div class="level-opponent-title">${opp.name} (${lvl.diff.toUpperCase()})</div>
                <div class="level-stars">${starsText}</div>
                <div style="font-size: 0.75rem; color: #ffd700; font-weight: bold; margin-top: 4px;">REWARD: +${lvl.rewardCoins} COINS</div>
            `;
            grid.appendChild(card);
        });
    }

    startLevelMatch(levelNum) {
        if (levelNum > this.unlockedLevels && !(levelNum > 100 && this.unlockedLevels >= 100)) return;
        this.currentCampaignLevel = levelNum;
        this.gameMode = 'levels';

        const lvlConfig = this.getCampaignLevelConfig(levelNum);
        this.setDifficulty(lvlConfig.diff);

        // Auto-switch to range tab containing levelNum
        if (levelNum <= 20) this.selectedLevelRange = '1-20';
        else if (levelNum <= 40) this.selectedLevelRange = '21-40';
        else if (levelNum <= 60) this.selectedLevelRange = '41-60';
        else if (levelNum <= 80) this.selectedLevelRange = '61-80';
        else if (levelNum <= 100) this.selectedLevelRange = '81-100';
        else this.selectedLevelRange = 'infinity';

        this.startMatch(lvlConfig.opponentId);
    }

    startInfinityMode() {
        const startLvl = Math.max(101, this.unlockedLevels >= 100 ? this.unlockedLevels : 101);
        this.selectedLevelRange = 'infinity';
        this.startLevelMatch(startLvl);
    }

    filterGender(gender) {
        this.selectedGenderFilter = gender;
        document.querySelectorAll('.gender-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.gender === gender);
        });
        this.renderFighterSelect();
    }

    renderFighterSelect() {
        const grid = document.getElementById('fightersGrid');
        if (!grid) return;
        grid.innerHTML = '';

        const filtered = FIGHTERS.filter(f => {
            if (this.selectedGenderFilter === 'all') return true;
            return f.gender === this.selectedGenderFilter;
        });

        filtered.forEach(f => {
            const card = document.createElement('div');
            card.className = `fighter-card ${f.id === this.selectedFighterId ? 'selected' : ''}`;
            card.onclick = () => this.selectFighter(f.id);

            const genderBadge = f.gender === 'female' ? '<span class="gender-tag female">♀ FEMALE</span>' : '<span class="gender-tag male">♂ MALE</span>';

            card.innerHTML = `
                ${genderBadge}
                <div class="card-avatar">${f.avatar}</div>
                <div class="card-name">${f.name}</div>
                <div class="card-style" style="color: #00f5d4; font-weight: 800; font-size: 0.8rem; letter-spacing: 1px; margin-top: 4px; text-transform: uppercase;">${f.styleType}</div>
                <div class="card-title">${f.title}</div>
                <div class="card-stats">
                    <div class="stat-bar-group">
                        <div class="stat-label"><span>POWER</span> <span>${f.power}</span></div>
                        <div class="stat-track"><div class="stat-fill" style="width: ${(f.power / 25) * 100}%; background: #ff0054;"></div></div>
                    </div>
                    <div class="stat-bar-group">
                        <div class="stat-label"><span>SPEED</span> <span>${f.speed}x</span></div>
                        <div class="stat-track"><div class="stat-fill" style="width: ${(f.speed / 1.5) * 100}%; background: #00f5d4;"></div></div>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    selectFighter(id) {
        this.selectedFighterId = id;
        this.renderFighterSelect();
    }

    setDifficulty(diff) {
        this.difficulty = diff;
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.diff === diff);
        });
    }

    showScreen(screenId, mode = null) {
        if (mode) this.gameMode = mode;

        let targetId = screenId;
        if (!targetId.endsWith('Screen')) targetId += 'Screen';

        Object.values(this.screens).forEach(s => {
            if (s) s.classList.remove('active');
        });

        const targetScreen = this.screens[targetId] || document.getElementById(targetId);
        if (targetScreen) targetScreen.classList.add('active');

        if (targetId === 'tournamentScreen') this.updateTournamentBracket();
    }

    updateTournamentBracket() {
        const p1Elem = document.getElementById('t-p1');
        if (p1Elem) p1Elem.textContent = `You (${FIGHTERS.find(f => f.id === this.selectedFighterId).name})`;
        document.getElementById('t-p2').textContent = FIGHTERS.find(f => f.id === this.tournamentOpponents[0]).name;
        document.getElementById('t-p3').textContent = FIGHTERS.find(f => f.id === this.tournamentOpponents[1]).name;
        document.getElementById('t-p4').textContent = FIGHTERS.find(f => f.id === this.tournamentOpponents[2]).name;
    }

    confirmFighterSelection() {
        if (this.gameMode === 'tournament') {
            this.tournamentRound = 1;
            this.showScreen('tournamentScreen');
        } else {
            this.startMatch();
        }
    }

    startTournamentMatch() {
        this.startMatch();
    }

    startInstantMatch() {
        this.gameMode = 'quick';
        this.selectedFighterId = 'iron_spike';
        this.startMatch('viper_valkyrie');
    }

    startPracticeMode() {
        this.gameMode = 'practice';
        this.selectedFighterId = 'iron_spike';
        this.startMatch('thunder_punch');
    }

    startMatch(customOpponentId = null) {
        audio.init();
        audio.startBGM();

        const pData = FIGHTERS.find(f => f.id === this.selectedFighterId) || FIGHTERS[0];
        let eData = customOpponentId ? FIGHTERS.find(f => f.id === customOpponentId) : null;

        if (!eData) {
            if (this.gameMode === 'tournament') {
                eData = FIGHTERS.find(f => f.id === this.tournamentOpponents[this.tournamentRound - 1]);
            } else {
                const choices = FIGHTERS.filter(f => f.id !== this.selectedFighterId);
                eData = choices[Math.floor(Math.random() * choices.length)];
            }
        }

        this.player = new RealHumanFighter(pData, true);
        this.enemy = new RealHumanFighter(eData, false);

        // Ensure 100% Equal Power & Stats for Enemy (Same Power, Health, Speed, Defense as Player)
        this.enemy.data.power = this.player.data.power;
        this.enemy.data.maxHealth = this.player.data.maxHealth;
        this.enemy.health = this.player.maxHealth;
        this.enemy.maxHealth = this.player.maxHealth;
        this.enemy.data.speed = this.player.data.speed;
        this.enemy.data.defense = this.player.data.defense;

        this.time = 60;
        this.round = 1;
        this.refereeCount = 0;
        this.gameOver = false;
        this.isPaused = false;

        document.getElementById('p1Name').textContent = this.player.data.name;
        document.getElementById('p1Title').textContent = `${this.player.data.styleType} • ${this.player.data.title}`;
        document.getElementById('p1Avatar').textContent = this.player.data.avatar;

        document.getElementById('p2Name').textContent = this.enemy.data.name;
        document.getElementById('p2Title').textContent = `${this.enemy.data.styleType} • ${this.enemy.data.title}`;
        document.getElementById('p2Avatar').textContent = this.enemy.data.avatar;

        document.getElementById('roundBadge').textContent = `ROUND ${this.round}`;
        document.getElementById('timer').textContent = this.time;

        this.updateHUD();
        this.showScreen('gameScreen');

        this.showAnnouncement(`ROUND ${this.round}`, 'FIGHT!');
        audio.playBell();

        this.startTimers();
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    startTimers() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.aiInterval) clearInterval(this.aiInterval);

        this.timerInterval = setInterval(() => {
            if (this.gameOver || this.isPaused) return;

            if (this.player.state === 'down' || this.enemy.state === 'down') {
                this.refereeCount++;
                this.showAnnouncement(`COUNT: ${this.refereeCount}`, 'GET UP!');

                // Enemy AI Gets Up ONCE on 1st Knockdown
                if (this.enemy.state === 'down' && this.enemy.knockdowns === 1 && this.refereeCount >= 5) {
                    this.enemy.health = 35;
                    this.enemy.stamina = 80;
                    this.enemy.state = 'idle';
                    this.refereeCount = 0;
                    this.showAnnouncement('ENEMY GOT UP! 🥊', 'FIGHT ON!');
                    this.updateHUD();
                } else if (this.refereeCount >= 10) {
                    if (this.player.state === 'down') this.player.state = 'ko';
                    if (this.enemy.state === 'down') this.enemy.state = 'ko';
                    this.checkWinner();
                }
            } else {
                this.refereeCount = 0;
                if (this.gameMode !== 'practice') {
                    this.time--;
                    document.getElementById('timer').textContent = this.time;
                    if (this.time <= 0) this.handleRoundExpiration();
                }
            }
        }, 1000);

        const aiSpeed = { easy: 1400, medium: 950, hard: 550, champ: 350 }[this.difficulty] || 950;
        this.aiInterval = setInterval(() => {
            if (!this.gameOver && !this.isPaused && this.enemy) this.runAI();
        }, aiSpeed);
    }

    runAI() {
        if (!this.enemy || this.enemy.state === 'ko' || this.enemy.state === 'down') return;

        const dx = this.player.x - this.enemy.x;
        const dy = this.player.y - this.enemy.y;
        const dist = Math.hypot(dx, dy);
        const rand = Math.random();

        // 1. Equal First Defense: When player initiates first attack, enemy uses player-symmetric block or duck
        if (this.player.state === 'jab' || this.player.state === 'heavy' || this.player.state === 'super') {
            if (rand < 0.5) {
                this.enemy.block(); // High Guard Defense
            } else if (rand < 0.8) {
                this.enemy.duck();  // Ducking Slip Defense
            } else {
                this.enemy.move2D(dx > 0 ? -1 : 1, 0); // Backstep Slip
            }
            return;
        }

        // 2. Equal First Attack: In strike distance (dist <= 135px), initiate symmetric Jab or Heavy Hook
        if (dist <= 135) {
            if (rand < 0.45) {
                if (this.enemy.jab()) {
                    this.checkAttackCollision(this.enemy, this.player, this.enemy.data.power);
                }
            } else if (rand < 0.75) {
                if (this.enemy.heavy()) {
                    this.checkAttackCollision(this.enemy, this.player, this.enemy.data.power * 1.6);
                }
            } else {
                this.enemy.block();
            }
        } else {
            // Move into range in 2D space
            const dirX = dx > 0 ? 1 : -1;
            const dirY = dy > 0 ? 1 : -1;
            this.enemy.move2D(dirX, dirY);
        }
    }

    handlePlayerInput() {
        if (this.gameOver || this.isPaused || !this.player) return;

        if (this.player.state === 'down') {
            if (this.keys['j'] || this.keys['J'] || this.keys['k'] || this.keys['K']) {
                this.player.tryGetUp();
            }
            return;
        }

        let dirX = 0;
        let dirY = 0;
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) dirX -= 1;
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) dirX += 1;
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) dirY -= 1;
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) dirY += 1;

        if (dirX !== 0 || dirY !== 0) {
            this.player.move2D(dirX, dirY);
        }
    }

    performPlayerAction(action) {
        if (this.gameOver || this.isPaused || !this.player) return;

        if (this.player.state === 'down') {
            this.player.tryGetUp();
            return;
        }

        if (action === 'jab') {
            if (this.player.jab()) this.checkAttackCollision(this.player, this.enemy, this.player.data.power);
        } else if (action === 'heavy') {
            if (this.player.heavy()) this.checkAttackCollision(this.player, this.enemy, this.player.data.power * 1.6);
        } else if (action === 'super') {
            if (this.player.superAttack()) {
                this.checkAttackCollision(this.player, this.enemy, this.player.data.power * 2.5);
                this.cameraShake = 20;
            }
        } else if (action === 'block') {
            this.player.block();
        } else if (action === 'duck') {
            this.player.duck();
        }
    }

    checkAttackCollision(attacker, defender, damage) {
        const dist = Math.hypot(attacker.x - defender.x, attacker.y - defender.y);
        if (dist < 140) {
            defender.takeDamage(damage, attacker);
            this.createHitSparks(defender.x, defender.y - 110, 18);
            if (damage > 18) this.cameraShake = 16;
            this.showComboBanner(attacker);
            this.updateHUD();
            this.checkWinner();
        } else {
            attacker.stats.currentCombo = 0;
        }
    }

    createHitSparks(x, y, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 380,
                vy: (Math.random() - 0.5) * 380,
                life: 0.35,
                color: ['#00f5d4', '#ff0054', '#ffb703', '#ffffff'][Math.floor(Math.random() * 4)]
            });
        }
    }

    showComboBanner(attacker) {
        const banner = document.getElementById('comboBanner');
        if (attacker.stats.currentCombo > 1) {
            banner.textContent = `${attacker.stats.currentCombo}x COMBO! 🔥`;
            banner.classList.add('show');
            setTimeout(() => banner.classList.remove('show'), 1200);
        }
    }

    updateHUD() {
        if (!this.player || !this.enemy) return;

        const p1HpPct = (this.player.health / this.player.maxHealth) * 100;
        document.getElementById('p1HealthBar').style.width = `${p1HpPct}%`;
        document.getElementById('p1HealthText').textContent = `${Math.ceil(this.player.health)} HP`;
        document.getElementById('p1StaminaBar').style.width = `${this.player.stamina}%`;
        document.getElementById('p1SuperBar').style.width = `${this.player.superMeter}%`;

        const p2HpPct = (this.enemy.health / this.enemy.maxHealth) * 100;
        document.getElementById('p2HealthBar').style.width = `${p2HpPct}%`;
        document.getElementById('p2HealthText').textContent = `${Math.ceil(this.enemy.health)} HP`;
        document.getElementById('p2StaminaBar').style.width = `${this.enemy.stamina}%`;
        document.getElementById('p2SuperBar').style.width = `${this.enemy.superMeter}%`;
    }

    showAnnouncement(title, subtitle) {
        const overlay = document.getElementById('announcerOverlay');
        if (!overlay) return;
        document.getElementById('announcerTitle').textContent = title;
        document.getElementById('announcerSub').textContent = subtitle;

        overlay.classList.add('show');
        setTimeout(() => overlay.classList.remove('show'), 1800);
    }

    handleRoundExpiration() {
        if (this.gameOver) return;

        if (this.round < 3) {
            this.showAnnouncement(`ROUND ${this.round} OVER`, 'REST & GET READY!');
            audio.playBell();
            this.round++;
            this.time = 60;

            this.player.stamina = 100;
            this.enemy.stamina = 100;
            this.updateHUD();

            setTimeout(() => {
                document.getElementById('roundBadge').textContent = `ROUND ${this.round}`;
                document.getElementById('timer').textContent = this.time;
                this.showAnnouncement(`ROUND ${this.round}`, 'FIGHT!');
                audio.playBell();
            }, 3000);
        } else {
            this.checkWinner(true);
        }
    }

    checkWinner(timeOut = false) {
        if (this.gameOver) return;

        let winner = null;
        if (this.enemy.state === 'ko') winner = 'player';
        else if (this.player.state === 'ko') winner = 'enemy';
        else if (timeOut) {
            if (this.player.health > this.enemy.health) winner = 'player';
            else if (this.enemy.health > this.player.health) winner = 'enemy';
            else winner = 'draw';
        }

        if (winner) {
            this.gameOver = true;
            audio.playBell();
            const winTitle = winner === 'player' ? (timeOut ? 'DECISION WIN!' : 'KNOCKOUT!') : (timeOut ? 'DECISION LOSS' : 'KNOCKOUT!');
            this.showAnnouncement(winTitle, winner === 'player' ? 'YOU WIN!' : 'YOU LOSE!');
            setTimeout(() => this.showResultModal(winner), 2200);
        }
    }

    showResultModal(winner) {
        const modal = document.getElementById('resultModal');
        const icon = document.getElementById('resultIcon');
        const title = document.getElementById('resultTitle');
        const sub = document.getElementById('resultSubtitle');
        const nextBtn = document.getElementById('btnNextTournament');

        document.getElementById('statPunches').textContent = this.player.stats.punches;
        const acc = this.player.stats.punches > 0 ? Math.round((this.player.stats.hitsLanded / this.player.stats.punches) * 100) : 0;
        document.getElementById('statAccuracy').textContent = `${acc}%`;
        document.getElementById('statMaxCombo').textContent = `${this.player.stats.maxCombo}x`;
        document.getElementById('statDamage').textContent = this.player.stats.damageDealt;

        if (winner === 'player') {
            const rewardCoins = (this.gameMode === 'levels') ? (this.getCampaignLevelConfig(this.currentCampaignLevel).rewardCoins) : 500;
            this.playerCoins += rewardCoins;
            localStorage.setItem('boxing_player_coins', this.playerCoins.toString());
            this.updateCoinsDisplay();

            icon.textContent = '🏆';
            title.textContent = 'VICTORY!';
            sub.textContent = `Real Champion Performance! (+${rewardCoins} Coins)`;
            audio.playCheer();

            if (this.gameMode === 'levels') {
                const hpPct = this.player.health / this.player.maxHealth;
                const starsEarned = hpPct > 0.75 ? 3 : (hpPct > 0.4 ? 2 : 1);
                this.levelStars[this.currentCampaignLevel] = Math.max(this.levelStars[this.currentCampaignLevel] || 0, starsEarned);

                if (this.currentCampaignLevel === this.unlockedLevels && this.unlockedLevels < 100) {
                    this.unlockedLevels++;
                    localStorage.setItem('boxing_unlocked_levels', this.unlockedLevels.toString());
                }
                localStorage.setItem('boxing_level_stars', JSON.stringify(this.levelStars));
                this.renderLevelSelect();

                nextBtn.style.display = 'block';
                if (this.currentCampaignLevel < 100) {
                    sub.textContent = `Level ${this.currentCampaignLevel} Cleared! (${'⭐'.repeat(starsEarned)})`;
                    nextBtn.textContent = `PLAY LEVEL ${this.currentCampaignLevel + 1} ⭐`;
                } else {
                    title.textContent = 'SUPREME GOD OF BOXING! 👑';
                    sub.textContent = 'You conquered ALL 100 LEVELS & defeated the God of Boxing!';
                    nextBtn.textContent = 'CLAIM GOD CROWN 👑';
                }
            } else if (this.gameMode === 'tournament') {
                nextBtn.style.display = 'block';
                if (this.tournamentRound < 3) {
                    nextBtn.textContent = 'NEXT TOURNAMENT MATCH 🥊';
                } else {
                    title.textContent = 'TOURNAMENT CHAMPION!';
                    sub.textContent = 'You won the Gold Championship Belt!';
                    nextBtn.textContent = 'CLAIM BELT 🏆';
                }
            } else nextBtn.style.display = 'none';
        } else {
            icon.textContent = '💔';
            title.textContent = 'DEFEATED!';
            sub.textContent = 'Better luck next time!';
            nextBtn.style.display = 'none';
        }

        modal.classList.add('active');
    }

    handleResultContinue() {
        document.getElementById('resultModal').classList.remove('active');
        if (this.gameMode === 'levels') {
            if (this.currentCampaignLevel < 100 && this.player && this.player.health > 0) {
                this.startLevelMatch(this.currentCampaignLevel + 1);
            } else {
                this.showScreen('levelSelectScreen');
            }
        } else if (this.gameMode === 'tournament') {
            if (this.tournamentRound < 3 && this.player.health > 0) {
                this.tournamentRound++;
                this.showScreen('tournamentScreen');
            } else this.showScreen('mainMenuScreen');
        } else this.startMatch();
    }

    togglePause() {
        if (this.gameOver) return;
        this.isPaused = !this.isPaused;
        document.getElementById('pauseModal').classList.toggle('active', this.isPaused);
    }

    restartMatch() {
        document.getElementById('pauseModal').classList.remove('active');
        document.getElementById('resultModal').classList.remove('active');
        this.startMatch();
    }

    exitToMenu() {
        document.getElementById('pauseModal').classList.remove('active');
        document.getElementById('resultModal').classList.remove('active');
        audio.stopBGM();
        this.showScreen('mainMenuScreen');
    }

    gameLoop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;

        if (!this.isPaused && !this.gameOver) {
            this.handlePlayerInput();
            if (this.player) this.player.update(dt);
            if (this.enemy) this.enemy.update(dt);

            if (Math.random() < 0.08) {
                this.cameraFlashes.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * 140,
                    life: 0.15
                });
            }

            for (let i = this.cameraFlashes.length - 1; i >= 0; i--) {
                this.cameraFlashes[i].life -= dt;
                if (this.cameraFlashes[i].life <= 0) this.cameraFlashes.splice(i, 1);
            }

            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.life -= dt;
                if (p.life <= 0) this.particles.splice(i, 1);
            }

            if (this.cameraShake > 0) this.cameraShake -= dt * 60;
        }

        this.drawScene();

        if (this.screens.gameScreen.classList.contains('active')) {
            requestAnimationFrame((t) => this.gameLoop(t));
        }
    }

    resizeCanvasHD() {
        if (!this.canvas) return;
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = 960 * dpr;
        this.canvas.height = 460 * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    drawScene() {
        const ctx = this.ctx;
        const w = 960;
        const h = 460;

        ctx.save();
        if (this.cameraShake > 0) {
            const shakeX = (Math.random() - 0.5) * this.cameraShake;
            const shakeY = (Math.random() - 0.5) * this.cameraShake;
            ctx.translate(shakeX, shakeY);
        }

        ctx.clearRect(0, 0, w, h);

        // HD Stadium Background & Audience Glow
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#040711');
        bgGrad.addColorStop(1, '#0c1322');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // 1. Stadium Audience Crowd Rows (Surrounding Arena)
        ctx.fillStyle = '#0f172a';
        for (let i = 20; i < w; i += 28) {
            const waveY = Math.sin((performance.now() * 0.005) + i) * 3;
            // Back Audience Silhouettes
            ctx.beginPath(); ctx.arc(i, 110 + waveY, 10, 0, Math.PI * 2); ctx.fill();
            ctx.fillRect(i - 8, 120 + waveY, 16, 25);

            // Waving arms
            if (i % 56 === 0) {
                ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.moveTo(i - 6, 122 + waveY); ctx.lineTo(i - 14, 105 + waveY); ctx.stroke();
            }
        }

        // Audience Camera Flashes
        this.cameraFlashes.forEach(flash => {
            const flashGrad = ctx.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, 18);
            flashGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            flashGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = flashGrad;
            ctx.beginPath();
            ctx.arc(flash.x, flash.y, 18, 0, Math.PI * 2);
            ctx.fill();
        });

        // HD Radial Spotlights
        const spot1 = ctx.createLinearGradient(120, 0, 320, h);
        spot1.addColorStop(0, 'rgba(0, 245, 212, 0.12)');
        spot1.addColorStop(1, 'rgba(0, 245, 212, 0.01)');
        ctx.fillStyle = spot1;
        ctx.beginPath();
        ctx.moveTo(120, 0); ctx.lineTo(400, h); ctx.lineTo(240, h); ctx.closePath(); ctx.fill();

        const spot2 = ctx.createLinearGradient(840, 0, 640, h);
        spot2.addColorStop(0, 'rgba(255, 0, 84, 0.12)');
        spot2.addColorStop(1, 'rgba(255, 0, 84, 0.01)');
        ctx.fillStyle = spot2;
        ctx.beginPath();
        ctx.moveTo(840, 0); ctx.lineTo(560, h); ctx.lineTo(720, h); ctx.closePath(); ctx.fill();

        // 2. HD Ring Canvas Floor Perspective
        const floorGrad = ctx.createLinearGradient(0, 240, 0, h);
        floorGrad.addColorStop(0, '#1e293b');
        floorGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = floorGrad;
        ctx.beginPath();
        ctx.moveTo(70, 240); ctx.lineTo(890, 240); ctx.lineTo(940, 430); ctx.lineTo(20, 430); ctx.closePath();
        ctx.fill();

        // Ring Apron Border Line
        ctx.fillStyle = '#d90429';
        ctx.fillRect(20, 430, 920, 10);

        // 3. 4-Sided Net & Corner Posts
        // Back Net Mesh Line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        for (let x = 70; x <= 890; x += 15) {
            ctx.beginPath(); ctx.moveTo(x, 150); ctx.lineTo(x, 240); ctx.stroke();
        }
        [150, 180, 210, 240].forEach(y => {
            ctx.strokeStyle = '#38b000'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(70, y); ctx.lineTo(890, y); ctx.stroke();
        });

        // Left & Right Side Net Ropes
        [0, 1, 2].forEach(i => {
            const ly = 150 + i * 30;
            ctx.strokeStyle = '#38b000'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(70, ly); ctx.lineTo(20, 430 - (2 - i) * 30); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(890, ly); ctx.lineTo(940, 430 - (2 - i) * 30); ctx.stroke();
        });

        // 4 Turnbuckle Posts
        ctx.fillStyle = '#ff0054'; ctx.fillRect(60, 140, 18, 110); // Back Left Red
        ctx.fillStyle = '#00f5d4'; ctx.fillRect(882, 140, 18, 110); // Back Right Blue
        ctx.fillStyle = '#ffb703'; ctx.fillRect(10, 310, 22, 135); // Front Left Gold
        ctx.fillStyle = '#ffffff'; ctx.fillRect(928, 310, 22, 135); // Front Right White

        // Draw Referee
        const refX = (this.player.x + this.enemy.x) / 2;
        const refY = Math.min(this.player.y, this.enemy.y) - 30;
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(refX - 10, refY, 20, 45);
        ctx.fillStyle = '#000000';
        ctx.fillRect(refX - 8, refY, 4, 45); ctx.fillRect(refX + 4, refY, 4, 45);
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath(); ctx.arc(refX, refY - 12, 12, 0, Math.PI * 2); ctx.fill();

        // 4. Depth-Sorted Boxers (Go Everywhere in 2D Space)
        const fighters = [this.player, this.enemy].filter(Boolean).sort((a, b) => a.y - b.y);
        fighters.forEach(f => f.draw(ctx));

        // 5. Front Enclosure Ring Net Ropes (Drawn Over Fighters for 4-Sided Net Effect)
        [400, 415, 430].forEach(y => {
            ctx.strokeStyle = 'rgba(56, 176, 0, 0.9)';
            ctx.lineWidth = 5;
            ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(940, y); ctx.stroke();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(20, y - 1); ctx.lineTo(940, y - 1); ctx.stroke();
        });

        // Draw Particles
        this.particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
        });

        ctx.restore();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;

            if (e.key === 'j' || e.key === 'J' || e.key === 'z' || e.key === 'Z') this.performPlayerAction('jab');
            if (e.key === 'k' || e.key === 'K' || e.key === 'x' || e.key === 'X') this.performPlayerAction('heavy');
            if (e.key === 'l' || e.key === 'L' || e.key === 'c' || e.key === 'C') this.performPlayerAction('block');
            if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') this.performPlayerAction('duck');
            if (e.key === ' ' || e.key === 'w' || e.key === 'W') this.performPlayerAction('super');
            if (e.key === 'r' || e.key === 'R') this.restartMatch();
            if (e.key === 'Escape') this.togglePause();
        });

        window.addEventListener('keyup', (e) => this.keys[e.key] = false);

        const bindBtn = (id, action) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); this.performPlayerAction(action); });
            btn.addEventListener('mousedown', () => this.performPlayerAction(action));
        };

        bindBtn('btnJab', 'jab');
        bindBtn('btnHeavy', 'heavy');
        bindBtn('btnBlock', 'block');
        bindBtn('btnSuper', 'super');
        bindBtn('btnDuck', 'duck');

        const btnLeft = document.getElementById('btnLeft');
        const btnRight = document.getElementById('btnRight');
        if (btnLeft) {
            btnLeft.addEventListener('touchstart', () => { this.keys['ArrowLeft'] = true; });
            btnLeft.addEventListener('touchend', () => { this.keys['ArrowLeft'] = false; });
            btnLeft.addEventListener('mousedown', () => { this.keys['ArrowLeft'] = true; });
            btnLeft.addEventListener('mouseup', () => { this.keys['ArrowLeft'] = false; });
        }
        if (btnRight) {
            btnRight.addEventListener('touchstart', () => { this.keys['ArrowRight'] = true; });
            btnRight.addEventListener('touchend', () => { this.keys['ArrowRight'] = false; });
            btnRight.addEventListener('mousedown', () => { this.keys['ArrowRight'] = true; });
            btnRight.addEventListener('mouseup', () => { this.keys['ArrowRight'] = false; });
        }

        const soundBtn = document.getElementById('soundToggleBtn');
        if (soundBtn) {
            soundBtn.onclick = () => {
                const muted = audio.toggleMute();
                soundBtn.textContent = muted ? '🔇' : '🔊';
            };
        }

        const camBtn = document.getElementById('camToggleBtn');
        if (camBtn) {
            camBtn.onclick = () => {
                this.cameraShake = 12;
                audio.playWhoosh();
            };
        }

        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) pauseBtn.onclick = () => this.togglePause();
    }
    openShopModal() {
        const modal = document.getElementById('shopModal');
        if (modal) modal.classList.add('active');
    }

    closeShopModal() {
        const modal = document.getElementById('shopModal');
        if (modal) modal.classList.remove('active');
    }

    buyUpgrade(type, cost) {
        if (this.playerCoins < cost) {
            alert('Not enough coins! Win more matches to earn coins.');
            return;
        }
        this.playerCoins -= cost;
        localStorage.setItem('boxing_player_coins', this.playerCoins.toString());
        this.updateCoinsDisplay();

        if (this.player) {
            if (type === 'power') this.player.data.power += 2;
            else if (type === 'speed') this.player.data.speed += 0.1;
            else if (type === 'defense') this.player.data.defense += 2;
            else if (type === 'health') {
                this.player.maxHealth += 15;
                this.player.health += 15;
            }
        }
        audio.playCheer();
        alert(`Upgrade Successful! Improved ${type.toUpperCase()}`);
    }

    openTrophyModal() {
        const modal = document.getElementById('trophyModal');
        if (!modal) return;

        document.getElementById('hallMatches').textContent = Math.max(1, this.unlockedLevels * 2).toString();
        document.getElementById('hallKOs').textContent = Math.max(0, this.unlockedLevels - 1).toString();
        document.getElementById('hallInfinity').textContent = `Level ${this.unlockedLevels}`;
        document.getElementById('hallCoins').textContent = `${this.playerCoins.toLocaleString()} 🪙`;

        modal.classList.add('active');
    }

    closeTrophyModal() {
        const modal = document.getElementById('trophyModal');
        if (modal) modal.classList.remove('active');
    }
}

// Global functions for HTML onClick attributes
function showScreen(id, mode) {
    if (window.boxingGame) window.boxingGame.showScreen(id, mode);
}

function filterGender(gender) {
    if (window.boxingGame) window.boxingGame.filterGender(gender);
}

function filterLevelRange(rangeStr) {
    if (window.boxingGame) window.boxingGame.filterLevelRange(rangeStr);
}

function startInstantMatch() {
    if (window.boxingGame) window.boxingGame.startInstantMatch();
}

function startInfinityMode() {
    if (window.boxingGame) window.boxingGame.startInfinityMode();
}

function startPracticeMode() {
    if (window.boxingGame) window.boxingGame.startPracticeMode();
}

function confirmFighterSelection() {
    if (window.boxingGame) window.boxingGame.confirmFighterSelection();
}

function startTournamentMatch() {
    if (window.boxingGame) window.boxingGame.startTournamentMatch();
}

function setDifficulty(diff) {
    if (window.boxingGame) window.boxingGame.setDifficulty(diff);
}

function togglePause() {
    if (window.boxingGame) window.boxingGame.togglePause();
}

function restartMatch() {
    if (window.boxingGame) window.boxingGame.restartMatch();
}

function exitToMenu() {
    if (window.boxingGame) window.boxingGame.exitToMenu();
}

function handleResultContinue() {
    if (window.boxingGame) window.boxingGame.handleResultContinue();
}

function openShopModal() {
    if (window.boxingGame) window.boxingGame.openShopModal();
}

function closeShopModal() {
    if (window.boxingGame) window.boxingGame.closeShopModal();
}

function buyUpgrade(type, cost) {
    if (window.boxingGame) window.boxingGame.buyUpgrade(type, cost);
}

function openTrophyModal() {
    if (window.boxingGame) window.boxingGame.openTrophyModal();
}

function closeTrophyModal() {
    if (window.boxingGame) window.boxingGame.closeTrophyModal();
}

window.addEventListener('DOMContentLoaded', () => {
    window.boxingGame = new RealBoxingGame();
});
