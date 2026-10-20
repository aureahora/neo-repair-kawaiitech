export class FloppyDevice {
    static draw(ctxC, ctxD, size, frame) {
        ctxC.clearRect(0, 0, size, size);
        ctxD.clearRect(0, 0, size, size);

        const angle = (frame * Math.PI) / 4;
        const centerX = 32; const centerY = 32;

        // Коэффициент сжатия строго по закону косинуса для плоского квадрата
        const cos = Math.cos(angle);
        const thickness = Math.abs(cos);
        const isFaceVisible = cos >= 0;

        // Половина ширины и высоты дискеты в пикселях
        const w = 24 * thickness;
        const h = 24;

        if (w > 0) {
            // Задняя тень (черный контур)
            this.draw3DRect(ctxC, centerX - w, centerY - h, w * 2 + 1, h * 2 + 1, '#1a1221');
            this.draw3DRect(ctxD, centerX - w, centerY - h, w * 2 + 1, h * 2 + 1, '#000000');

            // ТЕЛО ДИСКЕТЫ: Строгий прямоугольник без овалов!
            this.draw3DRect(ctxC, centerX - w, centerY - h, w * 2, h * 2, '#4169e1'); // Синяя clean
            this.draw3DRect(ctxD, centerX - w, centerY - h, w * 2, h * 2, '#27408b'); // Грязно-синяя dirty

            if (isFaceVisible) {
                // Металлическая шторка сверху
                const shutterW = 16 * thickness;
                ctxC.fillStyle = '#c0c0c0'; ctxC.fillRect(centerX - shutterW / 2 + (Math.sin(angle) * 3), centerY - 20, shutterW, 10);
                ctxD.fillStyle = '#708090'; ctxD.fillRect(centerX - shutterW / 2 + (Math.sin(angle) * 3), centerY - 20, shutterW, 10);

                // Белая наклейка внизу
                const labelW = 36 * thickness;
                ctxC.fillStyle = '#ffffff'; ctxC.fillRect(centerX - labelW / 2, centerY, labelW, 16);
                ctxD.fillStyle = '#e6e6fa'; ctxD.fillRect(centerX - labelW / 2, centerY, labelW, 16);

                this.drawFaceClean(ctxC, centerX, labelW);
                this.drawFaceDirty(ctxD, centerX, labelW);
            } else {
                // Задняя сторона: Металлический круглый шпиндель (сжимается в эллипс)
                if (w > 6) {
                    ctxC.fillStyle = '#a9a9a9'; ctxC.beginPath(); ctxC.ellipse(centerX, centerY, 6 * thickness, 6, 0, 0, Math.PI * 2); ctxC.fill();
                    ctxD.fillStyle = '#444444'; ctxD.beginPath(); ctxD.ellipse(centerX, centerY, 6 * thickness, 6, 0, 0, Math.PI * 2); ctxD.fill();
                }
            }
        }

        this.applyAnatomicalDust(ctxD, size, centerX, centerY, w, h);
    }

    static draw3DRact(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
    static draw3DRect(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }

    static drawFaceClean(ctx, cx, labelW) {
        ctx.fillStyle = '#000000';
        const factor = labelW / 36;

        // Веселые дуги ^^
        ctx.fillRect(cx - 8 * factor, 36, 3 * factor, 1); ctx.fillRect(cx - 7 * factor, 35, 1 * factor, 1);
        ctx.fillRect(cx + 5 * factor, 36, 3 * factor, 1); ctx.fillRect(cx + 6 * factor, 35, 1 * factor, 1);

        // Открытый радостный рот квадратиком
        ctx.fillRect(cx - 1, 41, 3, 2);

        ctx.fillStyle = '#ffb6c1';
        ctx.fillRect(cx - 12 * factor, 39, 2, 1); ctx.fillRect(cx + 10 * factor, 39, 2, 1);
    }

    static drawFaceDirty(ctx, cx, labelW) {
        ctx.fillStyle = '#5c5c5c'; const factor = labelW / 36;
        ctx.fillRect(cx - 8 * factor, 36, 4 * factor, 1); ctx.fillRect(cx + 4 * factor, 36, 4 * factor, 1);
        ctx.fillRect(cx - 1, 41, 2, 2);
    }

    static applyAnatomicalDust(ctx, size, cx, cy, w, h) {
        if (w <= 0) return;
        const imgData = ctx.getImageData(0, 0, size, size); const pixels = imgData.data;
        for (let y = 1; y < size - 1; y++) {
            for (let x = 1; x < size - 1; x++) {
                const idx = (y * size + x) * 4;
                if (pixels[idx + 3] > 0) {
                    let chance = 0.02;
                    // Густая пыль строго по краям прямоугольной формы дискеты!
                    if (Math.abs(x - cx) >= w - 2 || Math.abs(y - cy) >= h - 2) chance = 0.85;
                    if (Math.random() < chance) {
                        pixels[idx] = 110; pixels[idx + 1] = 105; pixels[idx + 2] = 95;
                    }
                }
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }
}
