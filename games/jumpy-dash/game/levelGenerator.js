export class LevelGenerator {
    // Max upward reach from a surface (jumpForce²/(2*gravity) with margin).
    // Modular: 700²/(2*2000)=122.5; Standalone: 800²/(2*2500)=128. Use conservative value.
    static MAX_JUMP_HEIGHT = 110;
    // Max horizontal distance in a single jump (speed * 2*jumpForce/gravity with margin).
    // Modular: 300*0.7=210; Standalone: 400*0.64=256. Use conservative value.
    static MAX_JUMP_DIST = 195;

    /**
     * Compute the max upward step reachable for a given horizontal gap,
     * based on projectile physics with a safety margin.
     * Uses the more limiting modular physics: Vy=700, Vx=300, g=2000.
     * @param {number} gap - Horizontal distance to cross.
     * @returns {number} Maximum upward height reachable (px).
     */
    static maxStepUp(gap) {
        const t = gap / 300;                     // time to cross gap at Vx=300
        const h = 700 * t - 1000 * t * t;        // height at landing
        return Math.max(0, h - 15);               // 15px safety margin
    }

    /**
     * Simple seeded PRNG (Mulberry32) for deterministic, well-distributed randomness.
     * @param {number} seed
     * @returns {() => number} Returns a function that yields 0..1 on each call.
     */
    static seededRandom(seed) {
        return () => {
            seed |= 0;
            seed = (seed + 0x6d2b79f5) | 0;
            let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    static pick(arr, rng) { return arr[Math.floor(rng() * arr.length)]; }
    static randRange(min, max, rng) { return min + rng() * (max - min); }
    static randInt(min, max, rng) { return Math.floor(this.randRange(min, max + 1, rng)); }

    /**
     * AABB overlap test with required spacing margins.
     * @param {object} a - First rect {x, y, w, h}.
     * @param {object} b - Second rect {x, y, w, h}.
     * @param {number} hMargin - Required horizontal gap (px).
     * @param {number} vMargin - Required vertical gap (px).
     * @returns {boolean} True if rects overlap or violate margins.
     */
    static _rectsOverlap(a, b, hMargin = 10, vMargin = 50) {
        return a.x < b.x + b.w + hMargin &&
               a.x + a.w + hMargin > b.x &&
               a.y < b.y + b.h + vMargin &&
               a.y + a.h + vMargin > b.y;
    }

    /**
     * Check if a proposed platform overlaps any existing platform.
     * @param {Array} platforms - Existing platforms.
     * @param {object} plat - Proposed platform {x, y, w, h}.
     * @param {number} [hMargin=10] - Horizontal spacing.
     * @param {number} [vMargin=50] - Vertical spacing.
     * @returns {boolean} True if any overlap detected.
     */
    static _hasOverlap(platforms, plat, hMargin = 10, vMargin = 50) {
        return platforms.some(p => this._rectsOverlap(p, plat, hMargin, vMargin));
    }

    /**
     * Generate a single level by id and difficulty tier.
     * @param {number} id - Level number (1-based).
     * @param {string} difficulty - Difficulty label.
     * @returns {object} Level object.
     */
    static generateLevel(id, difficulty) {
        const rng = this.seededRandom(id * 91573 + 48271);
        const archetypes = this._getArchetypes(id);
        const archetype = this.pick(archetypes, rng);

        const level = {
            id,
            difficulty,
            start: { x: 64, y: 500 },
            goal: { x: 1150, y: 500 },
            platforms: [],
            hazards: []
        };

        const diff = this._difficultyParams(id);

        switch (archetype) {
            case 'gauntlet':  this._buildGauntlet(level, diff, rng);  break;
            case 'platformer': this._buildPlatformer(level, diff, rng); break;
            case 'mixed':     this._buildMixed(level, diff, rng);     break;
            case 'aerial':    this._buildAerial(level, diff, rng);    break;
            case 'zigzag':    this._buildZigzag(level, diff, rng);    break;
            case 'gapcross':  this._buildGapCross(level, diff, rng);  break;
            default:          this._buildMixed(level, diff, rng);
        }

        return level;
    }

    static _getArchetypes(id) {
        if (id <= 3)  return ['gauntlet', 'platformer', 'mixed'];
        if (id <= 10) return ['gauntlet', 'platformer', 'mixed', 'zigzag'];
        if (id <= 25) return ['gauntlet', 'platformer', 'mixed', 'zigzag', 'aerial'];
        return ['gauntlet', 'platformer', 'mixed', 'zigzag', 'aerial', 'gapcross'];
    }

    static _difficultyParams(id) {
        const t = Math.min(1, (id - 1) / 299);
        return {
            spikeCount: Math.min(18, 3 + Math.floor(id * 0.1)),
            platformCount: 2 + Math.floor(id * 0.35),
            movingHazards: Math.min(12, id >= 3 ? 1 + Math.floor((id - 3) / 20) : 0),
            spikeWidth: Math.max(24, 36 - Math.floor(id * 0.05)),
            platformMinW: Math.max(50, 180 - id * 0.5),
            platformMaxW: Math.max(80, 260 - id * 0.4),
            gapMin: Math.min(this.MAX_JUMP_DIST - 40, 80 + t * 80),
            gapMax: Math.min(this.MAX_JUMP_DIST, 140 + t * 60),
        };
    }

    // ─── Archetype Builders ─────────────────────────────────────────

    /**
     * Gauntlet: Full floor with dense ground spikes to dodge.
     * Goal on the right at ground level — always reachable.
     */
    static _buildGauntlet(level, diff, rng) {
        level.platforms.push({ x: 0, y: 600, w: 1280, h: 120 });

        const count = diff.spikeCount + this.randInt(0, 3, rng);
        const spacing = 850 / (count + 1);
        for (let i = 0; i < count; i++) {
            const jitter = this.randRange(-spacing * 0.3, spacing * 0.3, rng);
            const x = 180 + spacing * (i + 1) + jitter;
            if (x > 130 && x < 1080) {
                level.hazards.push({
                    type: 'ground_spike', x, y: 600 - 28,
                    w: this.randInt(24, diff.spikeWidth + 8, rng), h: 28
                });
            }
        }

        const jumpPlatforms = this.randInt(1, Math.min(diff.platformCount, 4), rng);
        for (let i = 0; i < jumpPlatforms; i++) {
            for (let attempt = 0; attempt < 12; attempt++) {
                const py = this.randRange(600 - this.MAX_JUMP_HEIGHT, 540, rng);
                const plat = {
                    x: this.randRange(200, 1000, rng), y: py,
                    w: this.randRange(80, 160, rng), h: 20
                };
                if (!this._hasOverlap(level.platforms, plat)) {
                    level.platforms.push(plat);
                    break;
                }
            }
        }

        this._addMovingHazards(level, diff, rng, 300, 520);
        level.goal = { x: this.randRange(1050, 1180, rng), y: 568 };
    }

    /**
     * Platformer: Chain of platforms leading right. Each step is within jump range.
     */
    static _buildPlatformer(level, diff, rng) {
        level.platforms.push({ x: 0, y: 600, w: 200, h: 120 });

        const count = this.randInt(
            Math.max(3, diff.platformCount - 2),
            diff.platformCount + 2, rng
        );
        let cx = 200;   // track right edge of last platform
        let cy = 560;
        const goalCandidates = [];

        for (let i = 0; i < count; i++) {
            const gap = this.randRange(diff.gapMin, diff.gapMax, rng);
            const maxUp = this.maxStepUp(gap);
            const dy = this.randRange(-Math.min(maxUp, 80), 40, rng);
            const px = cx + gap;
            let py = Math.max(180, Math.min(570, cy + dy));
            const pw = this.randRange(diff.platformMinW, diff.platformMaxW, rng);

            if (px + pw > 1280) break;

            const plat = { x: px, y: py, w: pw, h: 20 };
            if (this._hasOverlap(level.platforms, plat)) {
                let resolved = false;
                for (let nudge = 1; nudge <= 5; nudge++) {
                    plat.y = Math.max(140, py - nudge * 30);
                    if (!this._hasOverlap(level.platforms, plat)) { resolved = true; break; }
                    plat.y = Math.min(570, py + nudge * 30);
                    if (!this._hasOverlap(level.platforms, plat)) { resolved = true; break; }
                }
                if (!resolved) continue;
            }

            cy = plat.y;
            cx = px + pw;
            level.platforms.push(plat);
            goalCandidates.push({ x: px + pw / 2 - 16, y: plat.y - 34 });

            if (rng() < 0.35 && pw > 100) {
                const sx = px + this.randRange(35, pw - 60, rng);
                level.hazards.push({
                    type: 'ground_spike', x: sx, y: plat.y - 28, w: 28, h: 28
                });
            }
        }

        this._addMovingHazards(level, diff, rng, 200, 480);

        if (goalCandidates.length > 0) {
            const g = goalCandidates[goalCandidates.length - 1];
            level.goal = { x: g.x, y: g.y };
        } else {
            level.goal = { x: 1100, y: 568 };
        }
    }

    /**
     * Mixed: Floor with gaps plus elevated platforms.
     * Goal placed on floor OR on a platform within one jump of the floor.
     */
    static _buildMixed(level, diff, rng) {
        const segments = this.randInt(2, 4, rng);
        let fx = 0;
        const segWidth = 1280 / segments;

        for (let i = 0; i < segments; i++) {
            const gapW = (i === 0) ? 0 : this.randRange(60, Math.min(diff.gapMax * 0.7, this.MAX_JUMP_DIST), rng);
            fx += gapW;
            const floorW = segWidth - gapW;
            if (fx + floorW <= 1300 && floorW > 50) {
                level.platforms.push({ x: fx, y: 600, w: floorW, h: 120 });
            }
            fx += floorW;
        }

        for (let i = 0; i < diff.spikeCount; i++) {
            const x = this.randRange(160, 1060, rng);
            if (level.platforms.some(p => p.y === 600 && x >= p.x && x + 30 <= p.x + p.w)) {
                level.hazards.push({ type: 'ground_spike', x, y: 572, w: 30, h: 28 });
            }
        }

        // Elevated platforms within one jump of the floor
        const platCount = this.randInt(2, diff.platformCount, rng);
        for (let i = 0; i < platCount; i++) {
            for (let attempt = 0; attempt < 12; attempt++) {
                const py = this.randRange(600 - this.MAX_JUMP_HEIGHT, 530, rng);
                const plat = {
                    x: this.randRange(150, 1050, rng), y: py,
                    w: this.randRange(diff.platformMinW, diff.platformMaxW, rng), h: 20
                };
                if (!this._hasOverlap(level.platforms, plat)) {
                    level.platforms.push(plat);
                    break;
                }
            }
        }

        this._addMovingHazards(level, diff, rng, 300, 520);

        // Goal on floor or on a reachable elevated platform
        if (rng() < 0.4 && level.platforms.length > 2) {
            // Pick the last elevated platform (guaranteed within jump of floor)
            const lastPlat = level.platforms[level.platforms.length - 1];
            level.goal = { x: lastPlat.x + lastPlat.w / 2, y: lastPlat.y - 34 };
        } else {
            level.goal = { x: this.randRange(1050, 1180, rng), y: 568 };
        }
    }

    /**
     * Aerial: No floor — all elevated platforms chained within jump range.
     */
    static _buildAerial(level, diff, rng) {
        const startY = this.randRange(380, 500, rng);
        level.platforms.push({ x: 30, y: startY, w: 140, h: 20 });
        level.start = { x: 60, y: startY - 34 };

        const count = this.randInt(5, diff.platformCount + 3, rng);
        let cx = 170;   // right edge: 30 + 140
        let cy = startY;

        for (let i = 0; i < count; i++) {
            const gap = this.randRange(80, Math.min(diff.gapMax, this.MAX_JUMP_DIST), rng);
            const maxUp = this.maxStepUp(gap);
            const dy = this.randRange(-Math.min(maxUp, 80), 50, rng);
            const px = cx + gap;
            let py = Math.max(140, Math.min(550, cy + dy));
            const pw = this.randRange(diff.platformMinW * 0.8, diff.platformMaxW * 0.8, rng);

            if (px + pw > 1260) break;

            const plat = { x: px, y: py, w: pw, h: 20 };
            if (this._hasOverlap(level.platforms, plat)) {
                let resolved = false;
                for (let nudge = 1; nudge <= 5; nudge++) {
                    plat.y = Math.max(140, py - nudge * 30);
                    if (!this._hasOverlap(level.platforms, plat)) { resolved = true; break; }
                    plat.y = Math.min(550, py + nudge * 30);
                    if (!this._hasOverlap(level.platforms, plat)) { resolved = true; break; }
                }
                if (!resolved) continue;
            }

            cy = plat.y;
            cx = px + pw;
            level.platforms.push(plat);

            if (rng() < 0.4 && pw > 100) {
                const sx = px + this.randRange(35, pw - 60, rng);
                level.hazards.push({
                    type: 'ground_spike', x: sx, y: plat.y - 28, w: 26, h: 28
                });
            }
        }

        this._addMovingHazards(level, diff, rng, 150, 450);

        const lastPlat = level.platforms[level.platforms.length - 1];
        level.goal = { x: lastPlat.x + lastPlat.w / 2 - 16, y: lastPlat.y - 34 };
    }

    /**
     * Zigzag: Platforms chain left-to-right, alternating UP and DOWN
     * relative to the previous platform. Each step stays within jump range.
     */
    static _buildZigzag(level, diff, rng) {
        level.platforms.push({ x: 0, y: 600, w: 160, h: 120 });

        const count = this.randInt(5, diff.platformCount + 3, rng);
        let cx = 160;   // right edge of starting floor
        let cy = 560;
        let goingUp = true;

        for (let i = 0; i < count; i++) {
            const gap = this.randRange(70, 130, rng);
            const maxUp = this.maxStepUp(gap);
            const step = this.randRange(50, Math.min(maxUp, 95), rng);

            const px = cx + gap;
            let py;
            if (goingUp) {
                py = Math.max(150, cy - step);
            } else {
                py = Math.min(560, cy + step);
            }
            goingUp = !goingUp;

            const pw = this.randRange(diff.platformMinW, diff.platformMaxW, rng);
            if (px + pw > 1260) break;

            const plat = { x: px, y: py, w: pw, h: 20 };
            if (this._hasOverlap(level.platforms, plat)) {
                let resolved = false;
                for (let nudge = 1; nudge <= 5; nudge++) {
                    plat.y = Math.max(140, py - nudge * 30);
                    if (!this._hasOverlap(level.platforms, plat)) { resolved = true; break; }
                    plat.y = Math.min(570, py + nudge * 30);
                    if (!this._hasOverlap(level.platforms, plat)) { resolved = true; break; }
                }
                if (!resolved) continue;
            }

            cy = plat.y;
            cx = px + pw;
            level.platforms.push(plat);

            if (rng() < 0.3 && pw > 100) {
                const sx = px + this.randRange(35, pw - 60, rng);
                level.hazards.push({
                    type: 'ground_spike', x: sx, y: plat.y - 28, w: 28, h: 28
                });
            }
        }

        this._addMovingHazards(level, diff, rng, 200, 480);

        const lastPlat = level.platforms[level.platforms.length - 1];
        level.goal = { x: lastPlat.x + lastPlat.w / 2 - 16, y: lastPlat.y - 34 };
    }

    /**
     * Gap Cross: Floor segments separated by gaps. Gaps capped to jumpable width.
     */
    static _buildGapCross(level, diff, rng) {
        const gapCount = this.randInt(3, 6, rng);
        let fx = 0;

        for (let i = 0; i <= gapCount; i++) {
            const floorW = this.randRange(100, 240, rng);
            level.platforms.push({ x: fx, y: 600, w: floorW, h: 120 });

            if (i > 0 && rng() < 0.5) {
                const sx = fx + this.randRange(10, Math.max(20, floorW - 40), rng);
                level.hazards.push({ type: 'ground_spike', x: sx, y: 572, w: 28, h: 28 });
            }

            fx += floorW;

            if (i < gapCount) {
                const gapW = this.randRange(
                    Math.min(diff.gapMin * 0.8, this.MAX_JUMP_DIST),
                    Math.min(diff.gapMax * 1.1, this.MAX_JUMP_DIST),
                    rng
                );

                // Stepping stone in wider gaps
                if (gapW > 140 || rng() < 0.3) {
                    const stepX = fx + gapW * 0.4;
                    const stepY = this.randRange(500, 570, rng);
                    const stepPlat = { x: stepX, y: stepY, w: 60, h: 20 };
                    if (!this._hasOverlap(level.platforms, stepPlat)) {
                        level.platforms.push(stepPlat);
                    }
                }

                fx += gapW;
            }
        }

        const extraPlats = this.randInt(1, 3, rng);
        for (let i = 0; i < extraPlats; i++) {
            for (let attempt = 0; attempt < 12; attempt++) {
                const py = this.randRange(600 - this.MAX_JUMP_HEIGHT, 530, rng);
                const plat = {
                    x: this.randRange(200, 1000, rng), y: py,
                    w: this.randRange(70, 150, rng), h: 20
                };
                if (!this._hasOverlap(level.platforms, plat)) {
                    level.platforms.push(plat);
                    break;
                }
            }
        }

        this._addMovingHazards(level, diff, rng, 300, 520);
        level.goal = { x: Math.min(fx - 60, 1180), y: 568 };
    }

    // ─── Shared Helpers ─────────────────────────────────────────────

    static _addMovingHazards(level, diff, rng, yMin, yMax) {
        for (let i = 0; i < diff.movingHazards; i++) {
            let attempts = 0;
            let valid = false;
            let hazard = null;
            
            while (!valid && attempts < 50) {
                attempts++;
                const x = this.randRange(180, 1060, rng);
                const w = 24;
                
                // Check for horizontal overlap with ANY existing hazard (ground spikes or other orbs)
                // Use a generous buffer (e.g. 40px) to ensure clear air above spikes.
                const overlap = level.hazards.some(h => {
                    return x < h.x + h.w + 40 && x + w + 40 > h.x;
                });

                if (!overlap) {
                    valid = true;
                    hazard = {
                        type: 'floating_orb',
                        x,
                        y: this.randRange(yMin, yMax, rng),
                        w, h: 24,
                        movement: 'oscillate',
                        offset: rng() * 1000
                    };
                }
            }

            if (valid && hazard) {
                level.hazards.push(hazard);
            }
        }
    }

    static generateSet(count) {
        const levels = [];
        for (let i = 1; i <= count; i++) {
            let diff = 'Beginner';
            if (i > 15) diff = 'Easy';
            if (i > 35) diff = 'Medium';
            if (i > 60) diff = 'Hard';
            if (i > 90) diff = 'Expert';
            if (i > 130) diff = 'Pro';
            if (i > 180) diff = 'Master';
            if (i > 240) diff = 'God';
            levels.push(this.generateLevel(i, diff));
        }
        return levels;
    }
}
