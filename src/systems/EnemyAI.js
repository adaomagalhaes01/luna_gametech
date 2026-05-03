/**
 * EnemyAI System - Handles enemy behavior
 * Patrol, Chase, Attack patterns
 */
class EnemyAI {
    constructor(scene) {
        this.scene = scene;
        this.enemies = [];
    }

    /**
     * Create a slug enemy (ground patrol)
     */
    createSlug(x, y, patrolRange = 100) {
        const slug = this.scene.physics.add.sprite(x, y, 'slug');
        slug.setScale(GAME_CONFIG.SPRITE_SCALE);
        slug.play('slug-move');
        slug.setCollideWorldBounds(true);

        // Physics body
        slug.body.setSize(24, 16);
        slug.body.setOffset(4, 5);

        // Enemy data
        slug.enemyData = {
            type: 'slug',
            health: 1,
            speed: GAME_CONFIG.ENEMY_SPEED * 0.6,
            patrolRange: patrolRange,
            startX: x,
            direction: 1,
            state: 'patrol', // patrol, chase, dead
            detectionRange: GAME_CONFIG.ENEMY_DETECTION_RANGE,
            damage: 1,
            scoreValue: 50
        };

        this.enemies.push(slug);
        return slug;
    }

    /**
     * Create a bee enemy (flying patrol)
     */
    createBee(x, y, patrolRange = 120) {
        const bee = this.scene.physics.add.sprite(x, y, 'bee');
        bee.setScale(GAME_CONFIG.SPRITE_SCALE);
        bee.play('bee-fly');
        bee.body.setAllowGravity(false);
        bee.setCollideWorldBounds(true);

        // Physics body
        bee.body.setSize(20, 20);
        bee.body.setOffset(8, 10);

        // Enemy data
        bee.enemyData = {
            type: 'bee',
            health: 1,
            speed: GAME_CONFIG.ENEMY_SPEED * 0.8,
            patrolRange: patrolRange,
            startX: x,
            startY: y,
            direction: 1,
            state: 'patrol',
            detectionRange: GAME_CONFIG.ENEMY_DETECTION_RANGE * 1.5,
            damage: 1,
            scoreValue: 75,
            hoverOffset: 0,
            hoverSpeed: 0.03
        };

        this.enemies.push(bee);
        return bee;
    }

    /**
     * Create a piranha plant enemy (stationary)
     */
    createPiranhaPlant(x, y) {
        const plant = this.scene.physics.add.sprite(x, y, 'piranha-plant');
        plant.setScale(GAME_CONFIG.SPRITE_SCALE);
        plant.play('piranha-idle');
        plant.body.setAllowGravity(false);
        plant.body.setImmovable(true);

        // Physics body
        plant.body.setSize(30, 35);
        plant.body.setOffset(15, 10);

        // Enemy data
        plant.enemyData = {
            type: 'piranha',
            health: 2,
            speed: 0,
            state: 'idle',
            detectionRange: GAME_CONFIG.ENEMY_DETECTION_RANGE * 0.8,
            damage: 1,
            scoreValue: 100,
            attackCooldown: false
        };

        this.enemies.push(plant);
        return plant;
    }

