/**
 * BootScene - Loading screen with progress bar
 * Loads all game assets
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create loading UI
        this.createLoadingScreen();

        // ====== PLAYER SPRITESHEETS ======
        this.load.spritesheet('player-idle', 'material/Assets/PNG/spritesheets/player/idle.png', {
            frameWidth: 37, frameHeight: 32
        });
        this.load.spritesheet('player-skip', 'material/Assets/PNG/spritesheets/player/skip.png', {
            frameWidth: 37, frameHeight: 32
        });
        this.load.spritesheet('player-jump', 'material/Assets/PNG/spritesheets/player/jump.png', {
            frameWidth: 37, frameHeight: 32
        });
        this.load.spritesheet('player-fall', 'material/Assets/PNG/spritesheets/player/fall.png', {
            frameWidth: 37, frameHeight: 32
        });
        this.load.spritesheet('player-hurt', 'material/Assets/PNG/spritesheets/player/hurt.png', {
            frameWidth: 37, frameHeight: 32
        });
        this.load.spritesheet('player-climb', 'material/Assets/PNG/spritesheets/player/climb.png', {
            frameWidth: 37, frameHeight: 32
        });
        this.load.spritesheet('player-duck', 'material/Assets/PNG/spritesheets/player/duck.png', {
            frameWidth: 37, frameHeight: 32
        });

        // ====== ENEMY SPRITESHEETS ======
        this.load.spritesheet('bee', 'material/Assets/PNG/spritesheets/enemies/bee.png', {
            frameWidth: 37, frameHeight: 39
        });
        this.load.spritesheet('slug', 'material/Assets/PNG/spritesheets/enemies/slug.png', {
            frameWidth: 32, frameHeight: 21
        });
        this.load.spritesheet('piranha-plant', 'material/Assets/PNG/spritesheets/enemies/piranha-plant.png', {
            frameWidth: 61, frameHeight: 45
        });
        this.load.spritesheet('piranha-plant-attack', 'material/Assets/PNG/spritesheets/enemies/piranha-plant-attack.png', {
            frameWidth: 61, frameHeight: 45
        });

        // ====== MISC SPRITESHEETS ======
        this.load.spritesheet('carrot', 'material/Assets/PNG/spritesheets/misc/carrot.png', {
            frameWidth: 17, frameHeight: 19
        });
        this.load.spritesheet('star', 'material/Assets/PNG/spritesheets/misc/star.png', {
            frameWidth: 13, frameHeight: 13
        });
        this.load.spritesheet('enemy-death', 'material/Assets/PNG/spritesheets/misc/enemy-death.png', {
            frameWidth: 31, frameHeight: 29
        });
        this.load.spritesheet('chest', 'material/Assets/PNG/spritesheets/misc/chest.png', {
            frameWidth: 36, frameHeight: 25
        });
        this.load.spritesheet('hud-sprites', 'material/Assets/PNG/spritesheets/misc/hud.png', {
            frameWidth: 14, frameHeight: 11
        });

        // ====== ENVIRONMENT ======
        this.load.image('bg-layer', 'material/Assets/PNG/environment/layers/background.png');
        this.load.image('mg-layer', 'material/Assets/PNG/environment/layers/middleground.png');
        this.load.image('tileset-img', 'material/Assets/PNG/environment/layers/tileset.png');
        this.load.image('props-sheet', 'material/Assets/PNG/environment/layers/props.png');
        this.load.image('sky-background', 'src/assets/backgrounds/sky_background.png');
        this.load.image('level-two-bg', 'material/Assets/PNG/environment/layers/level_two_background.png');

        // ====== ENVIRONMENT PROPS ======
        this.load.image('house', 'material/Assets/PNG/environment/props/house.png');
        this.load.image('tree', 'material/Assets/PNG/environment/props/tree.png');
        this.load.image('rock', 'material/Assets/PNG/environment/props/rock.png');
        this.load.image('plant', 'material/Assets/PNG/environment/props/plant.png');
        this.load.image('mushroom-red', 'material/Assets/PNG/environment/props/mushroom-red.png');
        this.load.image('mushroom-brown', 'material/Assets/PNG/environment/props/mushroom-brown.png');
        this.load.image('vine', 'material/Assets/PNG/environment/props/vine.png');

        // ====== INDIVIDUAL SPRITES FOR MENU ======
        this.load.image('player-idle-1', 'material/Assets/PNG/sprites/player/player-idle/player-idle-1.png');
    }

    createLoadingScreen() {
        const { width, height } = this.cameras.main;

        // Background gradient
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
        bg.fillRect(0, 0, width, height);

        // Title text
        const titleText = this.add.text(width / 2, height / 2 - 80, '🥕 Jornada da Coelha 🐰', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '16px',
            color: '#FFD700',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(width / 2, height / 2 - 50, 'O Segredo das Cenouras', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#FF8C00',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // GameTech credit
        this.add.text(width / 2, height / 2 - 30, 'Desenvolvido pela GameTech', {
            fontFamily: '"Outfit", sans-serif',
            fontSize: '12px',
            color: '#87CEEB',
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Progress bar background
        const barBg = this.add.graphics();
        barBg.fillStyle(0x333333, 1);
        barBg.fillRoundedRect(width / 2 - 160, height / 2, 320, 30, 8);
        barBg.lineStyle(2, 0x666666, 1);
        barBg.strokeRoundedRect(width / 2 - 160, height / 2, 320, 30, 8);

        // Progress bar fill
        const barFill = this.add.graphics();

        // Loading text
        const loadingText = this.add.text(width / 2, height / 2 + 50, 'Carregando... 0%', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#AAAAAA',
            align: 'center'
        }).setOrigin(0.5);

        // Tips while loading
        const tips = [
            'Colete cenouras para ganhar pontos!',
            'Cuidado com as abelhas!',
            'Pule nas cabeças dos inimigos!',
            'Encontre power-ups escondidos!',
            'Luna precisa de sua ajuda!'
        ];

        const tipText = this.add.text(width / 2, height / 2 + 80, '💡 ' + tips[0], {
            fontFamily: '"Outfit", sans-serif',
            fontSize: '14px',
            color: '#888888',
            align: 'center'
        }).setOrigin(0.5);

        let tipIndex = 0;
        this.time.addEvent({
            delay: 2000,
            loop: true,
            callback: () => {
                tipIndex = (tipIndex + 1) % tips.length;
                tipText.setText('💡 ' + tips[tipIndex]);
            }
        });

        // Progress events
        this.load.on('progress', (value) => {
            barFill.clear();
            barFill.fillStyle(0xFF8C00, 1);
            barFill.fillRoundedRect(width / 2 - 157, height / 2 + 3, 314 * value, 24, 6);

            // Add glow effect
            barFill.fillStyle(0xFFD700, 0.3);
            barFill.fillRoundedRect(width / 2 - 157, height / 2 + 3, 314 * value, 12, 6);

            loadingText.setText(`Carregando... ${Math.round(value * 100)}%`);
        });

        this.load.on('complete', () => {
            loadingText.setText('Pronto!');

            // Pulse the title
            this.tweens.add({
                targets: titleText,
                scale: 1.1,
                duration: 500,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    this.createAnimations();
                    this.scene.start('MenuScene');
                }
            });
        });
    }

    createAnimations() {
        // ====== PLAYER ANIMATIONS ======
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player-idle', { start: 0, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player-skip', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('player-skip', { start: 0, end: 7 }),
            frameRate: 14,
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('player-jump', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: 0
        });

        this.anims.create({
            key: 'fall',
            frames: this.anims.generateFrameNumbers('player-fall', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'hurt',
            frames: this.anims.generateFrameNumbers('player-hurt', { start: 0, end: 1 }),
            frameRate: 8,
            repeat: 0
        });

        this.anims.create({
            key: 'climb',
            frames: this.anims.generateFrameNumbers('player-climb', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'duck',
            frames: this.anims.generateFrameNumbers('player-duck', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: 0
        });

        // ====== ENEMY ANIMATIONS ======
        this.anims.create({
            key: 'bee-fly',
            frames: this.anims.generateFrameNumbers('bee', { start: 0, end: 7 }),
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: 'slug-move',
            frames: this.anims.generateFrameNumbers('slug', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'piranha-idle',
            frames: this.anims.generateFrameNumbers('piranha-plant', { start: 0, end: 4 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'piranha-attack',
            frames: this.anims.generateFrameNumbers('piranha-plant-attack', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: 0
        });

        // ====== ITEMS ANIMATIONS ======
        this.anims.create({
            key: 'carrot-spin',
            frames: this.anims.generateFrameNumbers('carrot', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'star-spin',
            frames: this.anims.generateFrameNumbers('star', { start: 0, end: 5 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'chest-open',
            frames: this.anims.generateFrameNumbers('chest', { start: 0, end: 1 }),
            frameRate: 4,
            repeat: 0
        });

        this.anims.create({
            key: 'enemy-die',
            frames: this.anims.generateFrameNumbers('enemy-death', { start: 0, end: 5 }),
            frameRate: 12,
            repeat: 0
        });
    }
}
