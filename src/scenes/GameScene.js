/**
 * GameScene - Main gameplay scene
 * Handles level creation, gameplay loop, and all game mechanics
 */
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Reset state from previous runs
        this.levelComplete = false;
        this.isPaused = false;

        // Reset physics world bounds for level
        this.levelWidth = 4000;
        this.levelHeight = height;
        this.physics.world.setBounds(0, 0, this.levelWidth, this.levelHeight);

        // ====== CREATE PARALLAX BACKGROUND ======
        this.createBackground();

        // ====== CREATE PLATFORMS ======
        this.platforms = this.physics.add.staticGroup();
        this.createLevel(GameState.currentLevel);

        // ====== CREATE PLAYER ======
        this.playerSystem = new Player(this, 100, this.levelHeight - 150);
        this.playerSystem.sprite.setDepth(10);

        // ====== CREATE ENEMIES ======
        this.enemyAI = new EnemyAI(this);
        this.spawnEnemies(GameState.currentLevel);

        // ====== CREATE ITEMS ======
        this.carrots = this.physics.add.group();
        this.stars = this.physics.add.group();
        this.chests = this.physics.add.group();
        this.spawnItems(GameState.currentLevel);

        // ====== COMBAT SYSTEM ======
        this.combatSystem = new CombatSystem(this, this.playerSystem, this.enemyAI);

        // ====== COLLISION SYSTEM ======
        this.collisionSystem = new CollisionSystem(this);
        this.setupCollisions();

        // ====== HUD ======
        this.hud = new HUD(this);

        // ====== CAMERA ======
        this.cameras.main.setBounds(0, 0, this.levelWidth, this.levelHeight);
        this.cameras.main.startFollow(this.playerSystem.sprite, true, 0.08, 0.08);
        this.cameras.main.setDeadzone(100, 50);

        // ====== INPUT ======
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = {
            w: this.input.keyboard.addKey('W'),
            a: this.input.keyboard.addKey('A'),
            s: this.input.keyboard.addKey('S'),
            d: this.input.keyboard.addKey('D'),
            z: this.input.keyboard.addKey('Z'),
            x: this.input.keyboard.addKey('X'),
            shift: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
            esc: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
            p: this.input.keyboard.addKey('P')
        };

        // ====== MOBILE CONTROLS ======
        this.mobileControls = { moveDir: 0, jumping: false, attacking: false };
        if (this.sys.game.device.input.touch) {
            this.createMobileControls();
        }

        // ====== PAUSE ======
        this.isPaused = false;
        this.keys.esc.on('down', () => this.togglePause());
        this.keys.p.on('down', () => this.togglePause());

        // ====== DEATH ZONE ======
        this.deathZone = this.add.rectangle(this.levelWidth / 2, this.levelHeight + 50, this.levelWidth, 50, 0x000000, 0);
        this.physics.add.existing(this.deathZone, true);
        this.physics.add.overlap(this.playerSystem.sprite, this.deathZone, () => {
            if (!this.playerSystem.isDead) {
                this.playerSystem.die();
            }
        });

        // ====== LEVEL EXIT ======
        this.createLevelExit();

        // ====== EVENTS ======
        this.events.on('player-died', () => this.handlePlayerDeath());
        this.events.on('boss-defeated', () => this.handleBossDefeated());
        this.events.on('score-updated', () => this.hud.update());
        this.events.on('player-hurt', () => this.hud.update());

        // ====== LEVEL START BANNER ======
        const levelNames = ['🌳 Floresta Verde', '🕳️ Caverna Sombria', '🏰 Torre do Vilão'];
        this.hud.showLevelBanner(levelNames[GameState.currentLevel - 1] || 'Nível ' + GameState.currentLevel);

        // ====== START MUSIC ======
        soundManager.resume();
        this.time.delayedCall(1000, () => soundManager.startMusic());

        // Camera fade in
        this.cameras.main.fadeIn(1000, 0, 0, 0);
    }

    // ==========================================
    // BACKGROUND
    // ==========================================
    createBackground() {
        // Select background based on level
        const isLevel2 = GameState.currentLevel === 2;
        const bgLayerKey = isLevel2 ? 'level-two-bg' : 'bg-layer';

        // Sky gradient setup
        if (!isLevel2) {
            const skyBg = this.add.image(0, 0, 'sky-background');
            skyBg.setOrigin(0, 0);
            skyBg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
            skyBg.setScrollFactor(0);
            skyBg.setDepth(-10);
        } else {
            // Dark solid background for level 2
            const darkBg = this.add.rectangle(0, 0, this.levelWidth, this.levelHeight, 0x051024);
            darkBg.setOrigin(0, 0);
            darkBg.setScrollFactor(0);
            darkBg.setDepth(-10);
        }

        // Parallax background layer
        const bgScale = this.levelHeight / 240;
        const bgTilesNeeded = Math.ceil(this.levelWidth / (192 * bgScale)) + 2;
        for (let i = 0; i < bgTilesNeeded; i++) {
            // level-two-bg is likely larger
            const imgWidth = isLevel2 ? 1024 : 192;
            const bgTilesNeededAdjusted = Math.ceil(this.levelWidth / (imgWidth * bgScale)) + 2;
            if (i >= bgTilesNeededAdjusted) continue;

            const bg = this.add.image(i * imgWidth * bgScale, this.levelHeight, bgLayerKey);
            bg.setOrigin(0, 1);
            bg.setScale(bgScale);
            bg.setAlpha(isLevel2 ? 1 : 0.5);
            bg.setScrollFactor(0.2);
            bg.setDepth(-8);
        }

        // Middleground parallax layer
        const mgScale = this.levelHeight / 240;
        const mgTilesNeeded = Math.ceil(this.levelWidth / (384 * mgScale)) + 2;
        for (let i = 0; i < mgTilesNeeded; i++) {
            const mg = this.add.image(i * 384 * mgScale, this.levelHeight, 'mg-layer');
            mg.setOrigin(0, 1);
            mg.setScale(mgScale);
            mg.setAlpha(0.6);
            mg.setScrollFactor(0.4);
            mg.setDepth(-6);
        }

        // Decorative props scattered in background
        this.addBackgroundProps();
    }

    addBackgroundProps() {
        const propPositions = [
            { key: 'tree', x: 200, y: this.levelHeight - 100, scale: 1.5, scrollFactor: 0.5 },
            { key: 'tree', x: 800, y: this.levelHeight - 100, scale: 1.8, scrollFactor: 0.5 },
            { key: 'house', x: 1500, y: this.levelHeight - 110, scale: 1.2, scrollFactor: 0.5 },
            { key: 'tree', x: 2200, y: this.levelHeight - 100, scale: 1.6, scrollFactor: 0.5 },
            { key: 'tree', x: 3000, y: this.levelHeight - 100, scale: 2, scrollFactor: 0.5 },
            { key: 'house', x: 3500, y: this.levelHeight - 110, scale: 1.3, scrollFactor: 0.5 },
        ];

        propPositions.forEach(prop => {
            const img = this.add.image(prop.x, prop.y, prop.key);
            img.setScale(prop.scale);
            img.setAlpha(0.5);
            img.setScrollFactor(prop.scrollFactor);
            img.setDepth(-4);
            img.setOrigin(0.5, 1);
        });
    }

    // ==========================================
    // LEVEL CREATION
    // ==========================================
    createLevel(level) {
        const ts = GAME_CONFIG.TILE_SIZE;

        // Ground base - extends the entire width
        this.createGround(ts);

        // Level specific platforms
        switch (level) {
            case 1: this.createLevel1Platforms(ts); break;
            case 2: this.createLevel2Platforms(ts); break;
            case 3: this.createLevel3Platforms(ts); break;
            default: this.createLevel1Platforms(ts); break;
        }
    }

    createGround(ts) {
        // Create ground using graphics (green grass on brown dirt)
        for (let x = 0; x < this.levelWidth; x += ts) {
            // Leave some gaps for challenge
            if (this.hasGroundGap(x)) continue;

            const ground = this.createPlatformTile(x, this.levelHeight - ts, ts, ts);

            // Add second layer of dirt below
            this.createPlatformTile(x, this.levelHeight, ts, ts, 0x5a3a1a);
        }
    }

    hasGroundGap(x) {
        const level = GameState.currentLevel;
        const gaps = {
            1: [[800, 900], [1600, 1700], [2500, 2600]],
            2: [[600, 750], [1300, 1500], [2000, 2150], [2800, 2950]],
            3: [[500, 700], [1100, 1350], [1800, 2050], [2600, 2850]]
        };

        const levelGaps = gaps[level] || gaps[1];
        return levelGaps.some(gap => x >= gap[0] && x <= gap[1]);
    }

    createPlatformTile(x, y, w, h, color = null) {
        const platform = this.add.rectangle(x + w / 2, y + h / 2, w, h, color || 0x4a8c3f);
        this.physics.add.existing(platform, true);
        this.platforms.add(platform);

        // Add grass top visual
        if (!color) {
            const grass = this.add.rectangle(x + w / 2, y + 4, w, 8, 0x6fbf5e);
            grass.setDepth(2);
        }

        return platform;
    }

    createFloatingPlatform(x, y, width) {
        const ts = GAME_CONFIG.TILE_SIZE;
        const numTiles = Math.ceil(width / ts);

        for (let i = 0; i < numTiles; i++) {
            const tileX = x + i * ts;
            const platform = this.add.rectangle(tileX + ts / 2, y + ts / 2, ts, ts, 0x6b4226);
            this.physics.add.existing(platform, true);
            this.platforms.add(platform);

            // Grass top
            const grass = this.add.rectangle(tileX + ts / 2, y + 4, ts, 8, 0x4a8c3f);
            grass.setDepth(2);

            // Dark bottom edge
            const bottom = this.add.rectangle(tileX + ts / 2, y + ts - 2, ts, 4, 0x3a2a1a);
            bottom.setDepth(2);
        }
    }

    createLevel1Platforms(ts) {
        // Level 1: Floresta Verde - Easy, introductory

        // Floating platforms
        this.createFloatingPlatform(300, this.levelHeight - 120, 128);
        this.createFloatingPlatform(500, this.levelHeight - 200, 96);
        this.createFloatingPlatform(700, this.levelHeight - 160, 128);

        // Bridge over gap
        this.createFloatingPlatform(820, this.levelHeight - 100, 64);

        this.createFloatingPlatform(1000, this.levelHeight - 140, 160);
        this.createFloatingPlatform(1200, this.levelHeight - 220, 96);
        this.createFloatingPlatform(1400, this.levelHeight - 180, 128);

        // Bridge over second gap
        this.createFloatingPlatform(1620, this.levelHeight - 90, 64);

        this.createFloatingPlatform(1800, this.levelHeight - 150, 192);
        this.createFloatingPlatform(2000, this.levelHeight - 250, 96);
        this.createFloatingPlatform(2100, this.levelHeight - 180, 128);
        this.createFloatingPlatform(2300, this.levelHeight - 140, 160);

        // Bridge over third gap
        this.createFloatingPlatform(2520, this.levelHeight - 80, 64);

        this.createFloatingPlatform(2700, this.levelHeight - 160, 192);
        this.createFloatingPlatform(2900, this.levelHeight - 230, 128);
        this.createFloatingPlatform(3100, this.levelHeight - 170, 160);
        this.createFloatingPlatform(3300, this.levelHeight - 120, 128);
        this.createFloatingPlatform(3500, this.levelHeight - 200, 192);

        // Decorative terrain mushrooms and plants
        this.addTerrainDecorations();
    }

    createLevel2Platforms(ts) {
        // Level 2: Caverna Sombria - Harder, more gaps and enemies

        // Tighter platforms requiring more precision
        this.createFloatingPlatform(250, this.levelHeight - 130, 96);
        this.createFloatingPlatform(400, this.levelHeight - 200, 64);
        this.createFloatingPlatform(520, this.levelHeight - 270, 96);

        // Over first gap
        this.createFloatingPlatform(650, this.levelHeight - 120, 96);

        this.createFloatingPlatform(850, this.levelHeight - 180, 128);
        this.createFloatingPlatform(1000, this.levelHeight - 240, 64);
        this.createFloatingPlatform(1100, this.levelHeight - 300, 96);
        this.createFloatingPlatform(1250, this.levelHeight - 200, 128);

        // Over second gap
        this.createFloatingPlatform(1380, this.levelHeight - 100, 64);

        this.createFloatingPlatform(1550, this.levelHeight - 170, 192);
        this.createFloatingPlatform(1700, this.levelHeight - 250, 64);
        this.createFloatingPlatform(1800, this.levelHeight - 320, 96);
        this.createFloatingPlatform(1950, this.levelHeight - 240, 128);

        // Over third gap
        this.createFloatingPlatform(2080, this.levelHeight - 110, 64);

        this.createFloatingPlatform(2200, this.levelHeight - 180, 160);
        this.createFloatingPlatform(2400, this.levelHeight - 260, 96);
        this.createFloatingPlatform(2600, this.levelHeight - 150, 192);

        // Over fourth gap
        this.createFloatingPlatform(2830, this.levelHeight - 90, 64);

        this.createFloatingPlatform(3000, this.levelHeight - 200, 192);
        this.createFloatingPlatform(3200, this.levelHeight - 280, 128);
        this.createFloatingPlatform(3400, this.levelHeight - 160, 160);
        this.createFloatingPlatform(3600, this.levelHeight - 120, 128);

        this.addTerrainDecorations();
    }

    createLevel3Platforms(ts) {
        // Level 3: Torre do Vilão - Boss level

        // Build up to boss arena
        this.createFloatingPlatform(200, this.levelHeight - 120, 128);
        this.createFloatingPlatform(380, this.levelHeight - 200, 96);
        this.createFloatingPlatform(520, this.levelHeight - 280, 64);

        this.createFloatingPlatform(660, this.levelHeight - 160, 128);
        this.createFloatingPlatform(850, this.levelHeight - 230, 96);
        this.createFloatingPlatform(1000, this.levelHeight - 300, 128);
        this.createFloatingPlatform(1200, this.levelHeight - 180, 192);

        // Boss arena - larger flat area
        this.createFloatingPlatform(1500, this.levelHeight - 120, 320);
        this.createFloatingPlatform(1500, this.levelHeight - 250, 96);
        this.createFloatingPlatform(1700, this.levelHeight - 300, 96);

        // After boss area
        this.createFloatingPlatform(2000, this.levelHeight - 150, 192);
        this.createFloatingPlatform(2250, this.levelHeight - 200, 128);
        this.createFloatingPlatform(2450, this.levelHeight - 280, 96);

        this.createFloatingPlatform(2600, this.levelHeight - 160, 192);
        this.createFloatingPlatform(2850, this.levelHeight - 240, 128);
        this.createFloatingPlatform(3100, this.levelHeight - 180, 192);
        this.createFloatingPlatform(3350, this.levelHeight - 140, 160);
        this.createFloatingPlatform(3550, this.levelHeight - 200, 128);

        this.addTerrainDecorations();
    }

    addTerrainDecorations() {
        // Add decorative mushrooms, plants, rocks along ground
        const decorations = [
            { key: 'mushroom-red', positions: [150, 350, 700, 1100, 1900, 2200, 2800, 3300] },
            { key: 'mushroom-brown', positions: [250, 550, 950, 1400, 2000, 2600, 3100] },
            { key: 'plant', positions: [100, 400, 800, 1200, 1700, 2100, 2700, 3200, 3600] },
            { key: 'rock', positions: [180, 600, 1050, 1550, 2300, 2900, 3400] }
        ];

        decorations.forEach(deco => {
            deco.positions.forEach(x => {
                if (!this.hasGroundGap(x)) {
                    const sprite = this.add.image(x, this.levelHeight - GAME_CONFIG.TILE_SIZE - 5, deco.key);
                    sprite.setScale(GAME_CONFIG.SPRITE_SCALE * 0.8);
                    sprite.setOrigin(0.5, 1);
                    sprite.setDepth(3);
                }
            });
        });
    }

    // ==========================================
    // ENEMY SPAWNING
    // ==========================================
    spawnEnemies(level) {
        switch (level) {
            case 1:
                this.enemyAI.createSlug(500, this.levelHeight - 70, 80);
                this.enemyAI.createSlug(1000, this.levelHeight - 70, 100);
                this.enemyAI.createBee(700, this.levelHeight - 200, 100);
                this.enemyAI.createSlug(1500, this.levelHeight - 70, 120);
                this.enemyAI.createBee(1800, this.levelHeight - 220, 80);
                this.enemyAI.createSlug(2200, this.levelHeight - 70, 100);
                this.enemyAI.createPiranhaPlant(2800, this.levelHeight - 65);
                this.enemyAI.createSlug(3100, this.levelHeight - 70, 100);
                this.enemyAI.createBee(3400, this.levelHeight - 180, 120);
                break;

            case 2:
                this.enemyAI.createSlug(300, this.levelHeight - 70, 80);
                this.enemyAI.createBee(500, this.levelHeight - 250, 100);
                this.enemyAI.createSlug(900, this.levelHeight - 70, 100);
                this.enemyAI.createBee(1100, this.levelHeight - 200, 120);
                this.enemyAI.createPiranhaPlant(1500, this.levelHeight - 65);
                this.enemyAI.createSlug(1700, this.levelHeight - 70, 80);
                this.enemyAI.createBee(1900, this.levelHeight - 280, 100);
                this.enemyAI.createSlug(2200, this.levelHeight - 70, 120);
                this.enemyAI.createPiranhaPlant(2500, this.levelHeight - 65);
                this.enemyAI.createBee(2700, this.levelHeight - 200, 100);
                this.enemyAI.createSlug(3000, this.levelHeight - 70, 100);
                this.enemyAI.createBee(3300, this.levelHeight - 180, 80);
                this.enemyAI.createPiranhaPlant(3500, this.levelHeight - 65);
                break;

            case 3:
                this.enemyAI.createSlug(300, this.levelHeight - 70, 60);
                this.enemyAI.createBee(500, this.levelHeight - 200, 80);
                this.enemyAI.createPiranhaPlant(800, this.levelHeight - 65);
                this.enemyAI.createSlug(1100, this.levelHeight - 70, 100);
                this.enemyAI.createBee(1300, this.levelHeight - 250, 100);

                // Boss in the arena
                this.enemyAI.createBoss(1650, this.levelHeight - 100);

                this.enemyAI.createSlug(2200, this.levelHeight - 70, 80);
                this.enemyAI.createBee(2500, this.levelHeight - 200, 120);
                this.enemyAI.createPiranhaPlant(2800, this.levelHeight - 65);
                this.enemyAI.createSlug(3100, this.levelHeight - 70, 100);
                this.enemyAI.createBee(3400, this.levelHeight - 180, 100);
                break;
        }

        // Setup collision with platforms for all enemies
        this.enemyAI.enemies.forEach(enemy => {
            this.physics.add.collider(enemy, this.platforms);
        });
    }

    // ==========================================
    // ITEM SPAWNING
    // ==========================================
    spawnItems(level) {
        // Spawn carrots throughout the level
        const carrotPositions = this.getCarrotPositions(level);
        carrotPositions.forEach(pos => {
            const carrot = this.carrots.create(pos.x, pos.y, 'carrot');
            carrot.setScale(GAME_CONFIG.SPRITE_SCALE);
            carrot.play('carrot-spin');
            carrot.body.setAllowGravity(false);
            carrot.body.setImmovable(true);
            carrot.setDepth(5);

            // Floating animation
            this.tweens.add({
                targets: carrot,
                y: pos.y - 8,
                duration: 1500 + Math.random() * 500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Carrot type (normal, speed, jump, points)
            carrot.carrotType = pos.type || 'normal';

            if (carrot.carrotType === 'speed') {
                carrot.setTint(0x00ffff);
            } else if (carrot.carrotType === 'jump') {
                carrot.setTint(0xff00ff);
            } else if (carrot.carrotType === 'points') {
                carrot.setTint(0xffff00);
            }
        });

        // Spawn stars
        const starPositions = this.getStarPositions(level);
        starPositions.forEach(pos => {
            const star = this.stars.create(pos.x, pos.y, 'star');
            star.setScale(GAME_CONFIG.SPRITE_SCALE);
            star.play('star-spin');
            star.body.setAllowGravity(false);
            star.body.setImmovable(true);
            star.setDepth(5);

            this.tweens.add({
                targets: star,
                y: pos.y - 6,
                duration: 1200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });

        // Spawn chests
        const chestPositions = this.getChestPositions(level);
        chestPositions.forEach(pos => {
            const chest = this.chests.create(pos.x, pos.y, 'chest');
            chest.setScale(GAME_CONFIG.SPRITE_SCALE);
            chest.body.setAllowGravity(false);
            chest.body.setImmovable(true);
            chest.setDepth(5);
            chest.isOpened = false;
        });
    }

    getCarrotPositions(level) {
        const h = this.levelHeight;
        const base = [];

        // Distribute carrots along the level
        for (let x = 200; x < this.levelWidth - 200; x += 150) {
            if (!this.hasGroundGap(x)) {
                base.push({ x, y: h - 80, type: 'normal' });
            }
        }

        // Add some elevated carrots
        const elevated = [
            { x: 350, y: h - 160, type: 'normal' },
            { x: 550, y: h - 240, type: 'normal' },
            { x: 1050, y: h - 180, type: 'normal' },
            { x: 1250, y: h - 260, type: 'normal' },
            { x: 1850, y: h - 200, type: 'normal' },
            { x: 2350, y: h - 180, type: 'normal' },
            { x: 2950, y: h - 270, type: 'normal' },
            { x: 3150, y: h - 210, type: 'normal' },
        ];

        // Power-up carrots (fewer)
        const powerUps = [
            { x: 800, y: h - 250, type: 'speed' },
            { x: 1600, y: h - 220, type: 'jump' },
            { x: 2400, y: h - 200, type: 'points' },
            { x: 3200, y: h - 250, type: 'speed' },
        ];

        return [...base, ...elevated, ...powerUps];
    }

    getStarPositions(level) {
        const h = this.levelHeight;
        return [
            { x: 400, y: h - 180 },
            { x: 900, y: h - 200 },
            { x: 1400, y: h - 250 },
            { x: 2000, y: h - 190 },
            { x: 2700, y: h - 220 },
            { x: 3300, y: h - 200 },
        ];
    }

    getChestPositions(level) {
        const h = this.levelHeight;
        return [
            { x: 600, y: h - 60 },
            { x: 1800, y: h - 60 },
            { x: 3000, y: h - 60 },
        ];
    }

    // ==========================================
    // COLLISIONS
    // ==========================================
    setupCollisions() {
        // Player vs platforms
        this.physics.add.collider(this.playerSystem.sprite, this.platforms);

        // Carrots collection
        this.physics.add.overlap(this.playerSystem.sprite, this.carrots, (player, carrot) => {
            this.collectCarrot(carrot);
        });

        // Stars collection
        this.physics.add.overlap(this.playerSystem.sprite, this.stars, (player, star) => {
            this.collectStar(star);
        });

        // Chest interaction
        this.physics.add.overlap(this.playerSystem.sprite, this.chests, (player, chest) => {
            this.openChest(chest);
        });
    }

    // ==========================================
    // ITEM COLLECTION
    // ==========================================
    collectCarrot(carrot) {
        if (!carrot.active) return;

        const carrotType = carrot.carrotType || 'normal';

        // Sound
        if (carrotType === 'normal') {
            soundManager.playCollect();
        } else {
            soundManager.playPowerUp();
        }

        // Score and effects based on type
        switch (carrotType) {
            case 'normal':
                GameState.score += 10;
                GameState.carrots++;
                break;
            case 'speed':
                GameState.score += 25;
                GameState.carrots++;
                this.playerSystem.applySpeedBoost();
                this.showPowerUpText(carrot.x, carrot.y, '⚡ VELOCIDADE!');
                break;
            case 'jump':
                GameState.score += 25;
                GameState.carrots++;
                this.playerSystem.applyJumpBoost();
                this.showPowerUpText(carrot.x, carrot.y, '🦘 SUPER PULO!');
                break;
            case 'points':
                GameState.score += 100;
                GameState.carrots++;
                this.showPowerUpText(carrot.x, carrot.y, '💰 BÔNUS x10!');
                break;
        }

        // Collection particles
        this.createCollectionEffect(carrot.x, carrot.y, 0xFF8C00);

        // Score popup
        this.hud.showScorePopup(carrot.x, carrot.y - 20, carrotType === 'points' ? 100 : (carrotType === 'normal' ? 10 : 25));

        // Remove carrot
        carrot.destroy();

        // Update HUD
        this.hud.update();
    }

    collectStar(star) {
        if (!star.active) return;

        soundManager.playStar();
        GameState.score += 50;

        // Star collection effect
        this.createCollectionEffect(star.x, star.y, 0xFFD700);
        this.hud.showScorePopup(star.x, star.y - 20, 50);

        star.destroy();
        this.hud.update();
    }

    openChest(chest) {
        if (!chest.active || chest.isOpened) return;

        chest.isOpened = true;
        chest.play('chest-open');
        soundManager.playChestOpen();

        // Reward
        GameState.score += 200;
        GameState.lives = Math.min(GameState.lives + 1, GAME_CONFIG.PLAYER_MAX_LIVES);

        // Spectacular effect
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            const sparkle = this.add.circle(
                chest.x, chest.y - 10,
                Phaser.Math.Between(2, 5),
                0xFFD700, 1
            );
            sparkle.setDepth(15);

            this.tweens.add({
                targets: sparkle,
                x: chest.x + Math.cos(angle) * 60,
                y: chest.y - 10 + Math.sin(angle) * 60,
                alpha: 0,
                duration: 600,
                onComplete: () => sparkle.destroy()
            });
        }

        this.showPowerUpText(chest.x, chest.y, '🎁 +1 VIDA! +200 PTS!');
        this.hud.update();
    }

    createCollectionEffect(x, y, color) {
        for (let i = 0; i < 8; i++) {
            const particle = this.add.circle(
                x + Phaser.Math.Between(-5, 5),
                y + Phaser.Math.Between(-5, 5),
                Phaser.Math.Between(2, 4),
                color, 1
            );
            particle.setDepth(15);

            this.tweens.add({
                targets: particle,
                y: y - Phaser.Math.Between(20, 50),
                x: x + Phaser.Math.Between(-30, 30),
                alpha: 0,
                scale: 0,
                duration: Phaser.Math.Between(300, 600),
                onComplete: () => particle.destroy()
            });
        }
    }

    showPowerUpText(x, y, text) {
        const powerText = this.add.text(x, y - 30, text, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(20);

        this.tweens.add({
            targets: powerText,
            y: y - 70,
            alpha: 0,
            duration: 1500,
            onComplete: () => powerText.destroy()
        });
    }

    // ==========================================
    // LEVEL EXIT
    // ==========================================
    createLevelExit() {
        // Level exit flag/door near the end
        const exitX = this.levelWidth - 100;
        const exitY = this.levelHeight - GAME_CONFIG.TILE_SIZE - 40;

        // Exit visual (flag)
        const flagPole = this.add.rectangle(exitX, exitY - 20, 4, 60, 0x8B4513);
        flagPole.setDepth(4);

        const flag = this.add.triangle(exitX + 2, exitY - 45, 0, 0, 30, 10, 0, 20, 0x00FF00);
        flag.setDepth(4);

        // Flag animation
        this.tweens.add({
            targets: flag,
            scaleX: 0.8,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // "EXIT" text
        const exitLabel = this.add.text(exitX + 5, exitY - 65, 'SAÍDA →', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#00FF00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(4);

        this.tweens.add({
            targets: exitLabel,
            alpha: 0.3,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Exit zone
        this.exitZone = this.add.rectangle(exitX, exitY, 60, 80, 0x00ff00, 0);
        this.physics.add.existing(this.exitZone, true);

        this.physics.add.overlap(this.playerSystem.sprite, this.exitZone, () => {
            this.completeLevel();
        });
    }

    completeLevel() {
        if (this.levelComplete) return;
        this.levelComplete = true;

        // Save progress
        GameState.totalCarrots += GameState.carrots;
        if (GameState.currentLevel >= GameState.maxLevelReached) {
            GameState.maxLevelReached = Math.min(GameState.currentLevel + 1, GAME_CONFIG.TOTAL_LEVELS);
        }
        GameState.save();

        // Victory screen
        this.showVictoryScreen();
    }

    // ==========================================
    // MOBILE CONTROLS
    // ==========================================
    createMobileControls() {
        const { width, height } = this.cameras.main;
        const btnAlpha = 0.35;
        const btnActiveAlpha = 0.6;

        // ====== D-PAD (LEFT SIDE) ======
        // D-pad background circle
        const dpadBg = this.add.circle(90, height - 90, 75, 0x000000, 0.15);
        dpadBg.setScrollFactor(0).setDepth(199);

        // Left button - large
        const leftBtn = this.add.circle(45, height - 90, 42, 0xFFFFFF, btnAlpha);
        leftBtn.setScrollFactor(0).setDepth(200).setInteractive();
        const leftArrow = this.add.text(45, height - 90, '◀', {
            fontSize: '32px', color: '#FFFFFF'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

        leftBtn.on('pointerdown', () => { this.mobileControls.moveDir = -1; leftBtn.setFillStyle(0xFFFFFF, btnActiveAlpha); });
        leftBtn.on('pointerup', () => { this.mobileControls.moveDir = 0; leftBtn.setFillStyle(0xFFFFFF, btnAlpha); });
        leftBtn.on('pointerout', () => { this.mobileControls.moveDir = 0; leftBtn.setFillStyle(0xFFFFFF, btnAlpha); });

        // Right button - large
        const rightBtn = this.add.circle(135, height - 90, 42, 0xFFFFFF, btnAlpha);
        rightBtn.setScrollFactor(0).setDepth(200).setInteractive();
        const rightArrow = this.add.text(135, height - 90, '▶', {
            fontSize: '32px', color: '#FFFFFF'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

        rightBtn.on('pointerdown', () => { this.mobileControls.moveDir = 1; rightBtn.setFillStyle(0xFFFFFF, btnActiveAlpha); });
        rightBtn.on('pointerup', () => { this.mobileControls.moveDir = 0; rightBtn.setFillStyle(0xFFFFFF, btnAlpha); });
        rightBtn.on('pointerout', () => { this.mobileControls.moveDir = 0; rightBtn.setFillStyle(0xFFFFFF, btnAlpha); });

        // ====== ACTION BUTTONS (RIGHT SIDE) ======

        // Jump button - LARGE (primary action)
        const jumpBtn = this.add.circle(width - 80, height - 110, 48, 0x44FF44, btnAlpha);
        jumpBtn.setScrollFactor(0).setDepth(200).setInteractive();
        const jumpLabel = this.add.text(width - 80, height - 110, '⬆', {
            fontSize: '36px', color: '#FFFFFF'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
        this.add.text(width - 80, height - 75, 'PULO', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '6px', color: '#FFFFFF', alpha: 0.6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

        jumpBtn.on('pointerdown', () => { this.mobileControls.jumping = true; jumpBtn.setFillStyle(0x44FF44, btnActiveAlpha); });
        jumpBtn.on('pointerup', () => { this.mobileControls.jumping = false; jumpBtn.setFillStyle(0x44FF44, btnAlpha); });
        jumpBtn.on('pointerout', () => { this.mobileControls.jumping = false; jumpBtn.setFillStyle(0x44FF44, btnAlpha); });

        // Attack button - large
        const attackBtn = this.add.circle(width - 170, height - 70, 42, 0xFF4444, btnAlpha);
        attackBtn.setScrollFactor(0).setDepth(200).setInteractive();
        const attackLabel = this.add.text(width - 170, height - 70, '⚔', {
            fontSize: '30px', color: '#FFFFFF'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
        this.add.text(width - 170, height - 38, 'ATK', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '6px', color: '#FFFFFF', alpha: 0.6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

        attackBtn.on('pointerdown', () => { this.mobileControls.attacking = true; attackBtn.setFillStyle(0xFF4444, btnActiveAlpha); });
        attackBtn.on('pointerup', () => { this.mobileControls.attacking = false; attackBtn.setFillStyle(0xFF4444, btnAlpha); });
        attackBtn.on('pointerout', () => { this.mobileControls.attacking = false; attackBtn.setFillStyle(0xFF4444, btnAlpha); });

        // ====== PAUSE BUTTON (top right) ======
        const pauseBg = this.add.circle(width - 30, 25, 18, 0x000000, 0.4);
        pauseBg.setScrollFactor(0).setDepth(200);
        const pauseBtn = this.add.text(width - 30, 25, '⏸', {
            fontSize: '22px'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setInteractive();
        pauseBtn.on('pointerdown', () => this.togglePause());
    }

    // ==========================================
    // PAUSE SYSTEM
    // ==========================================
    togglePause() {
        if (this.levelComplete) return;

        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.physics.pause();
            this.showPauseMenu();
        } else {
            this.physics.resume();
            this.hidePauseMenu();
        }
    }

    showPauseMenu() {
        const { width, height } = this.cameras.main;

        this.pauseOverlay = this.add.graphics();
        this.pauseOverlay.fillStyle(0x000000, 0.7);
        this.pauseOverlay.fillRect(0, 0, width, height);
        this.pauseOverlay.setScrollFactor(0).setDepth(300);

        this.pauseTitle = this.add.text(width / 2, height / 2 - 60, '⏸ PAUSADO', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '24px',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

        // Resume button
        this.resumeBtn = this.add.text(width / 2, height / 2, '▶ CONTINUAR', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '14px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
        this.resumeBtn.on('pointerover', () => this.resumeBtn.setColor('#FFD700'));
        this.resumeBtn.on('pointerout', () => this.resumeBtn.setColor('#FFFFFF'));
        this.resumeBtn.on('pointerdown', () => this.togglePause());

        // Menu button
        this.menuBtn = this.add.text(width / 2, height / 2 + 40, '🏠 MENU PRINCIPAL', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#AAAAAA',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
        this.menuBtn.on('pointerover', () => this.menuBtn.setColor('#FF6666'));
        this.menuBtn.on('pointerout', () => this.menuBtn.setColor('#AAAAAA'));
        this.menuBtn.on('pointerdown', () => {
            if (window.soundManager) window.soundManager.stopMusic();
            if (window.soundManager) window.soundManager.playMenuSelect();
            this.physics.resume();
            this.scene.stop('UIScene');
            this.scene.start('MenuScene');
        });
    }

    hidePauseMenu() {
        if (this.pauseOverlay) this.pauseOverlay.destroy();
        if (this.pauseTitle) this.pauseTitle.destroy();
        if (this.resumeBtn) this.resumeBtn.destroy();
        if (this.menuBtn) this.menuBtn.destroy();
    }

    // ==========================================
    // GAME OVER / VICTORY
    // ==========================================
    handlePlayerDeath() {
        soundManager.stopMusic();
        soundManager.playGameOver();
        this.cameras.main.fadeOut(1000, 0, 0, 0);

        this.time.delayedCall(1500, () => {
            this.showGameOverScreen();
        });
    }

    showGameOverScreen() {
        const { width, height } = this.cameras.main;
        this.cameras.main.fadeIn(500, 0, 0, 0);

        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.85);
        overlay.fillRect(0, 0, width, height);
        overlay.setScrollFactor(0).setDepth(400);

        this.add.text(width / 2, height / 2 - 60, '💀 GAME OVER', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '28px',
            color: '#FF0000',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(401);

        this.add.text(width / 2, height / 2,
            `Pontuação: ${GameState.score}\nCenouras: ${GameState.carrots}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#FFFFFF',
            align: 'center',
            lineSpacing: 10,
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(401);

        // Retry button
        const retryBtn = this.add.text(width / 2, height / 2 + 60, '🔄 TENTAR NOVAMENTE', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(401).setInteractive({ useHandCursor: true });
        retryBtn.on('pointerdown', () => {
            GameState.reset();
            this.scene.restart();
        });

        // Menu button
        const menuBtn = this.add.text(width / 2, height / 2 + 95, '🏠 MENU', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#AAAAAA',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(401).setInteractive({ useHandCursor: true });
        menuBtn.on('pointerdown', () => {
            this.scene.stop('UIScene');
            this.scene.start('MenuScene');
        });
    }

    showVictoryScreen() {
        const { width, height } = this.cameras.main;

        soundManager.stopMusic();
        soundManager.playLevelComplete();

        // Pause physics
        this.physics.pause();

        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.8);
        overlay.fillRect(0, 0, width, height);
        overlay.setScrollFactor(0).setDepth(400);

        const isLastLevel = GameState.currentLevel >= GAME_CONFIG.TOTAL_LEVELS;
        const title = isLastLevel ? '🎉 VITÓRIA TOTAL! 🎉' : '🌟 NÍVEL COMPLETO! 🌟';

        this.add.text(width / 2, height / 2 - 70, title, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: isLastLevel ? '16px' : '18px',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(401);

        this.add.text(width / 2, height / 2 - 20,
            `Pontuação: ${GameState.score}\nCenouras: ${GameState.carrots}\nVidas: ${GameState.lives}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#FFFFFF',
            align: 'center',
            lineSpacing: 8,
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(401);

        if (isLastLevel) {
            this.add.text(width / 2, height / 2 + 40,
                'Luna salvou todas as cenouras!\nCenouralândia está salva! 🥕', {
                fontFamily: '"Outfit", sans-serif',
                fontSize: '14px',
                color: '#FF8C00',
                align: 'center',
                lineSpacing: 6
            }).setOrigin(0.5).setScrollFactor(0).setDepth(401);

            // Celebration particles
            this.time.addEvent({
                delay: 200,
                repeat: 30,
                callback: () => {
                    const px = Phaser.Math.Between(0, width);
                    const colors = [0xFFD700, 0xFF8C00, 0xFF0000, 0x00FF00, 0x00FFFF, 0xFF00FF];
                    const color = colors[Phaser.Math.Between(0, colors.length - 1)];
                    const confetti = this.add.circle(px, -10, Phaser.Math.Between(3, 6), color, 1);
                    confetti.setScrollFactor(0).setDepth(402);
                    this.tweens.add({
                        targets: confetti,
                        y: height + 20,
                        x: px + Phaser.Math.Between(-50, 50),
                        duration: Phaser.Math.Between(2000, 4000),
                        onComplete: () => confetti.destroy()
                    });
                }
            });
        }

        // Next level / Menu button
        if (!isLastLevel) {
            const nextBtn = this.add.text(width / 2, height / 2 + 70, '▶ PRÓXIMO NÍVEL', {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '12px',
                color: '#FFD700',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5).setScrollFactor(0).setDepth(401).setInteractive({ useHandCursor: true });
            nextBtn.on('pointerdown', () => {
                GameState.currentLevel++;
                GameState.lives = GAME_CONFIG.PLAYER_MAX_LIVES;
                GameState.carrots = 0;
                this.scene.restart();
            });
        }

        const menuBtn = this.add.text(width / 2, height / 2 + (isLastLevel ? 90 : 105), '🏠 MENU', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#AAAAAA',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(401).setInteractive({ useHandCursor: true });
        menuBtn.on('pointerdown', () => {
            if (window.soundManager) window.soundManager.stopMusic();
            if (window.soundManager) window.soundManager.playMenuSelect();
            this.scene.stop('UIScene');
            this.scene.start('MenuScene');
        });
    }

    handleBossDefeated() {
        // Special effect for boss defeat
        this.cameras.main.flash(500, 255, 255, 255);

        this.showPowerUpText(
            this.cameras.main.scrollX + this.cameras.main.width / 2,
            this.cameras.main.scrollY + this.cameras.main.height / 2 - 50,
            '👹 VILÃO SOMBRIO DERROTADO!'
        );

        // Bonus score
        GameState.score += 1000;
        this.hud.update();
    }

    // ==========================================
    // UPDATE LOOP
    // ==========================================
    update() {
        if (this.isPaused || this.levelComplete) return;

        // Update player
        if (this.sys.game.device.input.touch && this.mobileControls) {
            this.playerSystem.updateMobile(
                this.mobileControls.moveDir,
                this.mobileControls.jumping,
                this.mobileControls.attacking
            );
            // Reset one-shot actions
            this.mobileControls.attacking = false;
        } else {
            this.playerSystem.update(this.cursors, this.keys);
        }

        // Update enemies
        this.enemyAI.update(this.playerSystem.sprite);

        // Update HUD
        this.hud.update();
    }
}
