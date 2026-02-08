import { Renderer } from './engine/renderer.js';
import { AudioEngine } from './engine/audio.js';
import { Player } from './game/player.js';
import { LevelManager } from './game/levelManager.js';
import { SaveManager } from './save/saveManager.js';
import { Physics } from './engine/physics.js';

class Game {
    constructor() {
        this.renderer = new Renderer('gameCanvas');
        this.audio = new AudioEngine();
        this.player = new Player();
        this.levelManager = new LevelManager();
        this.saveManager = new SaveManager();
        
        this.keys = {};
        this.lastTime = 0;
        this.running = false;

        window.addEventListener('keydown', e => this.keys[e.key] = true);
        window.addEventListener('keyup', e => this.keys[e.key] = false);
        
        // Expose game to window for UI buttons
        window.game = this;
    }

    async init() {
        await this.levelManager.loadLevels();
        this.saveData = this.saveManager.load();
        this.resetLevel();
    }

    start() {
        document.getElementById('start-menu').classList.remove('active');
        document.getElementById('level-menu').classList.remove('active');
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(t => this.loop(t));
    }

    resetLevel() {
        const level = this.levelManager.getCurrentLevel();
        this.player.reset(level.start.x, level.start.y);
        document.getElementById('hud').innerText = `Level: ${level.id}`;
    }

    loop(currentTime) {
        if (!this.running) return;

        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        this.update(dt);
        this.draw();

        requestAnimationFrame(t => this.loop(t));
    }

    update(dt) {
        const level = this.levelManager.getCurrentLevel();
        
        // Update moving hazards
        for (const hazard of level.hazards) {
            if (hazard.movement === 'oscillate') {
                if (!hazard.originalY) hazard.originalY = hazard.y;
                const offset = hazard.offset || 0;
                hazard.y = hazard.originalY + Math.sin(performance.now() / 500 + hazard.x + offset) * 100;
            }
        }

        const event = this.player.update(dt, this.keys, level.platforms);

        if (event === 'jump') this.audio.playJump();

        // Check hazards
        for (const hazard of level.hazards) {
            if (Physics.checkTriangleCollision(this.player, hazard)) {
                this.player.isDead = true;
            }
        }

        // Check goal
        if (Physics.checkRectCollision(this.player, { ...level.goal, w: 32, h: 32 })) {
            this.audio.playLevelComplete();
            if (this.levelManager.nextLevel()) {
                this.resetLevel();
            } else {
                alert('You win!');
                this.running = false;
            }
        }

        if (this.player.isDead) {
            this.audio.playDeath();
            this.resetLevel();
        }

        if (this.keys['r']) this.resetLevel();
    }

    draw() {
        this.renderer.clear();
        const level = this.levelManager.getCurrentLevel();

        // Draw platforms
        for (const p of level.platforms) {
            this.renderer.drawRect(p.x, p.y, p.w, p.h, '#444');
        }

        // Draw hazards
        for (const h of level.hazards) {
            if (h.type === 'ground_spike') {
                this.renderer.drawTriangle(h.x, h.y, h.w, h.h, '#ff0000');
            } else if (h.type === 'floating_orb') {
                this.renderer.drawRect(h.x, h.y, h.w, h.h, '#ff00ff'); // Purple orb
            }
        }

        // Draw goal
        this.renderer.drawRect(level.goal.x, level.goal.y, 32, 32, '#ffff00');

        this.player.draw(this.renderer);
    }

    showLevelSelect() {
        document.getElementById('start-menu').classList.remove('active');
        document.getElementById('level-menu').classList.add('active');
    }

    showStartMenu() {
        document.getElementById('level-menu').classList.remove('active');
        document.getElementById('start-menu').classList.add('active');
    }

    startLevel() {
        const input = document.getElementById('level-input');
        let levelId = parseInt(input.value) || 1;
        // Clamp levelId between 1 and 300
        levelId = Math.max(1, Math.min(levelId, 300));
        
        this.levelManager.currentLevelIndex = levelId - 1;
        this.resetLevel();
        this.start();
    }
}

const game = new Game();
game.init();
