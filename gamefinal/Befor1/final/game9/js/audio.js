/**
 * Procedural Web Audio API Sound Engine
 * Generates dynamic battle royale SFX without external asset dependencies
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    unlock() {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Plasma Rifle Shot
    playPlasmaShot() {
        if (!this.ctx || !this.enabled) return;
        this.init();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    // Shotgun Boom
    playShotgunShot() {
        if (!this.ctx || !this.enabled) return;
        this.init();

        const now = this.ctx.currentTime;

        // Low boom frequency
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);

        oscGain.gain.setValueAtTime(0.5, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        // Noise burst
        const bufferSize = this.ctx.sampleRate * 0.2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(1000, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(100, now + 0.2);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.4, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        osc.start(now);
        noise.start(now);
        osc.stop(now + 0.25);
        noise.stop(now + 0.25);
    }

    // Hyperion Sniper Crack
    playSniperShot() {
        if (!this.ctx || !this.enabled) return;
        this.init();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
    }

    // Hit Marker Ping
    playHitMarker() {
        if (!this.ctx || !this.enabled) return;
        this.init();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    // Reload Click
    playReload() {
        if (!this.ctx || !this.enabled) return;
        this.init();

        const now = this.ctx.currentTime;

        // 2 quick clicks
        [0, 0.15].forEach(delay => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now + delay);
            osc.frequency.exponentialRampToValueAtTime(200, now + delay + 0.04);

            gain.gain.setValueAtTime(0.2, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.04);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + delay);
            osc.stop(now + delay + 0.04);
        });
    }

    // Loot Pickup Chime
    playPickup() {
        if (!this.ctx || !this.enabled) return;
        this.init();

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);

            gain.gain.setValueAtTime(0.2, now + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.1);
        });
    }

    // Heal Medkit SFX
    playHeal() {
        if (!this.ctx || !this.enabled) return;
        this.init();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.4);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.45);
    }

    // Hurt / Damage SFX
    playHurt() {
        if (!this.ctx || !this.enabled) return;
        this.init();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    // Gloo Wall Deployment SFX
    playGlooWall() {
        if (!this.ctx || !this.enabled) return;
        this.init();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.45);
    }

    // Victory Fanfare
    playVictory() {
        if (!this.ctx || !this.enabled) return;
        this.init();

        const now = this.ctx.currentTime;
        const chord = [440, 554.37, 659.25, 880]; // A major
        chord.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 1.2);
        });
    }

    // Free Fire Emotes Synthesized Audio
    playEmoteSound(type) {
        if (!this.ctx || !this.enabled) return;
        this.init();

        const now = this.ctx.currentTime;
        if (type === 'booyah') {
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.1);
                gain.gain.setValueAtTime(0.3, now + idx * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.1);
                osc.stop(now + idx * 0.1 + 0.35);
            });
        } else if (type === 'lol') {
            [0, 0.12, 0.24, 0.36].forEach(delay => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(600, now + delay);
                osc.frequency.exponentialRampToValueAtTime(300, now + delay + 0.08);
                gain.gain.setValueAtTime(0.25, now + delay);
                gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + delay);
                osc.stop(now + delay + 0.08);
            });
        } else if (type === 'heart') {
            [1318.51, 1567.98, 1975.53, 2637.02].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                gain.gain.setValueAtTime(0.2, now + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.25);
            });
        } else if (type === 'pushup') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.exponentialRampToValueAtTime(240, now + 0.3);
            gain.gain.setValueAtTime(0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.35);
        } else if (type === 'throne') {
            [130.81, 196.00, 261.63, 329.63].forEach(freq => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, now);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 1.5);
            });
        } else if (type === 'clap') {
            [0, 0.15, 0.3, 0.45].forEach(delay => {
                const bufferSize = this.ctx.sampleRate * 0.05;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
                const noise = this.ctx.createBufferSource();
                noise.buffer = buffer;
                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.25, now + delay);
                gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.04);
                noise.connect(gain);
                gain.connect(this.ctx.destination);
                noise.start(now + delay);
            });
        }
    }
}

const audioManager = new SoundEngine();
