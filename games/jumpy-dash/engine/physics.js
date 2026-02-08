export class Physics {
    static checkRectCollision(r1, r2) {
        return r1.x < r2.x + r2.w &&
               r1.x + r1.w > r2.x &&
               r1.y < r2.y + r2.h &&
               r1.y + r1.h > r2.y;
    }

    // Simplified triangle collision (using rect for now as per spec fallback)
    static checkTriangleCollision(rect, tri) {
        return this.checkRectCollision(rect, tri);
    }

    static applyGravity(entity, gravity, dt) {
        entity.vy += gravity * dt;
        entity.y += entity.vy * dt;
    }

    static resolvePlatformCollision(entity, platform) {
        if (this.checkRectCollision(entity, platform)) {
            // Check if falling onto platform
            if (entity.vy > 0 && entity.y + entity.h - entity.vy <= platform.y) {
                entity.y = platform.y - entity.h;
                entity.vy = 0;
                entity.onGround = true;
                return true;
            }
        }
        return false;
    }
}
