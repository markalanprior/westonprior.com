import { LevelGenerator } from './levelGenerator.js';

export class LevelManager {
    constructor() {
        this.levels = [];
        this.currentLevelIndex = 0;
    }

    async loadLevels() {
        this.levels = LevelGenerator.generateSet(300);
    }

    getCurrentLevel() {
        return this.levels[this.currentLevelIndex];
    }

    nextLevel() {
        if (this.currentLevelIndex < this.levels.length - 1) {
            this.currentLevelIndex++;
            return true;
        }
        return false;
    }
}
