export class GamepadDevice {
    static draw(ctxC, ctxD, size, frame) {
        ctxC.clearRect(0, 0, size, size);
        ctxD.clearRect(0, 0, size, size);

        const angle = (frame * Math.PI) / 4;
        const centerX = 32; const centerY = 32;
        const thickness = Math.abs(Math.cos(angle));
        const isFaceVisible = Math.cos(angle) >= 0;

        const w = 28 * thickness;
        const h = 13; // Тонкий вытянутый прямоугольник контроллера

        if (w > 0) {
            // Задний контур тени
            ctxC.fillStyle = '#1a1221'; ctxC.fillRect(centerX - w - 1, centerY - h - 1, w * 2 + 2, h * 2 + 2);
            ctxD.fillStyle = '#000000'; ctxD.fillRect(centerX - w - 1, centerY - h - 1, w * 2 + 2, h * 2 + 2);

            // КОРПУС ГЕЙМПАДА: Четкие прямые углы
            ctxC.fillStyle = '#d3d3d3'; ctxC.fillRect(centerX - w, centerY - h, w * 2, h * 2);
            ctxD.fillStyle = '#708090'; ctxD.fillRect(centerX - w, centerY - h, w * 2, h * 2);

            if (isFaceVisible) {
                // Черная внутренняя рамка геймпада
                const innerW = 25 * thickness;
                const innerH = 10;
                ctxC.fillStyle = '#1a1221'; ctxC.fillRect(centerX - innerW, centerY - innerH, innerW * 2, innerH * 2);
                ctxD.fillStyle = '#121212'; ctxD.fillRect(centerX - innerW, centerY - innerH, innerW * 2, innerH * 2);

                const dpadOffset = 15 * thickness;

                // Крестовина D-Pad (Слева)
                ctxC.fillStyle = '#2c3e50'; ctxD.fillStyle = '#222222';
                ctxC.fillRect(centerX - dpadOffset - 2, centerY - 4, 4 * thickness, 8);
                ctxC.fillRect(centerX - dpadOffset - 4, centerY - 2, 8 * thickness, 4);
                ctxD.fillRect(centerX - dpadOffset - 2, centerY - 4, 4 * thickness, 8);
                ctxD.fillRect(centerX - dpadOffset - 4, centerY - 2, 8 * thickness, 4);

                // Две красные кнопки А/B (Справа)
                ctxC.fillStyle = '#ff0000'; ctxD.fillStyle = '#8b0000';
                ctxC.fillRect(centerX + dpadOffset - 4, centerY - 2, 3 * thickness, 4);
                ctxC.fillRect(centerX + dpadOffset + 1, centerY - 2, 3 * thickness, 4);
                ctxD.fillRect(centerX + dpadOffset - 4, centerY - 2, 3 * thickness, 4);
                ctxD.fillRect(centerX + dpadOffset + 1, centerY - 2, 3 * thickness, 4);

                this.drawFaceClean(ctxC, centerX, w);
                this.drawFaceDirty(ctxD, centerX, w);
            }
        }

        this.applyAnatomicalDust(ctxD, size, centerX, centerY, w, h);
    }

    static drawFaceClean(ctx, cx, width) {
        ctx.fillStyle = '#ffffff';
        // На темном фоне геймпада белые глазки зажмурились от счастья
        ctx.fillRect(cx - 4, 27, 3, 1); ctx.fillRect(cx - 3, 26, 1, 1);
        ctx.fillRect(cx + 2, 27, 3, 1); ctx.fillRect(cx + 3, 26, 1, 1);

        ctx.fillStyle = '#ff69b4'; ctx.fillRect(cx - 6, 29, 2, 1); ctx.fillRect(cx + 5, 29, 2, 1);

        // Довольная ретро-улыбка
        ctx.fillStyle = '#ffffff'; ctx.fillRect(cx - 1, 30, 3, 2);
    }

    static drawFaceDirty(ctx, cx, width) {
        ctx.fillStyle = '#111111';
        ctx.fillRect(cx - 3, 28, 2, 1); ctx.fillRect(cx + 2, 28, 2, 1);
        ctx.fillRect(cx - 1, 31, 2, 1);
    }

    static applyAnatomicalDust(ctx, size, cx, cy, w, h) {
        if (w <= 0) return;
        const imgData = ctx.getImageData(0, 0, size, size); const pixels = imgData.data;
        for (let y = 1; y < size - 1; y++) {
            for (let x = 1; x < size - 1; x++) {
                const idx = (y * size + x) * 4;
                if (pixels[idx + 3] > 0) {
                    let chance = 0.02;
                    if (Math.abs(x - cx) >= w - 2 || Math.abs(y - cy) >= h - 2) chance = 0.85;
                    if (Math.random() < chance) {
                        pixels[idx] = 130; pixels[idx + 1] = 110; pixels[idx + 2] = 80;
                    }
                }
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }
}
