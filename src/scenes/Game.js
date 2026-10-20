import { Scene } from 'phaser';
import { ScratchPainter } from '../gameobjects/ScratchPainter';
import { EffectManager } from '../gameobjects/EffectManager';
import { PixelGenerator } from '../render/PixelGenerator';

export class Game extends Scene {
    constructor() { super('Game'); }

    init() {
        this.timePassed = 0;
        this.levelCompleted = false;
        this.isDragging = false;
        this.currentLvlIndex = this.registry.get('current_level_index') || 0;
        this.gameLevels = this.registry.get('game_levels_data') || [];
        this.currentLevel = this.gameLevels[this.currentLvlIndex] || { id: "tamagotchi", title: "DEVICE" };
    }

    create() {
        this.cameras.main.setBackgroundColor('#2d1f38');

        // Генерируем textures 64x64
        PixelGenerator.generate(this, this.currentLevel.id, this.currentLvlIndex);

        // Главный контейнер (320, 180)
        this.gameContainer = this.add.container(320, 180);

        this.buildGameSpace();
        this.setupInput();
    }

    buildGameSpace() {
        const baseScale = 4;

        this.painter = new ScratchPainter(this, 0, 0, 6, this.currentLvlIndex);
        this.cleanSprite = this.add.image(0, 0, `clean_${this.currentLvlIndex}_f0`).setScale(baseScale);

        // Инициализируем менеджер эффектов
        this.effects = new EffectManager(this);

        // Настройка UI
        this.uiLevelText = this.add.text(-240, -140, this.currentLevel.title, {
            fontFamily: 'Courier New, monospace', fontSize: '18px', color: '#00ffff', fontWeight: 'bold'
        });
        this.uiProgressText = this.add.text(240, -140, '0%', {
            fontFamily: 'Courier New, monospace', fontSize: '24px', color: '#ffffff', fontWeight: 'bold'
        }).setOrigin(1, 0);

        this.laserGlow = this.add.graphics().setDepth(99);

        // Добавляем в контейнер только спрайт устройства и тексты интерфейса
        this.gameContainer.add([
            this.cleanSprite,
            this.uiLevelText,
            this.uiProgressText
        ]);

        // Масштабируем и добавляем слои маски грязи в контейнер
        if (this.painter && this.painter.rtLayers) {
            this.painter.rtLayers.forEach(rt => {
                if (rt) {
                    rt.setScale(baseScale);
                    this.gameContainer.add(rt);
                }
            });
        }

        // Прячем системный курсор и создаем спрайт фена
        this.input.setDefaultCursor('none');
        this.blowerCursor = this.add.image(-100, -100, 'air_blower').setDepth(400).setScale(1.2);
        this.blowerCursor.setAngle(-45);
    }

    setupInput() {
        this.input.on('pointerdown', (pointer) => {
            if (this.levelCompleted) return;
            this.isDragging = true;
            this.handleErase(pointer);
        });

        this.input.on('pointermove', (pointer) => {
            if (this.blowerCursor) this.blowerCursor.setPosition(pointer.x, pointer.y);
            if (this.isDragging && !this.levelCompleted) this.handleErase(pointer);
        });

        this.input.on('pointerup', () => {
            this.isDragging = false;
        });

        this.events.on('shutdown', () => {
            this.input.setDefaultCursor('default');
        });
    }

