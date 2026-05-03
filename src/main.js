/**
 * Jornada da Coelha: O Segredo das Cenouras
 * Main Entry Point
 * 
 * Engine: Phaser 3
 * Type: 2D Platformer
 */

// Game Configuration
const GAME_CONFIG = {
    // Game dimensions (16:9 landscape)
    WIDTH: 800,
    HEIGHT: 480,

    // Physics
    GRAVITY: 800,

    // Player
    PLAYER_SPEED: 160,
    PLAYER_RUN_SPEED: 240,
    PLAYER_JUMP_FORCE: -380,
    PLAYER_MAX_LIVES: 3,

    // Enemies
    ENEMY_SPEED: 60,
    ENEMY_DETECTION_RANGE: 150,

    // Power-ups
    SPEED_BOOST_DURATION: 5000,
    JUMP_BOOST_DURATION: 5000,

    // Levels
    TOTAL_LEVELS: 3,

    // Tile size
    TILE_SIZE: 32,

    // Scale factor for sprites
    SPRITE_SCALE: 2.5
};

// Game State Manager
const GameState = {
    score: 0,
    lives: GAME_CONFIG.PLAYER_MAX_LIVES,
    currentLevel: 1,
    maxLevelReached: 1,
    powerUps: {
        speed: false,
        jump: false
    },
    carrots: 0,
    totalCarrots: 0,
    isMuted: false,
    isPaused: false,

    reset() {
        this.score = 0;
        this.lives = GAME_CONFIG.PLAYER_MAX_LIVES;
        this.carrots = 0;
        this.powerUps = { speed: false, jump: false };
        this.isPaused = false;
    },

    save() {
        const data = {
            maxLevelReached: this.maxLevelReached,
            totalCarrots: this.totalCarrots,
            isMuted: this.isMuted
        };
        try {
            localStorage.setItem('jornada-coelha-save', JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save progress:', e);
        }
    },

    load() {
        try {
            const data = JSON.parse(localStorage.getItem('jornada-coelha-save'));
            if (data) {
                this.maxLevelReached = data.maxLevelReached || 1;
                this.totalCarrots = data.totalCarrots || 0;
                this.isMuted = data.isMuted || false;
            }
        } catch (e) {
            console.warn('Could not load progress:', e);
        }
    }
};

// Phaser Game Configuration
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_CONFIG.WIDTH,
        height: GAME_CONFIG.HEIGHT,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: GAME_CONFIG.GRAVITY },
            debug: false,
            tileBias: 16
        }
    },
    scene: [BootScene, MenuScene, CharacterSelectScene, GameScene, UIScene],
    input: {
        activePointers: 4
    },
    render: {
        pixelArt: true,
        antialias: false
    },
    backgroundColor: '#87CEEB'
};

// Initialize game
const game = new Phaser.Game(config);

// Request fullscreen on first touch (mobile)
function requestFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => { });
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
    // Lock screen orientation to landscape
    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => { });
    }
}

document.addEventListener('touchstart', () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) requestFullscreen();
});
document.addEventListener('click', () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) requestFullscreen();
});

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('Service Worker registered:', reg.scope))
            .catch(err => console.warn('Service Worker registration failed:', err));
    });
}

// Load saved progress
GameState.load();

