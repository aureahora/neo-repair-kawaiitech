export class TVDevice {
    static draw(ctxC, ctxD, size, frame) {
        ctxC.clearRect(0, 0, size, size);
        ctxD.clearRect(0, 0, size, size);

        // Рассчитываем углы и тригонометрию вращения куба
        const angle = (frame * Math.PI) / 4;
        const centerX = 32; const centerY = 34;

        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const thickness = Math.abs(cos);
        const sideThickness = Math.abs(sin); // Ширина боковой грани куба!
        const isFaceVisible = cos >= 0;

        // Размеры передней панели телевизора
        const w = 24 * thickness;
        const h = 18;

        // Размеры боковой грани (глубина кинескопного ящика)
        const sideW = 16 * sideThickness;

        if (w >= 0) {
            // 1. ОТРИСОВКА ОБЪЕМНОГО КУБА (КОРОБКИ)
            if (sin > 0) {
                // Телевизор повернут так, что видна ПРАВАЯ/ЗАДНЯЯ боковая грань куба
                const faceShift = -sideW / 2;
                const sideShift = w;

                // Черная подложка тени под всем кубом
                ctxC.fillStyle = '#1a1221'; ctxC.fillRect(centerX + faceShift - w, centerY - h - 1, w * 2 + sideW + 1, h * 2 + 2);
                ctxD.fillStyle = '#000000'; ctxD.fillRect(centerX + faceShift - w, centerY - h - 1, w * 2 + sideW + 1, h * 2 + 2);

                // Передняя панель (основное дерево)
                ctxC.fillStyle = '#8b4513'; ctxC.fillRect(centerX + faceShift - w, centerY - h, w * 2, h * 2);
                ctxD.fillStyle = '#4a2c11'; ctxD.fillRect(centerX + faceShift - w, centerY - h, w * 2, h * 2);

                // Боковая грань (темное дерево в тени для создания 3D-объема коробки)
                ctxC.fillStyle = '#5c2e0b'; ctxC.fillRect(centerX + faceShift + sideShift, centerY - h, sideW, h * 2);
                ctxD.fillStyle = '#2b1a0a'; ctxD.fillRect(centerX + faceShift + sideShift, centerY - h, sideW, h * 2);
            } else {
                // Телевизор повернут так, что видна ЛЕВАЯ боковая грань куба
                const faceShift = sideW / 2;
                const sideShift = -w - sideW;

                ctxC.fillStyle = '#1a1221'; ctxC.fillRect(centerX + faceShift - w - sideW, centerY - h - 1, w * 2 + sideW + 1, h * 2 + 2);
                ctxD.fillStyle = '#000000'; ctxD.fillRect(centerX + faceShift - w - sideW, centerY - h - 1, w * 2 + sideW + 1, h * 2 + 2);

                ctxC.fillStyle = '#8b4513'; ctxC.fillRect(centerX + faceShift - w, centerY - h, w * 2, h * 2);
                ctxD.fillStyle = '#4a2c11'; ctxD.fillRect(centerX + faceShift - w, centerY - h, w * 2, h * 2);

                ctxC.fillStyle = '#5c2e0b'; ctxC.fillRect(centerX + faceShift + sideShift, centerY - h, sideW, h * 2);
                ctxD.fillStyle = '#2b1a0a'; ctxD.fillRect(centerX + faceShift + sideShift, centerY - h, sideW, h * 2);
            }

            // Корректируем смещение центра лицевой панели из-за проекции куба
            const faceCenterX = centerX + (sin > 0 ? -sideW / 2 : sideW / 2);

            // 2. ОТРИСОВКА КИНЕСКОПА И UI (Только если лицо повернуто к игроку)
            if (isFaceVisible) {
                // Две ретро-антенны сверху куба
                ctxC.fillStyle = '#a9a9a9'; ctxD.fillStyle = '#555555';
                ctxC.fillRect(faceCenterX - 6, centerY - h - 5, 1, 5); ctxC.fillRect(faceCenterX + 6, centerY - h - 5, 1, 5);
                ctxD.fillRect(faceCenterX - 6, centerY - h - 5, 1, 5); ctxD.fillRect(faceCenterX + 6, centerY - h - 5, 1, 5);

                // Прямоугольный кинескоп 80-х со скругленными пиксельными углами
                const scrW = 15 * thickness;
                const scrH = 12;
                const scrX = faceCenterX - 3 * thickness; // Сдвиг влево под панель кнопок

                if (scrW > 2) {
                    // Чистый неоновый экран
                    ctxC.fillStyle = '#00ffff'; ctxC.fillRect(scrX - scrW, centerY - scrH, scrW * 2, scrH * 2);
                    // Пиксельное скругление четырех углов (clean)
                    ctxC.clearRect(scrX - scrW, centerY - scrH, 1, 1); ctxC.clearRect(scrX + scrW - 1, centerY - scrH, 1, 1);
                    ctxC.clearRect(scrX - scrW, centerY + scrH - 1, 1, 1); ctxC.clearRect(scrX + scrW - 1, centerY + scrH - 1, 1, 1);

                    // Грязный запыленный экран
                    ctxD.fillStyle = '#4682b4'; ctxD.fillRect(scrX - scrW, centerY - scrH, scrW * 2, scrH * 2);
                    // Пиксельное скругление четырех углов (dirty)
                    ctxD.clearRect(scrX - scrW, centerY - scrH, 1, 1); ctxD.clearRect(scrX + scrW - 1, centerY - scrH, 1, 1);
                    ctxD.clearRect(scrX - scrW, centerY + scrH - 1, 1, 1); ctxD.clearRect(scrX + scrW - 1, centerY + scrH - 1, 1, 1);
                }

                // Панель переключателей справа от экрана
                const pnlX = faceCenterX + 14 * thickness;
                const pnlW = 6 * thickness;
                if (pnlW > 1) {
                    ctxC.fillStyle = '#696969'; ctxC.fillRect(pnlX, centerY - 10, pnlW, 20);
                    ctxD.fillStyle = '#333333'; ctxD.fillRect(pnlX, centerY - 10, pnlW, 20);
                    // Механическая крутилка каналов
                    ctxC.fillStyle = '#1a1221'; ctxC.fillRect(pnlX + 1, centerY - 6, 2, 2);
                    ctxD.fillStyle = '#000000'; ctxD.fillRect(pnlX + 1, centerY - 6, 2, 2);
                }

                // Отрисовка жизнерадостных кавайных лиц
                this.drawFaceClean(ctxC, scrX, scrW * 2);
                this.drawFaceDirty(ctxD, scrX, scrW * 2);
            } else {
                // Задняя стенка телевизора: Вентиляционная перфорация куба ящика
                const ventW = 12 * thickness;
                ctxC.fillStyle = '#221105'; ctxC.fillRect(faceCenterX - ventW / 2, centerY - 6, ventW, 12);
                ctxD.fillStyle = '#110500'; ctxD.fillRect(faceCenterX - ventW / 2, centerY - 6, ventW, 12);
            }

            this.applyAnatomicalDust(ctxD, size, faceCenterX, centerY, w, h);
        }
    }

    static drawFaceClean(ctx, scrX, scrW) {
        ctx.fillStyle = '#000000';
        const factor = scrW / 30;
        if (factor <= 0) return;

        // Глаза-дуги радости ^^
        ctx.fillRect(scrX - 5 * factor, 31, 3 * factor, 1); ctx.fillRect(scrX - 4 * factor, 30, 1 * factor, 1);
        ctx.fillRect(scrX + 2 * factor, 31, 3 * factor, 1); ctx.fillRect(scrX + 3 * factor, 30, 1 * factor, 1);

        // Открытая улыбка
        ctx.fillRect(scrX - 1, 35, 3, 2);

        ctx.fillStyle = '#ffb6c1';
        ctx.fillRect(scrX - 9 * factor, 33, 2, 1); ctx.fillRect(scrX + 7 * factor, 33, 2, 1);
    }

    static drawFaceDirty(ctx, scrX, scrW) {
        ctx.fillStyle = '#1a1221'; const factor = scrW / 30;
        if (factor <= 0) return;
        ctx.fillRect(scrX - 5 * factor, 31, 2, 2); ctx.fillRect(scrX + 3 * factor, 31, 2, 2);
        ctx.fillRect(scrX - 1, 36, 2, 1);
    }

    static applyAnatomicalDust(ctx, size, faceCenterX, centerY, w, h) {
        const imgData = ctx.getImageData(0, 0, size, size); const pixels = imgData.data;
        for (let y = 1; y < size - 1; y++) {
            for (let x = 1; x < size - 1; x++) {
                const idx = (y * size + x) * 4;
                if (pixels[idx + 3] > 0) {
                    let chance = 0.02;
                    // Пыль скапливается на верхней грани куба телевизора
                    if (y <= centerY - h + 3) chance = 0.90;
                    if (Math.abs(x - faceCenterX) >= w - 2) chance = 0.75;
                    if (Math.random() < chance) {
                        pixels[idx] = 75; pixels[idx + 1] = 70; pixels[idx + 2] = 65;
                    }
                }
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }
}
