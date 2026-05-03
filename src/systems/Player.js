/**
 * Player System - Handles player character logic
 * Movement, animation, state management
 */
class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        // Create sprite with physics
        this.sprite = scene.physics.add.sprite(x, y, 'player-idle');
        this.sprite.setScale(GAME_CONFIG.SPRITE_SCALE);
        this.sprite.setBounce(0.1);
        this.sprite.setCollideWorldBounds(true);

        // Adjust physics body (hitbox)
        this.sprite.body.setSize(16, 26);
        this.sprite.body.setOffset(10, 6);

        // State
        this.isHurt = false;
        this.isAttacking = false;
        this.isDead = false;
        this.facingRight = true;
        this.canAttack = true;
        this.invincible = false;
        this.hasSpeedBoost = false;
        this.hasJumpBoost = false;

        // Attack hitbox
        this.attackHitbox = null;

        // Dust particles emitter
        this.createDustEmitter();

        // Play idle animation
        this.sprite.play('idle');
    }

    createDustEmitter() {
        // Create simple dust particles using graphics
        this.dustParticles = [];
    }

    emitDust() {
        const x = this.sprite.x;
        const y = this.sprite.y + this.sprite.displayHeight / 2 - 5;

        for (let i = 0; i < 3; i++) {
            const dust = this.scene.add.circle(
                x + Phaser.Math.Between(-10, 10),
                y,
                Phaser.Math.Between(2, 4),
                0xc4a35a,
                0.6
            );
            dust.setDepth(5);

            this.scene.tweens.add({
                targets: dust,
                y: y - Phaser.Math.Between(10, 25),
                x: dust.x + Phaser.Math.Between(-15, 15),
                alpha: 0,
                scale: 0,
                duration: Phaser.Math.Between(300, 600),
                onComplete: () => dust.destroy()
            });
        }
    }

    update(cursors, keys) {
        if (this.isDead || this.isHurt) return;

        const speed = this.hasSpeedBoost
            ? GAME_CONFIG.PLAYER_RUN_SPEED * 1.5
            : GAME_CONFIG.PLAYER_SPEED;
        const runSpeed = this.hasSpeedBoost
            ? GAME_CONFIG.PLAYER_RUN_SPEED * 1.5
            : GAME_CONFIG.PLAYER_RUN_SPEED;
        const jumpForce = this.hasJumpBoost
            ? GAME_CONFIG.PLAYER_JUMP_FORCE * 1.3
            : GAME_CONFIG.PLAYER_JUMP_FORCE;

        const isRunning = keys.shift && keys.shift.isDown;
        const currentSpeed = isRunning ? runSpeed : speed;

        const onGround = this.sprite.body.onFloor() || this.sprite.body.touching.down;

        // Horizontal movement
        if (cursors.left.isDown || (keys.a && keys.a.isDown)) {
            this.sprite.setVelocityX(-currentSpeed);
            this.facingRight = false;
            this.sprite.setFlipX(true);

            if (onGround && !this.isAttacking) {
                if (isRunning) {
                    if (this.sprite.anims.currentAnim?.key !== 'run') {
                        this.sprite.play('run');
                    }
                } else {
                    if (this.sprite.anims.currentAnim?.key !== 'walk') {
                        this.sprite.play('walk');
                    }
                }
                // Emit dust while running
                if (Math.random() < 0.3) this.emitDust();
            }
        } else if (cursors.right.isDown || (keys.d && keys.d.isDown)) {
            this.sprite.setVelocityX(currentSpeed);
            this.facingRight = true;
            this.sprite.setFlipX(false);

            if (onGround && !this.isAttacking) {
                if (isRunning) {
                    if (this.sprite.anims.currentAnim?.key !== 'run') {
                        this.sprite.play('run');
                    }
                } else {
                    if (this.sprite.anims.currentAnim?.key !== 'walk') {
                        this.sprite.play('walk');
                    }
                }
                if (Math.random() < 0.3) this.emitDust();
            }
        } else {
            this.sprite.setVelocityX(0);

            if (onGround && !this.isAttacking) {
                if (this.sprite.anims.currentAnim?.key !== 'idle') {
                    this.sprite.play('idle');
                }
            }
        }

        // Jump
        if ((cursors.up.isDown || cursors.space.isDown || (keys.w && keys.w.isDown)) && onGround) {
            this.sprite.setVelocityY(jumpForce);
            this.sprite.play('jump');
            this.emitDust();
            if (window.soundManager) window.soundManager.playJump();
        }

        // Duck
        if ((cursors.down.isDown || (keys.s && keys.s.isDown)) && onGround) {
            this.sprite.play('duck');
            this.sprite.setVelocityX(0);
        }

        // Air animations
        if (!onGround) {
            if (this.sprite.body.velocity.y > 50) {
                if (this.sprite.anims.currentAnim?.key !== 'fall') {
                    this.sprite.play('fall');
                }
            }
        }

        // Attack
        if ((keys.z && Phaser.Input.Keyboard.JustDown(keys.z)) ||
            (keys.x && Phaser.Input.Keyboard.JustDown(keys.x))) {
            this.attack();
        }
    }

    attack() {
        if (!this.canAttack || this.isAttacking) return;

        this.isAttacking = true;
        this.canAttack = false;

        // Create attack hitbox
        const attackX = this.facingRight
            ? this.sprite.x + 40
            : this.sprite.x - 40;

        this.attackHitbox = this.scene.add.rectangle(
            attackX,
            this.sprite.y,
            30, 30,
            0xff0000, 0
        );
        this.scene.physics.add.existing(this.attackHitbox);
        this.attackHitbox.body.setAllowGravity(false);

        // Visual attack effect
        const slashEffect = this.scene.add.circle(
            attackX, this.sprite.y, 15, 0xFFD700, 0.6
        );
        slashEffect.setDepth(10);

        this.scene.tweens.add({
            targets: slashEffect,
            scale: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => slashEffect.destroy()
        });

        // Play duck animation as attack (since there's no dedicated attack sprite)
        this.sprite.play('duck');

        // Notify combat system
        if (this.scene.combatSystem) {
            this.scene.combatSystem.playerAttack(this.attackHitbox);
        }

        if (window.soundManager) window.soundManager.playAttack();

        // Clean up
        this.scene.time.delayedCall(200, () => {
            if (this.attackHitbox) {
                this.attackHitbox.destroy();
                this.attackHitbox = null;
            }
            this.isAttacking = false;
        });

        this.scene.time.delayedCall(400, () => {
            this.canAttack = true;
        });
    }

    takeDamage() {
        if (this.invincible || this.isDead) return;

        this.isHurt = true;
        this.invincible = true;

        GameState.lives--;

        // Hurt animation
        this.sprite.play('hurt');
        if (window.soundManager) window.soundManager.playHurt();

        // Knockback
        const knockbackDir = this.facingRight ? -1 : 1;
        this.sprite.setVelocity(knockbackDir * 150, -200);

        // Flash effect (invincibility frames)
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 10,
            onComplete: () => {
                this.sprite.setAlpha(1);
                this.invincible = false;
            }
        });

        // Red tint
        this.sprite.setTint(0xff0000);
        this.scene.time.delayedCall(200, () => {
            this.sprite.clearTint();
            this.isHurt = false;
        });

        // Screen shake
        this.scene.cameras.main.shake(200, 0.01);

        // Check death
        if (GameState.lives <= 0) {
            this.die();
        }

        // Update HUD
        if (this.scene.scene.isActive('UIScene')) {
            this.scene.events.emit('player-hurt');
        }
    }

    die() {
        this.isDead = true;
        this.sprite.play('hurt');
        this.sprite.setVelocity(0, -300);
        this.sprite.body.setAllowGravity(true);

        // Fade and disable
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            duration: 1000,
            delay: 500,
            onComplete: () => {
                this.scene.events.emit('player-died');
            }
        });
    }

    applySpeedBoost(duration) {
        this.hasSpeedBoost = true;
        GameState.powerUps.speed = true;

        // Visual feedback
        this.sprite.setTint(0x00ffff);

        this.scene.time.delayedCall(duration || GAME_CONFIG.SPEED_BOOST_DURATION, () => {
            this.hasSpeedBoost = false;
            GameState.powerUps.speed = false;
            this.sprite.clearTint();
        });
    }

    applyJumpBoost(duration) {
        this.hasJumpBoost = true;
        GameState.powerUps.jump = true;

        // Visual feedback
        this.sprite.setTint(0xff00ff);

        this.scene.time.delayedCall(duration || GAME_CONFIG.JUMP_BOOST_DURATION, () => {
            this.hasJumpBoost = false;
            GameState.powerUps.jump = false;
            this.sprite.clearTint();
        });
    }

    // Handle touch/mobile input
    updateMobile(moveDir, jumping, attacking) {
        if (this.isDead || this.isHurt) return;

        const speed = this.hasSpeedBoost
            ? GAME_CONFIG.PLAYER_RUN_SPEED * 1.5
            : GAME_CONFIG.PLAYER_SPEED;
        const jumpForce = this.hasJumpBoost
            ? GAME_CONFIG.PLAYER_JUMP_FORCE * 1.3
            : GAME_CONFIG.PLAYER_JUMP_FORCE;

        const onGround = this.sprite.body.onFloor() || this.sprite.body.touching.down;

        if (moveDir < 0) {
            this.sprite.setVelocityX(-speed);
            this.facingRight = false;
            this.sprite.setFlipX(true);
            if (onGround && !this.isAttacking) this.sprite.play('walk', true);
            if (onGround && Math.random() < 0.3) this.emitDust();
        } else if (moveDir > 0) {
            this.sprite.setVelocityX(speed);
            this.facingRight = true;
            this.sprite.setFlipX(false);
            if (onGround && !this.isAttacking) this.sprite.play('walk', true);
            if (onGround && Math.random() < 0.3) this.emitDust();
        } else {
            this.sprite.setVelocityX(0);
            if (onGround && !this.isAttacking) this.sprite.play('idle', true);
        }

        if (jumping && onGround) {
            this.sprite.setVelocityY(jumpForce);
            this.sprite.play('jump');
            this.emitDust();
            if (window.soundManager) window.soundManager.playJump();
        }

        if (attacking) {
            this.attack();
        }

        if (!onGround && this.sprite.body.velocity.y > 50) {
            if (this.sprite.anims.currentAnim?.key !== 'fall') {
                this.sprite.play('fall');
            }
        }
    }
}