    /**
     * Create the boss enemy (Vilão Sombrio)
     */
    createBoss(x, y) {
        const boss = this.scene.physics.add.sprite(x, y, 'piranha-plant');
        boss.setScale(GAME_CONFIG.SPRITE_SCALE * 2);
        boss.play('piranha-idle');
        boss.setCollideWorldBounds(true);
        boss.setTint(0x8800aa);

        // Physics body
        boss.body.setSize(40, 40);
        boss.body.setOffset(10, 5);

        // Enemy data
        boss.enemyData = {
            type: 'boss',
            health: 10,
            maxHealth: 10,
            speed: GAME_CONFIG.ENEMY_SPEED * 0.5,
            patrolRange: 200,
            startX: x,
            direction: 1,
            state: 'patrol',
            detectionRange: 300,
            damage: 2,
            scoreValue: 500,
            phase: 1,
            attackCooldown: false,
            attackTimer: 0
        };

        // Boss health bar
        boss.healthBarBg = this.scene.add.graphics();
        boss.healthBar = this.scene.add.graphics();
        boss.bossNameText = this.scene.add.text(x, y - 80, '👹 VILÃO SOMBRIO', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#FF0000',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        boss.bossNameText.setDepth(20);
        boss.healthBarBg.setDepth(20);
        boss.healthBar.setDepth(20);

        this.enemies.push(boss);
        return boss;
    }

    /**
     * Update all enemies
     */
    update(playerSprite) {
        if (!playerSprite || !playerSprite.active) return;

        this.enemies.forEach(enemy => {
            if (!enemy.active || !enemy.enemyData || enemy.enemyData.state === 'dead') return;

            const data = enemy.enemyData;
            const distToPlayer = Phaser.Math.Distance.Between(
                enemy.x, enemy.y, playerSprite.x, playerSprite.y
            );

            switch (data.type) {
                case 'slug':
                    this.updateSlug(enemy, data, playerSprite, distToPlayer);
                    break;
                case 'bee':
                    this.updateBee(enemy, data, playerSprite, distToPlayer);
                    break;
                case 'piranha':
                    this.updatePiranha(enemy, data, playerSprite, distToPlayer);
                    break;
                case 'boss':
                    this.updateBoss(enemy, data, playerSprite, distToPlayer);
                    break;
            }
        });
    }

    updateSlug(enemy, data, player, dist) {
        if (dist < data.detectionRange) {
            // Chase player
            data.state = 'chase';
            const dir = player.x < enemy.x ? -1 : 1;
            enemy.setVelocityX(dir * data.speed * 1.5);
            enemy.setFlipX(dir < 0);
        } else {
            // Patrol
            data.state = 'patrol';
            enemy.setVelocityX(data.direction * data.speed);
            enemy.setFlipX(data.direction < 0);

            // Reverse direction at patrol boundaries
            if (Math.abs(enemy.x - data.startX) > data.patrolRange) {
                data.direction *= -1;
            }

            // Reverse at edges (if on platform)
            if (enemy.body.blocked.left || enemy.body.blocked.right) {
                data.direction *= -1;
            }
        }
    }

    updateBee(enemy, data, player, dist) {
        // Hover effect
        data.hoverOffset += data.hoverSpeed;
        const hoverY = Math.sin(data.hoverOffset) * 20;

        if (dist < data.detectionRange) {
            // Chase player
            data.state = 'chase';
            const dirX = player.x < enemy.x ? -1 : 1;
            const dirY = player.y < enemy.y ? -1 : 1;
            enemy.setVelocityX(dirX * data.speed * 1.2);
            enemy.setVelocityY(dirY * data.speed * 0.6 + hoverY);
            enemy.setFlipX(dirX < 0);
        } else {
            // Patrol & hover
            data.state = 'patrol';
            enemy.setVelocityX(data.direction * data.speed * 0.5);
            enemy.setVelocityY(hoverY);
            enemy.setFlipX(data.direction < 0);

            if (Math.abs(enemy.x - data.startX) > data.patrolRange) {
                data.direction *= -1;
            }
        }
    }

    updatePiranha(enemy, data, player, dist) {
        if (dist < data.detectionRange && !data.attackCooldown) {
            // Attack!
            data.state = 'attacking';
            data.attackCooldown = true;
            enemy.play('piranha-attack');

            // Face player
            enemy.setFlipX(player.x < enemy.x);

            // Cooldown
            this.scene.time.delayedCall(2000, () => {
                if (enemy.active && enemy.enemyData) {
                    data.attackCooldown = false;
                    data.state = 'idle';
                    enemy.play('piranha-idle');
                }
            });
        }
    }

    updateBoss(enemy, data, player, dist) {
        // Update health bar position
        if (enemy.healthBarBg && enemy.healthBar) {
            const barWidth = 80;
            const healthPercent = data.health / data.maxHealth;

            enemy.healthBarBg.clear();
            enemy.healthBarBg.fillStyle(0x333333, 0.8);
            enemy.healthBarBg.fillRect(enemy.x - barWidth / 2, enemy.y - 65, barWidth, 8);

            enemy.healthBar.clear();
            const healthColor = healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffff00 : 0xff0000;
            enemy.healthBar.fillStyle(healthColor, 1);
            enemy.healthBar.fillRect(enemy.x - barWidth / 2, enemy.y - 65, barWidth * healthPercent, 8);

            enemy.bossNameText.setPosition(enemy.x, enemy.y - 80);
        }

        // Phase management
        if (data.health <= data.maxHealth * 0.5 && data.phase === 1) {
            data.phase = 2;
            data.speed *= 1.5;
            enemy.setTint(0xff0000);
        }

        // Combat behavior
        if (dist < data.detectionRange) {
            data.state = 'chase';
            const dir = player.x < enemy.x ? -1 : 1;
            enemy.setVelocityX(dir * data.speed * 1.2);
            enemy.setFlipX(dir < 0);

            // Periodic attack
            data.attackTimer++;
            if (data.attackTimer > 120 && !data.attackCooldown) {
                data.attackCooldown = true;
                data.attackTimer = 0;

                // Jump attack
                enemy.setVelocityY(-350);

                this.scene.time.delayedCall(1500, () => {
                    if (enemy.active && enemy.enemyData) {
                        data.attackCooldown = false;
                    }
                });
            }
        } else {
            data.state = 'patrol';
            enemy.setVelocityX(data.direction * data.speed);
            enemy.setFlipX(data.direction < 0);

            if (Math.abs(enemy.x - data.startX) > data.patrolRange) {
                data.direction *= -1;
            }
        }
    }

    /**
     * Handle enemy taking damage
     */
    damageEnemy(enemy, damage = 1) {
        if (!enemy.enemyData || enemy.enemyData.state === 'dead') return;

        enemy.enemyData.health -= damage;

        // Flash white
        enemy.setTint(0xffffff);
        this.scene.time.delayedCall(100, () => {
            if (enemy.active) {
                if (enemy.enemyData.type === 'boss') {
                    const tintColor = enemy.enemyData.phase === 2 ? 0xff0000 : 0x8800aa;
                    enemy.setTint(tintColor);
                } else {
                    enemy.clearTint();
                }
            }
        });

        if (enemy.enemyData.health <= 0) {
            this.killEnemy(enemy);
        }
    }

    /**
     * Kill enemy with death animation
     */
    killEnemy(enemy) {
        enemy.enemyData.state = 'dead';

        // Add score
        GameState.score += enemy.enemyData.scoreValue;

        // Score popup
        const scoreText = this.scene.add.text(enemy.x, enemy.y - 20,
            '+' + enemy.enemyData.scoreValue, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        scoreText.setDepth(20);

        this.scene.tweens.add({
            targets: scoreText,
            y: enemy.y - 60,
            alpha: 0,
            duration: 800,
            onComplete: () => scoreText.destroy()
        });

        // Death effect
        const deathEffect = this.scene.add.sprite(enemy.x, enemy.y, 'enemy-death');
        deathEffect.setScale(GAME_CONFIG.SPRITE_SCALE);
        deathEffect.setDepth(10);
        deathEffect.play('enemy-die');
        deathEffect.on('animationcomplete', () => deathEffect.destroy());

        // Clean up boss UI
        if (enemy.enemyData.type === 'boss') {
            if (enemy.healthBarBg) enemy.healthBarBg.destroy();
            if (enemy.healthBar) enemy.healthBar.destroy();
            if (enemy.bossNameText) enemy.bossNameText.destroy();

            // Boss defeated event
            this.scene.events.emit('boss-defeated');
        }

        // Remove from enemies list
        const idx = this.enemies.indexOf(enemy);
        if (idx > -1) this.enemies.splice(idx, 1);

        // Destroy sprite
        enemy.destroy();

        // Update score in UI
        this.scene.events.emit('score-updated');
    }

    /**
     * Get all active enemy sprites for collision
     */
    getEnemySprites() {
        return this.enemies.filter(e => e.active && e.enemyData && e.enemyData.state !== 'dead');
    }

    /**
     * Destroy all enemies
     */
    destroyAll() {
        this.enemies.forEach(enemy => {
            if (enemy.healthBarBg) enemy.healthBarBg.destroy();
            if (enemy.healthBar) enemy.healthBar.destroy();
            if (enemy.bossNameText) enemy.bossNameText.destroy();
            if (enemy.active) enemy.destroy();
        });
        this.enemies = [];
    }
}
