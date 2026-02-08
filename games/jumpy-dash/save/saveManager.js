export class SaveManager {
    constructor() {
        this.key = 'jumpy_dash_pro_save';
    }

    save(data) {
        localStorage.setItem(this.key, JSON.stringify(data));
    }

    load() {
        const data = localStorage.getItem(this.key);
        return data ? JSON.parse(data) : { highestLevelCompleted: 0, unlockedLevels: [1], settings: {} };
    }
}
