/**
 * HUD System - Heads-Up Display
 * Health bar, score, power-up indicators
 */
class HUD {
    constructor(scene) {
        this.scene = scene;
        this.elements = {};

        this.create();
    }

    create() {
        const { width } = this.scene.cameras.main;

        // ====== LIVES DISPLAY ======
        this.elements.livesContainer = [];
        for (let i = 0; i < GAME_CONFIG.PLAYER_MAX_LIVES; i++) {
            const heart = this.scene.add.text(20 + i * 30, 15, '❤️', {
                fontSize: '20px'
            }).setScrollFactor(0).setDepth(100);
            this.elements.livesContainer.push(heart);
        }

        // ====== SCORE ======
        this.elements.scoreText = this.scene.add.text(width - 20, 15, '🥕 0', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

        // ====== CARROTS COUNT ======
        this.elements.carrotText = this.scene.add.text(width - 20, 35, '× 0', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#FF8C00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

        // ====== LEVEL INDICATOR ======
        this.elements.levelText = this.scene.add.text(width / 2, 15, 'NÍVEL ' + GameState.currentLevel, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

        // ====== POWER-UP INDICATORS ======
        this.elements.speedIcon = this.scene.add.text(20, 45, '', {
            fontSize: '16px'
        }).setScrollFactor(0).setDepth(100);

        this.elements.jumpIcon = this.scene.add.text(45, 45, '', {
            fontSize: '16px'
        }).setScrollFactor(0).setDepth(100);
    }

    update() {
        // Update lives
        this.elements.livesContainer.forEach((heart, i) => {
            heart.setText(i < GameState.lives ? '❤️' : '🖤');
        });

        // Update score
        this.elements.scoreText.setText('🥕 ' + GameState.score);

        // Update carrots
        this.elements.carrotText.setText('× ' + GameState.carrots);

        // Update power-ups
        this.elements.speedIcon.setText(GameState.powerUps.speed ? '⚡' : '');
        this.elements.jumpIcon.setText(GameState.powerUps.jump ? '🦘' : '');
    }

    /**
     * Show level start banner
     */
    showLevelBanner(levelName) {
        const { width, height } = this.scene.cameras.main;

        const banner = this.scene.add.graphics();
        banner.fillStyle(0x000000, 0.7);
        banner.fillRect(0, height / 2 - 40, width, 80);
        banner.setScrollFactor(0).setDepth(200);

        const text = this.scene.add.text(width / 2, height / 2, levelName, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '18px',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

        // Animate out
        this.scene.tweens.add({
            targets: [banner, text],
            alpha: 0,
            duration: 500,
            delay: 2000,
            onComplete: () => {
                banner.destroy();
                text.destroy();
            }
        });
    }

    /**
     * Show score popup at position
     */
    showScorePopup(x, y, amount) {
        const popup = this.scene.add.text(x, y, '+' + amount, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(100);

        this.scene.tweens.add({
            targets: popup,
            y: y - 40,
            alpha: 0,
            duration: 600,
            onComplete: () => popup.destroy()
        });
    }

    destroy() {
        Object.values(this.elements).forEach(el => {
            if (Array.isArray(el)) {
                el.forEach(e => e.destroy());
            } else if (el && el.destroy) {
                el.destroy();
            }
        });
    }
}
