export class TamagotchiDevice {
    static draw(ctxC, ctxD, size, frame) {
        ctxC.clearRect(0, 0, size, size);
        ctxD.clearRect(0, 0, size, size);

        // Переводим индекс кадра (0-7) в реальный угол поворота в радианах
        const angle = (frame * Math.PI) / 4;

        const centerX = 32;
        const centerY = 32;

        // 1. ОТРИСОВКА КОРПУСА-ЯЙЦА С УЧЕТОМ СФЕРИЧЕСКОГО СЖАТИЯ (3D Объем)
        // Корпус Тамагочи — это пузатый сфероид. При вращении его ширина слегка меняется
        const bodyThickness = 0.85 + Math.abs(Math.cos(angle)) * 0.15;

        // Задняя тень корпуса
        this.draw3DEggShape(ctxC, centerX + 1, centerY + 1, bodyThickness, '#1a1221');
        this.draw3DEggShape(ctxD, centerX + 1, centerY + 1, bodyThickness, '#000000');

        // Основное тело (Фиолетовый SNES-пластик / Малиновый)
        this.draw3DEggShape(ctxC, centerX, centerY, bodyThickness, '#4a154b');
        this.draw3DEggShape(ctxD, centerX, centerY, bodyThickness, '#2d0e30');

        // Неоновая розовая обводка контура из референса
        this.draw3DEggOutline(ctxC, centerX, centerY, bodyThickness, '#ff007f');
        this.draw3DEggOutline(ctxD, centerX, centerY, bodyThickness, '#9c004f');

        // 2. 3D-ПРОЕКЦИЯ КИНЕСКОПНОГО ЭКРАНА
        // Базовые 3D координаты экрана относительно центра яйца
        const screenZ3D = 12; // Экран вынесен вперед на лицевую панель

        // Рассчитываем вращение экрана по оси X и глубину Z
        const screenRotX = Math.cos(angle) * 0; // Нам нужно вращение только по горизонтали
        const screenX = centerX + Math.sin(angle) * screenZ3D;
        const screenW = 32 * Math.abs(Math.cos(angle)); // Сжатие по закону косинуса

        // Проверяем, повернут ли экран к игроку (лицевая сторона)
        const isFaceVisible = Math.cos(angle) >= 0;

        if (isFaceVisible) {
            // Черная глубокая подложка стекла экрана
            this.rect(ctxC, screenX - screenW / 2, 16, screenW, 26, '#2c3e50');
            this.rect(ctxD, screenX - screenW / 2, 16, screenW, 26, '#11151a');

            // Яркий ЖК-дисплей (Зеленый неон)
            const innerW = 28 * Math.abs(Math.cos(angle));
            this.rect(ctxC, screenX - innerW / 2, 18, innerW, 22, '#39ff14');
            this.rect(ctxD, screenX - innerW / 2, 18, innerW, 22, '#227a0d');

            // Художественные диагональные блики на стекле (Плывут вместе с поворотом!)
            ctxC.fillStyle = 'rgba(255, 255, 255, 0.4)';
            const glintShift = Math.sin(angle) * 6;
            ctxC.fillRect(screenX - innerW / 4 + glintShift, 18, 2 * Math.abs(Math.cos(angle)), 22);

            // Отрисовка кавайных лиц прямо на вращающемся дисплее
            this.draw3DFaceClean(ctxC, screenX, screenW);
            this.draw3DFaceDirty(ctxD, screenX, screenW);
        }

        // 3. 3D-ПРОЕКЦИЯ ТРЕХ ЗОЛОТЫХ КНОПОК
        // Задаем трехмерные координаты кнопок на сфере (угол на дуге и высота)
        const btnAngles = [-0.4,0,0.4]; // Углы распределения кнопок на лицевой панели
        const btnY = [48, 51, 48];

        for (let i = 0; i < 3; i++) {
            // Вычисляем трехмерную позицию каждой кнопки с учетом вращения всего Тамагочи
            const totalAngle = btnAngles[i] + angle;

            // Если кнопка ушла на заднюю полусферу — отсекаем её (как на PS1)
            if (Math.cos(totalAngle) >= 0) {
                const buttonRadius = 20; // Расстояние от центра сферы до поверхности пластика
                const bX = centerX + Math.sin(totalAngle) * buttonRadius;
                const bW = 4 * Math.abs(Math.cos(totalAngle)); // Сжатие кнопки у края сферы

                // Тень под кнопкой
                this.rect(ctxC, bX - bW / 2, btnY[i] + 1, bW, 4, '#b8860b');
                this.rect(ctxD, bX - bW / 2, btnY[i] + 1, bW, 4, '#000000');

                // Сама золотая кнопка
                this.rect(ctxC, bX - bW / 2, btnY[i], bW, 4, '#ffd700');
                this.rect(ctxD, bX - bW / 2, btnY[i], bW, 4, '#8a6d0f');

                // Крошечный пиксель-блик на чистой кнопке
                ctxC.fillStyle = '#ffffff';
                ctxC.fillRect(bX - bW / 4, btnY[i], 1, 1);
            }
        }

        // 4. НАЛОЖЕНИЕ АНАТОМИЧЕСКОГО СЛОЯ ПЫЛИ (Только для Dirty)
        this.applyAnatomical3DDust(ctxD, size, angle, isFaceVisible);
    }

