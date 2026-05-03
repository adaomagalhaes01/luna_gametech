/**
 * CollisionSystem - Manages world collisions
 * Platforms, items, boundaries
 */
class CollisionSystem {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Setup collision between player and platform group
     */
    setupPlatformCollision(playerSprite, platforms) {
        this.scene.physics.add.collider(playerSprite, platforms);
    }

    /**
     * Setup collision between enemies and platforms
     */
    setupEnemyPlatformCollision(enemies, platforms) {
        enemies.forEach(enemy => {
            this.scene.physics.add.collider(enemy, platforms);
        });
    }

    /**
     * Setup carrot collection
     */
    setupCarrotCollection(playerSprite, carrots, callback) {
        this.scene.physics.add.overlap(playerSprite, carrots, callback, null, this.scene);
    }

    /**
     * Setup star collection
     */
    setupStarCollection(playerSprite, stars, callback) {
        this.scene.physics.add.overlap(playerSprite, stars, callback, null, this.scene);
    }

    /**
     * Setup chest interaction
     */
    setupChestInteraction(playerSprite, chests, callback) {
        this.scene.physics.add.overlap(playerSprite, chests, callback, null, this.scene);
    }

    /**
     * Setup level exit trigger
     */
    setupLevelExit(playerSprite, exitZone, callback) {
        this.scene.physics.add.overlap(playerSprite, exitZone, callback, null, this.scene);
    }

    /**
     * Setup death zone (falling off map)
     */
    setupDeathZone(playerSprite, deathZone, callback) {
        this.scene.physics.add.overlap(playerSprite, deathZone, callback, null, this.scene);
    }
}
