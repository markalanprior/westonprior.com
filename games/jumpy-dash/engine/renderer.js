export class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = 1280;
        this.height = 720;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    clear() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawRect(x, y, w, h, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);
    }

    drawTriangle(x, y, w, h, color) {
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + h);
        this.ctx.lineTo(x + w / 2, y);
        this.ctx.lineTo(x + w, y + h);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawText(text, x, y, size = '20px', color = 'white', align = 'left') {
        this.ctx.fillStyle = color;
        this.ctx.font = `${size} Arial`;
        this.ctx.textAlign = align;
        this.ctx.fillText(text, x, y);
    }

    drawImage(img, x, y, w, h) {
        if (img && img.complete) {
            this.ctx.drawImage(img, x, y, w, h);
        } else {
            // Fallback to a placeholder if image isn't loaded
            this.drawRect(x, y, w, h, '#ff00ff');
        }
    }
}