    static draw3DEggShape(ctx, cx, cy, thickness, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 20 * thickness, 26, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    static draw3DEggOutline(ctx, cx, cy, thickness, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 20 * thickness, 26, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    static draw3DFaceClean(ctx, screenX, screenW) {
        ctx.fillStyle = '#1a1221';
        const factor = screenW / 32;

        // Вместо обычных точек — счастливые зажмуренные ретро-дуги (^^)
        ctx.fillRect(screenX - 6 * factor, 25, 3 * factor, 1);
        ctx.fillRect(screenX - 5 * factor, 24, 1 * factor, 1);
        ctx.fillRect(screenX + 3 * factor, 25, 3 * factor, 1);
        ctx.fillRect(screenX + 4 * factor, 24, 1 * factor, 1);

        // Широкая открытая улыбка до ушей!
        ctx.fillRect(screenX - 1, 29, 3 * factor, 2);

        // Сочный кавайный румянец
        ctx.fillStyle = '#ffb6c1';
        ctx.fillRect(screenX - 10 * factor, 28, 2 * factor, 1);
        ctx.fillRect(screenX + 8 * factor, 28, 2 * factor, 1);
    }

    static draw3DFaceDirty(ctx, screenX, screenW) {
        ctx.fillStyle = '#1a1221';
        const scaleFactor = screenW / 32;
        // Компактные грустные глазки-крестики
        ctx.fillRect(screenX - 6 * scaleFactor, 24, 2 * scaleFactor, 2);
        ctx.fillRect(screenX + 4 * scaleFactor, 24, 2 * scaleFactor, 2);
        // Грустный ротик
        ctx.fillRect(screenX - 1 * scaleFactor, 30, 3 * scaleFactor, 1);
    }

    static applyAnatomical3DDust(ctx, size, angle, isFaceVisible) {
        const imgData = ctx.getImageData(0, 0, size, size);
        const pixels = imgData.data;

        const dustColors = [
            { r: 115, g: 110, b: 100 }, // Вековая бурая пыль
            { r: 85, g: 80, b: 75 },    // Темный налет гнили
            { r: 145, g: 140, b: 135 }  // Серая паутина
        ];

        // Магия 3D-нанесения пыли по швам вращения
        for (let y = 1; y < size - 1; y++) {
            for (let x = 1; x < size - 1; x++) {
                const idx = (y * size + x) * 4;

                if (pixels[idx + 3] > 0) {
                    const distToCenter = Math.sqrt(Math.pow(x - 32, 2) + Math.pow(y - 32, 2));

                    let chance = 0.03; // Внутренность плоских граней чистая

                    // 1. "Векторный мох" на внешних ребрах сферы (контур запылен всегда на 85%!)
                    if (distToCenter >= 19) chance = 0.85;

                    // 2. Пыль на стыке вращающегося экрана
                    if (isFaceVisible) {
                        const screenX = 32 + Math.sin(angle) * 12;
                        const screenW = 32 * Math.abs(Math.cos(angle));
                        const edgeLeft = Math.floor(screenX - screenW / 2);
                        const edgeRight = Math.floor(screenX + screenW / 2);

                        if ((x === edgeLeft || x === edgeRight) && y >= 16 && y <= 42) {
                            chance = 0.70; // Пыль густо забилась в швы плывущего экрана
                        }
                    }

                    if (Math.random() < chance) {
                        const c = dustColors[Math.floor(Math.random() * dustColors.length)];
                        pixels[idx] = c.r; pixels[idx + 1] = c.g; pixels[idx + 2] = c.b;
                    }
                }
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }

    static rect(ctx, x, y, w, h, color) {
        ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
    }
}
