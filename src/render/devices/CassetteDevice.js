export class CassetteDevice {
    static draw(ctxC, ctxD, size, frame) {
        ctxC.clearRect(0, 0, size, size);
        ctxD.clearRect(0, 0, size, size);

        const angle = (frame * Math.PI) / 4;
        const centerX = 32; const centerY = 32;
        const cos = Math.cos(angle);
        const thickness = Math.abs(cos);
        const isFaceVisible = cos >= 0;

        const w = 27 * thickness;
        const h = 16;

        if (w > 0) {
            // Черный контур-подложка
            ctxC.fillStyle = '#1a1221'; ctxC.fillRect(centerX - w - 1, centerY - h - 1, w * 2 + 2, h * 2 + 2);
            ctxD.fillStyle = '#000000'; ctxD.fillRect(centerX - w - 1, centerY - h - 1, w * 2 + 2, h * 2 + 2);

            // КОРПУС КАССЕТЫ: Настоящий плоский кирпичик
            ctxC.fillStyle = '#ff7f50'; ctxC.fillRect(centerX - w, centerY - h, w * 2, h * 2);
            ctxD.fillStyle = '#8b4513'; ctxD.fillRect(centerX - w, centerY - h, w * 2, h * 2);

            // Нижний выступ для головки магнитофона (тоже сжимается по оси X)
            const bW = 18 * thickness;
            ctxC.fillStyle = '#ff7f50'; ctxC.fillRect(centerX - bW, centerY + h, bW * 2, 4);
            ctxD.fillStyle = '#8b4513'; ctxD.fillRect(centerX - bW, centerY + h, bW * 2, 4);

            if (isFaceVisible) {
                // Внутренняя бумажная наклейка
                const labelW = 20 * thickness;
                const labelH = 10;
                ctxC.fillStyle = '#e0e0e0'; ctxC.fillRect(centerX - labelW, centerY - labelH, labelW * 2, labelH * 2);
                ctxD.fillStyle = '#bc8f8f'; ctxD.fillRect(centerX - labelW, centerY - labelH, labelW * 2, labelH * 2);

                // Два отверстия под подкассетники
                const holeDist = 8 * thickness;
                ctxC.fillStyle = '#ffffff'; ctxC.fillRect(centerX - holeDist - 2, centerY - 3, 4 * thickness, 6); ctxC.fillRect(centerX + holeDist - 2, centerY - 3, 4 * thickness, 6);
                ctxD.fillStyle = '#555555'; ctxD.fillRect(centerX - holeDist - 2, centerY - 3, 4 * thickness, 6); ctxD.fillRect(centerX + holeDist - 2, centerY - 3, 4 * thickness, 6);

                this.drawFaceClean(ctxC, centerX, holeDist, winW => labelW * 2);
                this.drawFaceDirty(ctxD, centerX, holeDist);
            }
        }

        this.applyAnatomicalDust(ctxD, size, centerX, centerY, w, h);
    }

    static drawFaceClean(ctx, cx, holeDist, winW) {
        ctx.fillStyle = '#000000';
        // Зрачки внутри колесиков задорно подмигивают/смеются (рисуем дуги поверх белого)
        ctx.fillRect(cx - holeDist - 2, 29, 3, 1);
        ctx.fillRect(cx + holeDist - 1, 29, 3, 1);

        // Огромная счастливая улыбка
        ctx.fillRect(cx - 2, 34, 5, 3);
        ctx.clearRect(cx - 1, 34, 3, 1); // Вырез для формы открытого рта
    }

    static drawFaceDirty(ctx, cx, holeDist) {
        ctx.fillStyle = '#1a1221';
        ctx.fillRect(cx - holeDist, 30, 2, 2); ctx.fillRect(cx + holeDist, 30, 2, 2);
        ctx.fillRect(cx - 1, 35, 2, 3);
    }

    static applyAnatomicalDust(ctx, size, cx, cy, w, h) {
        if (w <= 0) return;
        const imgData = ctx.getImageData(0, 0, size, size); const pixels = imgData.data;
        for (let y = 1; y < size - 1; y++) {
            for (let x = 1; x < size - 1; x++) {
                const idx = (y * size + x) * 4;
                if (pixels[idx + 3] > 0) {
                    let chance = 0.03;
                    if (Math.abs(x - cx) >= w - 2 || Math.abs(y - cy) >= h - 2) chance = 0.85; // Скопление грязи по углам прямоугольника кассеты
                    if (Math.random() < chance) {
                        pixels[idx] = 95; pixels[idx + 1] = 85; pixels[idx + 2] = 75;
                    }
                }
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }
}
