import { Physics } from '../engine/physics.js';

export class Player {
    constructor() {
        this.reset();
        this.w = 32;
        this.h = 32;
        this.speed = 300;
        this.jumpForce = -700;
        this.gravity = 2000;
        this.color = '#00ff00';

        this.image = new Image();
        this.image.src = 'weston_profilke.png';
    }

    reset(x = 100, y = 100) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.isDead = false;
    }

    update(dt, keys, platforms) {
        if (this.isDead) return;

        // Horizontal movement
        this.vx = 0;
        if (keys['ArrowLeft'] || keys['a']) this.vx = -this.speed;
        if (keys['ArrowRight'] || keys['d']) this.vx = this.speed;
        this.x += this.vx * dt;

        // Gravity
        this.vy += this.gravity * dt;
        this.y += this.vy * dt;

        // Jump
        if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && this.onGround) {
            this.vy = this.jumpForce;
            this.onGround = false;
            return 'jump';
        }

        // Platform collisions
        this.onGround = false;
        for (const platform of platforms) {
            if (Physics.resolvePlatformCollision(this, platform)) {
                // Landed
            }
        }

        // Screen bounds
        if (this.y > 720) this.isDead = true;
        if (this.x < 0) this.x = 0;
        if (this.x + this.w > 1280) this.x = 1280 - this.w;
    }

    draw(renderer) {
        renderer.drawImage(this.image, this.x, this.y, this.w, this.h);
    }
}
