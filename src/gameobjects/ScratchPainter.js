export class ScratchPainter {
    constructor(scene, targetX, targetY, brushRadius, currentIdx) {
        this.scene = scene;
        this.targetX = targetX;
        this.targetY = targetY;
        this.brushRadius = 3; // ЖЕСТКО: Уменьшаем радиус до 3 пикселей для ювелирной точности!
        this.currentIdx = currentIdx;

        this.width = 64;
        this.height = 64;

        this.silhouettePoints = [];
        this.washedPoints = new Set();

        // Создаем массив из 8 независимых слоев RenderTexture под каждый 3D-кадр
        this.rtLayers = [];

        for (let frame = 0; frame < 8; frame++) {
            const rt = scene.add.renderTexture(targetX, targetY, this.width, this.height);
            rt.setOrigin(0.5);
            rt.draw(`dirty_${currentIdx}_f${frame}`, 0, 0);
            if (frame > 0) rt.setVisible(false);
            this.rtLayers.push(rt);
        }

        this.sprite = this.rtLayers;

        // ИСПРАВЛЕНО: Вместо огромного квадрата рисуем МЯГКИЙ КРУГЛЫЙ пиксельный скребок!
        this.brush = scene.make.graphics({ x: 0, y: 0, add: false });
        this.brush.fillStyle(0xffffff, 1);
        this.brush.fillCircle(this.brushRadius, this.brushRadius, this.brushRadius);

        this.generateGridPoints();
    }

    generateGridPoints() {
        for (let y = 4; y < this.height - 4; y += 2) {
            for (let x = 4; x < this.width - 4; x += 2) {
                this.silhouettePoints.push({ x: x, y: y });
            }
        }
    }

    setActiveFrame(frameIndex) {
        this.rtLayers.forEach((rt, index) => {
            if (rt) rt.setVisible(index === frameIndex);
        });
    }

    eraseAt(pointer, container, activeFrame) {
        const containerScale = container.scaleX;
        const activeRt = this.rtLayers[activeFrame];
        if (!activeRt) return 0;

        const spriteScale = activeRt.scaleX;

        const relX = (pointer.x - container.x) / containerScale;
        const relY = (pointer.y - container.y) / containerScale;

        const localX = (relX / spriteScale) + this.width / 2;
        const localY = (relY / spriteScale) + this.height / 2;

        if (localX < 0 || localX >= this.width || localY < 0 || localY >= this.height) return 0;

        // Стираем круглым скребком строго в локальной точке
        activeRt.erase(this.brush, localX - this.brushRadius, localY - this.brushRadius);

        this.silhouettePoints.forEach((point, index) => {
            if (!this.washedPoints.has(index)) {
                if (Math.abs(localX - point.x) <= this.brushRadius && Math.abs(localY - point.y) <= this.brushRadius) {
                    this.washedPoints.add(index);
                }
            }
        });

        if (this.silhouettePoints.length === 0) return 0;
        return Math.min(Math.floor((this.washedPoints.size / this.silhouettePoints.length) * 100), 100);
    }

    destroy() {
        this.rtLayers.forEach(rt => { if (rt) rt.destroy(); });
        if (this.brush) this.brush.destroy();
    }
}
