/**
 * MenuScene - Main menu with animated background
 * Features: Play, Options, Credits
 */
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // ====== ANIMATED BACKGROUND ======
        this.createBackground(width, height);

        // ====== DARK OVERLAY ======
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.4);
        overlay.fillRect(0, 0, width, height);

        // ====== PARTICLES (floating carrots/stars effect) ======
        this.createParticles(width, height);

        // ====== TITLE ======
        this.createTitle(width, height);

        // ====== MENU BUTTONS ======
        this.createMenuButtons(width, height);

        // ====== ANIMATED PLAYER CHARACTER ======
        this.createPlayerPreview(width, height);

        // ====== DEVELOPER CREDIT ======
        this.add.text(width - 10, height - 10, 'v1.0.0', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#666666'
        }).setOrigin(1, 1);

        // GameTech branding
        const devCredit = this.add.text(width / 2, height - 35, 'Desenvolvido pela GameTech', {
            fontFamily: '"Outfit", sans-serif',
            fontSize: '13px',
            color: '#87CEEB',
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Subtle glow animation
        this.tweens.add({
            targets: devCredit,
            alpha: 0.5,
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // ====== CONTROLS HINT ======
        this.createControlsHint(width, height);

        // Camera fade in
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    createBackground(width, height) {
        // Sky background - tiled and scaled to fill
        const skyBg = this.add.image(width / 2, height / 2, 'sky-background');
        skyBg.setDisplaySize(width, height);

        // Background layer (parallax style)
        const bgScale = height / 240;
        const bgTilesNeeded = Math.ceil(width / (192 * bgScale)) + 1;
        for (let i = 0; i < bgTilesNeeded; i++) {
            const bg = this.add.image(i * 192 * bgScale, height, 'bg-layer');
            bg.setOrigin(0, 1);
            bg.setScale(bgScale);
            bg.setAlpha(0.6);
        }

        // Middleground layer
        const mgScale = height / 240;
        const mgTilesNeeded = Math.ceil(width / (384 * mgScale)) + 1;
        for (let i = 0; i < mgTilesNeeded; i++) {
            const mg = this.add.image(i * 384 * mgScale, height, 'mg-layer');
            mg.setOrigin(0, 1);
            mg.setScale(mgScale);
            mg.setAlpha(0.7);
        }
    }

    createParticles(width, height) {
        // Floating particles (simulated with tweened sprites)
        for (let i = 0; i < 15; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(2, 6);

            const particle = this.add.circle(x, y, size, 0xFFD700, 0.3 + Math.random() * 0.4);

            this.tweens.add({
                targets: particle,
                y: y - Phaser.Math.Between(40, 100),
                x: x + Phaser.Math.Between(-30, 30),
                alpha: 0,
                duration: Phaser.Math.Between(3000, 6000),
                repeat: -1,
                onRepeat: () => {
                    particle.x = Phaser.Math.Between(0, width);
                    particle.y = Phaser.Math.Between(height * 0.5, height);
                    particle.alpha = 0.3 + Math.random() * 0.4;
                }
            });
        }
    }

    createTitle(width, height) {
        // Title glow background
        const glowBg = this.add.graphics();
        glowBg.fillStyle(0x000000, 0.5);
        glowBg.fillRoundedRect(width / 2 - 250, 30, 500, 120, 16);

        // Main title
        const title = this.add.text(width / 2, 60, 'JORNADA DA COELHA', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '22px',
            color: '#FFD700',
            align: 'center',
            stroke: '#8B4513',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 5,
                fill: true
            }
        }).setOrigin(0.5);

        // Subtitle
        const subtitle = this.add.text(width / 2, 95, '🥕 O SEGREDO DAS CENOURAS 🥕', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#FF8C00',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // GameTech studio badge
        this.add.text(width / 2, 125, '🎮 GAMETECH STUDIO', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '7px',
            color: '#87CEEB',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Animate title
        this.tweens.add({
            targets: title,
            y: 65,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Glow effect on subtitle
        this.tweens.add({
            targets: subtitle,
            alpha: 0.6,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createMenuButtons(width, height) {
        const buttonData = [
            { text: '🎮  JOGAR', action: () => this.startGame() },
            { text: '⚙️  OPÇÕES', action: () => this.showOptions() },
            { text: '📖  HISTÓRIA', action: () => this.showStory() }
        ];

        const startY = height / 2 + 20;
        const spacing = 55;

        buttonData.forEach((btn, index) => {
            this.createButton(width / 2, startY + index * spacing, btn.text, btn.action, index);
        });
    }

    createButton(x, y, text, callback, index) {
        // Button container
        const btnBg = this.add.graphics();
        btnBg.fillStyle(0x2a5f2a, 0.85);
        btnBg.fillRoundedRect(x - 140, y - 22, 280, 44, 10);
        btnBg.lineStyle(2, 0x4a9e3f, 1);
        btnBg.strokeRoundedRect(x - 140, y - 22, 280, 44, 10);

        const btnText = this.add.text(x, y, text, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '14px',
            color: '#FFFFFF',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Interactive zone
        const hitArea = this.add.rectangle(x, y, 280, 44, 0xffffff, 0);
        hitArea.setInteractive({ useHandCursor: true });

        // Entrance animation
        btnText.setAlpha(0);
        btnText.x -= 50;
        btnBg.setAlpha(0);

        this.tweens.add({
            targets: [btnText],
            alpha: 1,
            x: x,
            duration: 400,
            delay: 300 + index * 150,
            ease: 'Back.easeOut'
        });

        this.tweens.add({
            targets: btnBg,
            alpha: 1,
            duration: 400,
            delay: 300 + index * 150
        });

        // Hover effects
        hitArea.on('pointerover', () => {
            btnBg.clear();
            btnBg.fillStyle(0x4a9e3f, 0.95);
            btnBg.fillRoundedRect(x - 145, y - 24, 290, 48, 12);
            btnBg.lineStyle(3, 0xFFD700, 1);
            btnBg.strokeRoundedRect(x - 145, y - 24, 290, 48, 12);
            btnText.setScale(1.05);
            btnText.setColor('#FFD700');
        });

        hitArea.on('pointerout', () => {
            btnBg.clear();
            btnBg.fillStyle(0x2a5f2a, 0.85);
            btnBg.fillRoundedRect(x - 140, y - 22, 280, 44, 10);
            btnBg.lineStyle(2, 0x4a9e3f, 1);
            btnBg.strokeRoundedRect(x - 140, y - 22, 280, 44, 10);
            btnText.setScale(1);
            btnText.setColor('#FFFFFF');
        });

        hitArea.on('pointerdown', () => {
            btnText.setScale(0.95);
            this.time.delayedCall(100, callback);
        });
    }

    createPlayerPreview(width, height) {
        // Player character preview on the side
        const player = this.add.sprite(width - 100, height - 80, 'player-idle');
        player.setScale(GAME_CONFIG.SPRITE_SCALE * 1.2);
        player.play('idle');

        // Floating animation
        this.tweens.add({
            targets: player,
            y: height - 90,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Character name label
        this.add.text(width - 100, height - 45, 'LUNA', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#FFD700',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
    }

    createControlsHint(width, height) {
        const isMobile = this.sys.game.device.input.touch;
        const controlText = isMobile
            ? '📱 Toque para controlar'
            : '⌨️ WASD/Setas: Mover | Espaço: Pular | Z: Atacar';

        const hint = this.add.text(width / 2, height - 15, controlText, {
            fontFamily: '"Outfit", sans-serif',
            fontSize: '11px',
            color: '#888888',
            align: 'center'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: hint,
            alpha: 0.4,
            duration: 2000,
            yoyo: true,
            repeat: -1
        });
    }

    startGame() {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('CharacterSelectScene');
        });
    }

    showOptions() {
        this.createOptionsModal();
    }

    createOptionsModal() {
        const { width, height } = this.cameras.main;

        // Overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, width, height);
        overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

        // Modal background
        const modal = this.add.graphics();
        modal.fillStyle(0x1a1a2e, 0.95);
        modal.fillRoundedRect(width / 2 - 180, height / 2 - 120, 360, 240, 16);
        modal.lineStyle(3, 0x4a9e3f, 1);
        modal.strokeRoundedRect(width / 2 - 180, height / 2 - 120, 360, 240, 16);

        // Title
        this.add.text(width / 2, height / 2 - 90, '⚙️ OPÇÕES', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '16px',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Sound toggle
        const soundLabel = this.add.text(width / 2 - 80, height / 2 - 30, '🔊 Som:', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#FFFFFF'
        });

        const soundState = this.add.text(width / 2 + 60, height / 2 - 30, GameState.isMuted ? 'OFF' : 'ON', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: GameState.isMuted ? '#FF4444' : '#44FF44'
        });
        soundState.setInteractive({ useHandCursor: true });
        soundState.on('pointerdown', () => {
            GameState.isMuted = !GameState.isMuted;
            soundState.setText(GameState.isMuted ? 'OFF' : 'ON');
            soundState.setColor(GameState.isMuted ? '#FF4444' : '#44FF44');
            GameState.save();
        });

        // Reset progress
        const resetText = this.add.text(width / 2, height / 2 + 20, '🗑️ Resetar Progresso', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#FF6666'
        }).setOrigin(0.5);
        resetText.setInteractive({ useHandCursor: true });
        resetText.on('pointerdown', () => {
            localStorage.removeItem('jornada-coelha-save');
            GameState.maxLevelReached = 1;
            GameState.totalCarrots = 0;
            resetText.setText('✅ Progresso Resetado!');
            resetText.setColor('#44FF44');
        });

        // Close button
        const closeBtn = this.add.text(width / 2, height / 2 + 80, '❌ FECHAR', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        closeBtn.setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => {
            overlay.destroy();
            modal.destroy();
            soundLabel.destroy();
            soundState.destroy();
            resetText.destroy();
            closeBtn.destroy();
        });
    }

    showStory() {
        const { width, height } = this.cameras.main;

        // Overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.8);
        overlay.fillRect(0, 0, width, height);
        overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

        // Modal
        const modal = this.add.graphics();
        modal.fillStyle(0x1a1a2e, 0.95);
        modal.fillRoundedRect(width / 2 - 250, height / 2 - 150, 500, 300, 16);
        modal.lineStyle(3, 0xFF8C00, 1);
        modal.strokeRoundedRect(width / 2 - 250, height / 2 - 150, 500, 300, 16);

        const storyTitle = this.add.text(width / 2, height / 2 - 120, '📖 A HISTÓRIA', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '14px',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const storyText = this.add.text(width / 2, height / 2,
            'Em Cenouralândia, um mundo mágico onde\n' +
            'cenouras crescem por toda parte, algo\n' +
            'terrível aconteceu...\n\n' +
            'Um Vilão Sombrio roubou todas as cenouras!\n\n' +
            'Luna, a coelha mais corajosa do reino,\n' +
            'parte em uma aventura épica para\n' +
            'descobrir o segredo e salvar seu lar.\n\n' +
            'Ajude Luna a recuperar as cenouras! 🥕',
            {
                fontFamily: '"Outfit", sans-serif',
                fontSize: '13px',
                color: '#CCCCCC',
                align: 'center',
                lineSpacing: 6
            }).setOrigin(0.5);

        const closeBtn = this.add.text(width / 2, height / 2 + 120, '❌ FECHAR', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        closeBtn.setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => {
            overlay.destroy();
            modal.destroy();
            storyTitle.destroy();
            storyText.destroy();
            closeBtn.destroy();
        });
    }
}
