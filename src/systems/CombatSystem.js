/**
 * CombatSystem - Manages combat interactions
 * Player attacks, enemy attacks, damage calculation
 */
class CombatSystem {
    constructor(scene, player, enemyAI) {
        this.scene = scene;
        this.player = player;
        this.enemyAI = enemyAI;

        // Setup collision detection
        this.setupCollisions();
    }

    setupCollisions() {
        // Player vs Enemies collision
        this.enemyAI.enemies.forEach(enemy => {
            this.addEnemyCollision(enemy);
        });
    }

    addEnemyCollision(enemy) {
        this.scene.physics.add.overlap(
            this.player.sprite,
            enemy,
            (playerSprite, enemySprite) => {
                this.handlePlayerEnemyCollision(playerSprite, enemySprite);
            },
            null,
            this
        );
    }

    /**
     * Handle collision between player and enemy
     */
    handlePlayerEnemyCollision(playerSprite, enemySprite) {
        if (!enemySprite.enemyData || enemySprite.enemyData.state === 'dead') return;
        if (this.player.isDead || this.player.invincible) return;

        // Check if player is stomping from above
        const playerBottom = playerSprite.body.bottom;
        const enemyTop = enemySprite.body.top;
        const playerVelY = playerSprite.body.velocity.y;

        if (playerVelY > 0 && playerBottom - enemyTop < 15) {
            // Player stomps enemy!
            this.stompEnemy(enemySprite);

            // Bounce player up
            playerSprite.setVelocityY(-250);
        } else {
            // Enemy hits player
            this.player.takeDamage();
        }
    }

    /**
     * Handle player attack hitting enemies
     */
    playerAttack(attackHitbox) {
        if (!attackHitbox) return;

        this.enemyAI.enemies.forEach(enemy => {
            if (!enemy.active || !enemy.enemyData || enemy.enemyData.state === 'dead') return;

            // Check overlap manually
            const bounds1 = attackHitbox.getBounds();
            const bounds2 = enemy.getBounds();

            if (Phaser.Geom.Rectangle.Overlaps(bounds1, bounds2)) {
                this.enemyAI.damageEnemy(enemy, 1);

                // Impact effect
                this.createImpactEffect(enemy.x, enemy.y);
            }
        });
    }

    /**
     * Stomp an enemy from above
     */
    stompEnemy(enemy) {
        this.enemyAI.damageEnemy(enemy, 1);
        this.createImpactEffect(enemy.x, enemy.y);
    }

    /**
     * Visual impact effect
     */
    createImpactEffect(x, y) {
        // Star burst particles
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            const star = this.scene.add.circle(
                x, y, 3, 0xFFD700, 1
            );
            star.setDepth(15);

            this.scene.tweens.add({
                targets: star,
                x: x + Math.cos(angle) * 30,
                y: y + Math.sin(angle) * 30,
                alpha: 0,
                scale: 0,
                duration: 300,
                onComplete: () => star.destroy()
            });
        }

        // Impact flash
        const flash = this.scene.add.circle(x, y, 15, 0xFFFFFF, 0.8);
        flash.setDepth(15);
        this.scene.tweens.add({
            targets: flash,
            scale: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => flash.destroy()
        });
    }
}
