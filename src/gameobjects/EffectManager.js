export class EffectManager {
    constructor(scene) {
        this.scene = scene;
        this.soundCounter = 0;

        // Создаем базовую пиксельную текстуру 4х4
        if (!scene.textures.exists('snes_dust_base')) {
            const tex = scene.textures.createCanvas('snes_dust_base', 4, 4);
            const ctx = tex.context;
            ctx.clearRect(0, 0, 4, 4);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 4, 4);
            tex.refresh();
        }

        // Пул для наших кастомных частиц-пикселей
        this.particlesPool = [];

        // ГЛАВНЫЙ ИСПРАВЛЕННЫЙ ЦИКЛ ОБНОВЛЕНИЯ: Наш код — единственный закон внутри игры
        this.scene.events.on('update', (time, delta) => {
            const dt = delta / 1000; // Просчет времени для плавной физики без привязки к FPS

            // Итерируемся по массиву с конца, чтобы безопасно удалять умершие частицы
            for (let i = this.particlesPool.length - 1; i >= 0; i--) {
                const p = this.particlesPool[i];

                p.timer += delta;
                p.alpha = 1 - (p.timer / p.lifespan); // Плавное растворение по времени жизни

                // Если время жизни вышло — уничтожаем спрайт и убираем из пула
                if (p.timer >= p.lifespan) {
                    p.destroy();
                    this.particlesPool.splice(i, 1);
                    continue;
                }

                // Уменьшаем масштаб со временем
                p.setScale(Phaser.Math.Linear(p.startScale, 0.4, p.timer / p.lifespan));

                if (p.isHeavy) {
                    // ==========================================
                    // ФИЗИКА ДЛЯ ТЕМНО-БУРОЙ ГРЯЗИ: Тяжелый шлейф под 45°
                    // ==========================================
                    // Применяем стартовый хаотичный импульс взрыва, который со временем затухает
                    p.vx = Phaser.Math.Linear(p.vx, 180, 5 * dt);
                    p.vy = Phaser.Math.Linear(p.vy, 180, 5 * dt);

                    // Двигаем пиксель
                    p.x += p.vx * dt;
                    p.y += (p.vy + Math.sin(p.timer * 0.02) * 40) * dt; // Микро-турбулентность
                } else {
                    // ==========================================
                    // ФИЗИКА ДЛЯ СЕРОЙ ПЫЛИ: ASMR-Снегопад по фазам
                    // ==========================================
                    if (p.stage === 1) {
                        // Фаза 1: Первичный мощный вырыв вперед под 45 градусов из сопла
                        p.x += p.vx * dt;
                        p.y += p.vy * dt;

                        // Когда частица отлетела на расстояние первичного потока воздуха
                        if (p.timer >= p.stage1Duration) {
                            p.stage = 2;
                        }
                    }
                    else if (p.stage === 2) {
                        // Фаза 2: Спиральный взлет вверх до края экрана
                        p.vy = Phaser.Math.Linear(p.vy, -220, 8 * dt); // Разворачиваем вектор вверх
                        p.y += p.vy * dt;

                        // Спиральное вращение по оси X
                        p.x += Math.sin(p.timer * p.spiralSpeed) * p.spiralRadius;

                        // Достигли верха экрана (Y <= 15) — переключаемся на маятниковый снегопад
                        if (p.y <= 15) {
                            p.stage = 3;
                        }
                    }
                    else if (p.stage === 3) {
                        // Фаза 3: Медленное падение "ёлочкой" (маятником) до самого низа
                        p.y += p.snowFallSpeed * dt; // Фиксированная скорость падения вниз

                        // Раскачивание влево-вправо (уникальный маятник для каждой снежинки)
                        p.x += Math.sin(time * 0.003 + p.swingOffset) * p.snowSwingWidth;
                    }
                }
            }
        });

        // Заглушка, чтобы Game.js не падал при обращении (так как эмиттера больше нет)
        this.bubbleParticles = { setDepth: () => {} };
    }

    spawnAsmrBubble(globalNozzleX, globalNozzleY, detectedColor) {
        // Логика визуальных кастомных частиц (остается огненной и сочной)
        const r = (detectedColor >> 16) & 0xff;
        const g = (detectedColor >> 8) & 0xff;
        const b = detectedColor & 0xff;
        const isHeavy = (r > b + 10) || (r < 100 && g < 100 && b < 90);

        const count = Phaser.Math.Between(5, 10);

        for (let i = 0; i < count; i++) {
            const p = this.scene.add.image(globalNozzleX, globalNozzleY, 'snes_dust_base');
            p.setDepth(300);
            p.setTint(detectedColor);

            const baseSpeed = Phaser.Math.FloatBetween(140, 320);
            const randomAngle = Phaser.Math.FloatBetween(Math.PI * 0.05, Math.PI * 0.45);

            p.vx = Math.cos(randomAngle) * baseSpeed;
            p.vy = Math.sin(randomAngle) * baseSpeed;

            p.isHeavy = isHeavy;
            p.timer = 0;
            p.lifespan = p.isHeavy ? Phaser.Math.FloatBetween(1500, 2500) : Phaser.Math.FloatBetween(5000, 6500);
            p.startScale = Phaser.Math.FloatBetween(2.5, 3.5);
            p.setScale(p.startScale);

            p.stage = 1;
            p.stage1Duration = Phaser.Math.FloatBetween(250, 400);
            p.spiralRadius = Phaser.Math.FloatBetween(1.5, 3.5);
            p.spiralSpeed = Phaser.Math.FloatBetween(0.01, 0.02);
            p.snowFallSpeed = Phaser.Math.FloatBetween(50, 85);
            p.snowSwingWidth = Phaser.Math.FloatBetween(1.2, 2.2);
            p.swingOffset = Math.random() * 100;

            this.particlesPool.push(p);
        }

        // БЕЗОПАСНЫЙ 8-битный ASMR-звук пыли через клик (без вызова .has)
        this.soundCounter++;
        if (this.soundCounter % 6 === 0) {
            try {
                this.scene.sound.play('click_sound', { pitch: Phaser.Math.FloatBetween(1.6, 2.3), volume: 0.08 });
            } catch (e) {
                // Если звук не догрузился в браузере, игра просто продолжит работать без падения
            }
        }
    }

    spawnVictoryFirework(container) {
        const fireworkColors = [0xffffff, 0xff00ff, 0x00ffff, 0x39ff14, 0xffff00];

        fireworkColors.forEach((color, index) => {
            this.scene.time.delayedCall(index * 150, () => {
                const burstX = Phaser.Math.Between(120, 520);
                const burstY = Phaser.Math.Between(60, 140);

                // Проигрываем взрыв салюта напрямую (без вызова .has)
                try {
                    this.scene.sound.play('firework_sound', { volume: 0.25, pitch: Phaser.Math.FloatBetween(0.9, 1.2) });
                } catch (e) {}

                for (let i = 0; i < 25; i++) {
                    const fp = this.scene.add.image(burstX, burstY, 'snes_dust_base');
                    const bigScale = Phaser.Math.FloatBetween(5.0, 8.0);
                    fp.setDepth(300).setTint(color).setScale(bigScale);

                    const angle = Math.random() * Math.PI * 2;
                    const speed = Phaser.Math.FloatBetween(100, 240);

                    let vx = Math.cos(angle) * speed;
                    let vy = Math.sin(angle) * speed;
                    let gravity = 120;
                    let timer = 0;

                    const fireworkUpdate = (time, delta) => {
                        const dt = delta / 1000;
                        timer += delta;
                        vy += gravity * dt;
                        fp.x += vx * dt;
                        fp.y += vy * dt;

                        const progress = timer / 1200;
                        fp.alpha = 1 - progress;
                        fp.setScale(Phaser.Math.Linear(bigScale, 0.5, progress));

                        if (timer >= 1200) {
                            this.scene.events.off('update', fireworkUpdate);
                            fp.destroy();
                        }
                    };

                    this.scene.events.on('update', fireworkUpdate);
                }
            });
        });
    }
}
