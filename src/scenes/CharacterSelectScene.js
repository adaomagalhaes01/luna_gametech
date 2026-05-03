/**
 * CharacterSelectScene - Character selection / level selection
 */
class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelectScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Background
        const skyBg = this.add.image(width / 2, height / 2, 'sky-background');
        skyBg.setDisplaySize(width, height);
        skyBg.setAlpha(0.5);

        // Dark overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.5);
        overlay.fillRect(0, 0, width, height);

        // Title
        this.add.text(width / 2, 40, '🗺️ SELECIONAR NÍVEL', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '18px',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Level cards
        this.createLevelCards(width, height);

        // Character preview
        this.createCharacterDisplay(width, height);

        // Back button
        const backBtn = this.add.text(30, height - 30, '⬅️ VOLTAR', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#AAAAAA',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0, 1);
        backBtn.setInteractive({ useHandCursor: true });
        backBtn.on('pointerover', () => backBtn.setColor('#FFFFFF'));
        backBtn.on('pointerout', () => backBtn.setColor('#AAAAAA'));
        backBtn.on('pointerdown', () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MenuScene');
            });
        });

        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    createLevelCards(width, height) {
        const levels = [
            {
                name: 'Floresta Verde',
                sub: 'Nível 1',
                desc: 'O início da jornada',
                emoji: '🌳',
                color: 0x2d7a2d,
                unlocked: true
            },
            {
                name: 'Caverna Sombria',
                sub: 'Nível 2',
                desc: 'Cuidado com as trevas',
                emoji: '🕳️',
                color: 0x4a3a6a,
                unlocked: GameState.maxLevelReached >= 2
            },
            {
                name: 'Torre do Vilão',
                sub: 'Nível 3 - BOSS',
                desc: 'Confronto final!',
                emoji: '🏰',
                color: 0x8b1a1a,
                unlocked: GameState.maxLevelReached >= 3
            }
        ];

        const startX = width / 2 - 220;
        const cardWidth = 160;
        const spacing = 180;

        levels.forEach((level, index) => {
            const x = startX + index * spacing;
            const y = height / 2 - 20;

            // Card background
            const card = this.add.graphics();

            if (level.unlocked) {
                card.fillStyle(level.color, 0.8);
                card.fillRoundedRect(x - cardWidth / 2, y - 80, cardWidth, 170, 12);
                card.lineStyle(3, 0xFFD700, 1);
                card.strokeRoundedRect(x - cardWidth / 2, y - 80, cardWidth, 170, 12);
            } else {
                card.fillStyle(0x333333, 0.8);
                card.fillRoundedRect(x - cardWidth / 2, y - 80, cardWidth, 170, 12);
                card.lineStyle(2, 0x555555, 1);
                card.strokeRoundedRect(x - cardWidth / 2, y - 80, cardWidth, 170, 12);
            }

            // Level emoji/icon
            this.add.text(x, y - 50, level.unlocked ? level.emoji : '🔒', {
                fontSize: '36px',
                align: 'center'
            }).setOrigin(0.5);

            // Level name
            this.add.text(x, y + 5, level.name, {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '9px',
                color: level.unlocked ? '#FFFFFF' : '#666666',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2,
                wordWrap: { width: cardWidth - 20 }
            }).setOrigin(0.5);

            // Sub text
            this.add.text(x, y + 30, level.sub, {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '7px',
                color: level.unlocked ? '#FFD700' : '#555555',
                align: 'center'
            }).setOrigin(0.5);

            // Description
            this.add.text(x, y + 50, level.desc, {
                fontFamily: '"Outfit", sans-serif',
                fontSize: '11px',
                color: level.unlocked ? '#CCCCCC' : '#444444',
                align: 'center'
            }).setOrigin(0.5);

            // Stars (completion rating)
            if (level.unlocked) {
                const starText = index < GameState.maxLevelReached ? '⭐⭐⭐' : '☆☆☆';
                this.add.text(x, y + 72, starText, {
                    fontSize: '12px',
                    align: 'center'
                }).setOrigin(0.5);
            }

            // Clickable area
            if (level.unlocked) {
                const hitArea = this.add.rectangle(x, y + 5, cardWidth, 170, 0xffffff, 0);
                hitArea.setInteractive({ useHandCursor: true });

                hitArea.on('pointerover', () => {
                    card.clear();
                    card.fillStyle(level.color, 1);
                    card.fillRoundedRect(x - cardWidth / 2 - 3, y - 83, cardWidth + 6, 176, 14);
                    card.lineStyle(3, 0xFFD700, 1);
                    card.strokeRoundedRect(x - cardWidth / 2 - 3, y - 83, cardWidth + 6, 176, 14);
                });

                hitArea.on('pointerout', () => {
                    card.clear();
                    card.fillStyle(level.color, 0.8);
                    card.fillRoundedRect(x - cardWidth / 2, y - 80, cardWidth, 170, 12);
                    card.lineStyle(3, 0xFFD700, 1);
                    card.strokeRoundedRect(x - cardWidth / 2, y - 80, cardWidth, 170, 12);
                });

                hitArea.on('pointerdown', () => {
                    if (window.soundManager) window.soundManager.playMenuSelect();
                    GameState.currentLevel = index + 1;
                    GameState.reset();
                    this.cameras.main.fadeOut(500, 0, 0, 0);
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        this.scene.start('GameScene');
                        this.scene.start('UIScene');
                    });
                });
            }
        });
    }

    createCharacterDisplay(width, height) {
        // Character info panel at bottom
        const panel = this.add.graphics();
        panel.fillStyle(0x000000, 0.5);
        panel.fillRoundedRect(width / 2 - 200, height - 65, 400, 50, 10);

        // Character sprite
        const char = this.add.sprite(width / 2 - 160, height - 40, 'player-idle');
        char.setScale(GAME_CONFIG.SPRITE_SCALE);
        char.play('idle');

        // Stats
        this.add.text(width / 2 - 110, height - 50, 'LUNA  |  ❤️ 3 vidas  |  🥕 Cenouras: ' + GameState.totalCarrots, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 1
        });

        this.add.text(width / 2 - 110, height - 32, 'Nível máximo alcançado: ' + GameState.maxLevelReached, {
            fontFamily: '"Outfit", sans-serif',
            fontSize: '12px',
            color: '#AAAAAA'
        });
    }
}