    handleErase(pointer) {
        if (this.levelCompleted) return;

        // Смещения сопла относительно курсора мыши
        const shiftX = 30;
        const shiftY = 10;

        const nozzleX = pointer.x + shiftX;
        const nozzleY = pointer.y + shiftY;

        // 1. ВЫЧИСЛЯЕМ ТОЧНЫЙ ЦВЕТ ГРЯЗИ ИЗ CANVAS ИСТОЧНИКА НА ЛЕТУ
        let detectedColor = 0x8a8275;

        const containerScale = this.gameContainer.scaleX;
        const spriteScale = 4;

        // Переводим экранные координаты сопла в локальные координаты текстуры 64x64
        const relX = (nozzleX - this.gameContainer.x) / containerScale;
        const relY = (nozzleY - this.gameContainer.y) / containerScale;
        const localX = (relX / spriteScale) + 32;
        const localY = (relY / spriteScale) + 32;

        if (localX >= 0 && localX < 64 && localY >= 0 && localY < 64) {
            const textureKey = `dirty_${this.currentLvlIndex}_f${this.currentFrameIndex}`;
            const canvas = this.textures.get(textureKey).getSourceImage();
            const ctx = canvas.getContext ? canvas.getContext('2d') : null;

            if (ctx) {
                try {
                    // Извлекаем массив [R, G, B, A] из конкретного пикселя
                    const imgData = ctx.getImageData(Math.floor(localX), Math.floor(localY), 1, 1).data;

                    // Проверяем, что пиксель не прозрачный и содержит цвет грязи
                    if (imgData[3] > 10) {
                        const r = imgData[0];
                        const g = imgData[1];
                        const b = imgData[2];
                        // Переводим RGB в Hex-формат для Phaser Tint
                        detectedColor = (r << 16) | (g << 8) | b;
                    }
                } catch (e) {
                    // Вне рамок Canvas
                }
            }
        }

        // 2. ВЫЗЫВАЕМ СТИРАНИЕ МАСКИ
        const virtualPointer = { x: nozzleX, y: nozzleY };
        const percent = this.painter.eraseAt(virtualPointer, this.gameContainer, this.currentFrameIndex);

        if (percent > 0) {
            this.uiProgressText.setText(percent + '%');

            // 3. ЗАПУСКАЕМ ЭФФЕКТЫ: Координаты сопла на экране и извлеченный Hex-цвет
            this.effects.spawnAsmrBubble(nozzleX, nozzleY, detectedColor);
        }

        if (percent >= 85) this.completeLevel();
    }

    update(time, delta) {
        // Если уровень завершен — крутить девайс больше нельзя
        if (this.levelCompleted) return;

        this.timePassed += (delta / 1000) * 1.5;
        this.currentFrameIndex = Math.floor(this.timePassed) % 8;

        const wobbleY = Math.sin(this.timePassed * 2.0) * 2.5;

        if (this.cleanSprite && this.painter) {
            this.cleanSprite.setTexture(`clean_${this.currentLvlIndex}_f${this.currentFrameIndex}`);
            this.cleanSprite.setY(wobbleY);

            this.painter.setActiveFrame(this.currentFrameIndex);

            this.painter.rtLayers.forEach(rt => {
                if (rt) rt.setY(wobbleY);
            });
        }
    }

    completeLevel() {
        this.levelCompleted = true;
        this.uiProgressText.setText('100%');

        if (this.blowerCursor) this.blowerCursor.setVisible(false);
        this.input.setDefaultCursor('default');

        this.cameras.main.shake(200, 0.012); // Сочная ретро-тряска экрана

        // Намертво прячем все слои маски грязи, открывая чистый сияющий корпус
        if (this.painter && this.painter.rtLayers) {
            this.painter.rtLayers.forEach(rt => { if (rt) rt.setVisible(false); });
        }

        if (this.cleanSprite) {
            // Жестко ставим кадр 0 (лицевая сторона с широкой улыбкой)
            this.cleanSprite.setTexture(`clean_${this.currentLvlIndex}_f0`);
            this.cleanSprite.setY(0); // Сбрасываем старое покачивание из update

            // БЕЗОПАСНЫЙ ВКУСНЫЙ ЗВУК: Проигрываем прыжок boing из bfxr
            try {
                this.sound.play('boing_sound', { volume: 0.35 });
            } catch (e) {
                // Если в браузере сбой кэша, игра просто пойдет дальше без вылета
            }

            // Запускаем жизнерадостные прыжки счастья верх-вниз
            this.tweens.add({
                targets: this.cleanSprite,
                y: -15,
                duration: 500,
                yoyo: true,
                loop: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Запускаем победные салюты (внутри EffectManager звук тоже защищен через try/catch)
        if (this.effects) {
            this.effects.spawnVictoryFirework(this.gameContainer);
        }

        // Таймер перехода на экран GameOver (переключение уровня произойдет там)
        this.time.delayedCall(3500, () => {
            this.scene.stop('Game');
            this.scene.start('GameOver');
        });
    }
}
