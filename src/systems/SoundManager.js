/**
 * SoundManager - Procedural Audio System
 * Generates all game sounds using Web Audio API
 * No external audio files needed!
 */
class SoundManager {
    constructor() {
        this.ctx = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.musicOscillators = [];
        this.isMusicPlaying = false;
        this.musicInterval = null;

        this.init();
    }

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();

            // Master gain
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.ctx.destination);

            // Music gain
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.15;
            this.musicGain.connect(this.masterGain);

            // SFX gain
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.4;
            this.sfxGain.connect(this.masterGain);

        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMuted(muted) {
        if (this.masterGain) {
            this.masterGain.gain.value = muted ? 0 : 0.5;
        }
    }

    // =====================
    // SOUND EFFECTS
    // =====================

    /**
     * Jump sound - short rising tone
     */
    playJump() {
        if (!this.ctx || GameState.isMuted) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.15);
    }

    /**
     * Collect carrot - cheerful ding
     */
    playCollect() {
        if (!this.ctx || GameState.isMuted) return;
        this.resume();

        const notes = [523, 659, 784]; // C5, E5, G5
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'square';
            osc.frequency.value = freq;

            const startTime = this.ctx.currentTime + i * 0.06;
            gain.gain.setValueAtTime(0.2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(startTime);
            osc.stop(startTime + 0.12);
        });
    }

    /**
     * Collect star - sparkly sound  
     */
    playStar() {
        if (!this.ctx || GameState.isMuted) return;
        this.resume();

        const notes = [880, 1100, 1320, 1760]; // A5 up
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            const startTime = this.ctx.currentTime + i * 0.05;
            gain.gain.setValueAtTime(0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(startTime);
            osc.stop(startTime + 0.15);
        });
    }

    /**
     * Attack sound - quick swoosh
     */
    playAttack() {
        if (!this.ctx || GameState.isMuted) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.12);

        // Add noise for swoosh
        const bufferSize = this.ctx.sampleRate * 0.1;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        noise.connect(noiseGain);
        noiseGain.connect(this.sfxGain);
        noise.start(this.ctx.currentTime);
    }

    /**
     * Player hurt sound - low thud
     */
    playHurt() {
        if (!this.ctx || GameState.isMuted) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.25);
    }

    /**
     * Enemy death sound - pop
     */
    playEnemyDeath() {
        if (!this.ctx || GameState.isMuted) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.15);
    }

    /**
     * Power-up acquired
     */
    playPowerUp() {
        if (!this.ctx || GameState.isMuted) return;
        this.resume();

        const notes = [392, 494, 587, 784]; // G4, B4, D5, G5
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'square';
            osc.frequency.value = freq;

            const t = this.ctx.currentTime + i * 0.08;
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(t);
            osc.stop(t + 0.2);
        });
    }

    /**
     * Chest open - magical reveal
     */
    playChestOpen() {
        if (!this.ctx || GameState.isMuted) return;
        this.resume();

        const notes = [262, 330, 392, 523, 659, 784]; // C4 to G5 arpeggio
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            const t = this.ctx.currentTime + i * 0.07;
            gain.gain.setValueAtTime(0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(t);
            osc.stop(t + 0.25);
        });
    }

    /**
     * Level complete fanfare
     */
    playLevelComplete() {
        if (!this.ctx || GameState.isMuted) return;
        this.resume();

        const melody = [
            { freq: 523, dur: 0.15 },  // C5
            { freq: 587, dur: 0.15 },  // D5
            { freq: 659, dur: 0.15 },  // E5
            { freq: 784, dur: 0.3 },   // G5
            { freq: 659, dur: 0.15 },  // E5
            { freq: 784, dur: 0.5 },   // G5
        ];

        let time = this.ctx.currentTime;
        melody.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'square';
            osc.frequency.value = note.freq;

            gain.gain.setValueAtTime(0.2, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + note.dur);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(time);
            osc.stop(time + note.dur);
            time += note.dur;
        });
    }

    /**
     * Game over sound - sad descending tones
     */
    playGameOver() {
        if (!this.ctx || GameState.isMuted) return;
        this.resume();

        const melody = [
            { freq: 392, dur: 0.3 },
            { freq: 349, dur: 0.3 },
            { freq: 330, dur: 0.3 },
            { freq: 262, dur: 0.6 }
        ];

        let time = this.ctx.currentTime;
        melody.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.value = note.freq;

            gain.gain.setValueAtTime(0.2, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + note.dur);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(time);
            osc.stop(time + note.dur);
            time += note.dur;
        });
    }

    /**
     * Menu select / button click
     */
    playMenuSelect() {
        if (!this.ctx || GameState.isMuted) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(500, this.ctx.currentTime);
        osc.frequency.setValueAtTime(700, this.ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.1);
    }

    // =====================
    // BACKGROUND MUSIC
    // =====================

    /**
     * Start background music - procedural chiptune loop
     */
    startMusic() {
        if (!this.ctx || GameState.isMuted || this.isMusicPlaying) return;
        this.resume();
        this.isMusicPlaying = true;

        // Simple adventure melody using a looping pattern
        const melody = [
            // Bar 1
            262, 330, 392, 523,
            392, 330, 262, 330,
            // Bar 2
            349, 440, 523, 659,
            523, 440, 349, 440,
            // Bar 3
            294, 370, 440, 587,
            440, 370, 294, 370,
            // Bar 4
            262, 330, 392, 523,
            659, 523, 392, 523,
        ];

        const bassLine = [
            131, 131, 175, 175,
            147, 147, 196, 196,
            165, 165, 220, 220,
            131, 131, 175, 175,
        ];

        let noteIndex = 0;
        let bassIndex = 0;
        const tempo = 180; // ms per note

        this.musicInterval = setInterval(() => {
            if (GameState.isMuted || !this.isMusicPlaying) return;

            const t = this.ctx.currentTime;

            // Melody
            const melOsc = this.ctx.createOscillator();
            const melGain = this.ctx.createGain();
            melOsc.type = 'square';
            melOsc.frequency.value = melody[noteIndex % melody.length];
            melGain.gain.setValueAtTime(0.08, t);
            melGain.gain.exponentialRampToValueAtTime(0.01, t + tempo / 1000 * 0.9);
            melOsc.connect(melGain);
            melGain.connect(this.musicGain);
            melOsc.start(t);
            melOsc.stop(t + tempo / 1000);

            // Bass (every 2 notes)
            if (noteIndex % 2 === 0) {
                const bassOsc = this.ctx.createOscillator();
                const bassGainNode = this.ctx.createGain();
                bassOsc.type = 'triangle';
                bassOsc.frequency.value = bassLine[bassIndex % bassLine.length];
                bassGainNode.gain.setValueAtTime(0.12, t);
                bassGainNode.gain.exponentialRampToValueAtTime(0.01, t + tempo / 1000 * 1.8);
                bassOsc.connect(bassGainNode);
                bassGainNode.connect(this.musicGain);
                bassOsc.start(t);
                bassOsc.stop(t + tempo / 1000 * 2);
                bassIndex++;
            }

            noteIndex++;
        }, tempo);
    }

    /**
     * Stop background music
     */
    stopMusic() {
        this.isMusicPlaying = false;
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }

    /**
     * Clean up
     */
    destroy() {
        this.stopMusic();
        if (this.ctx) {
            this.ctx.close();
        }
    }
}

// Global sound manager instance
const soundManager = new SoundManager();
