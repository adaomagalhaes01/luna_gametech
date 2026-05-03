/**
 * UIScene - Overlay UI scene
 * Runs alongside GameScene for UI elements
 */
class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        // This scene is intentionally minimal
        // The HUD is managed within GameScene to keep camera sync simple
        // This scene can be used for future overlay features

        // Listen for game scene events
        const gameScene = this.scene.get('GameScene');

        if (gameScene) {
            gameScene.events.on('shutdown', () => {
                this.scene.stop();
            });
        }
    }

    update() {
        // UI-specific updates can go here
    }
}
