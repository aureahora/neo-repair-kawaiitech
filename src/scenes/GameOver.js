import { Scene } from 'phaser';

export class GameOver extends Scene {
    constructor() { super('GameOver'); }

    create() {
        this.cameras.main.setBackgroundColor('#2d1f38');
        this.uiContainer = this.add.container(320, 180);

        let currentIdx = this.registry.get('current_level_index');
        if (currentIdx === undefined) currentIdx = 0;

        const gameLevels = this.registry.get('game_levels_data') || [];
        const finishedLevel = gameLevels[currentIdx] || { title: "DEVICE" };

        currentIdx += 1;

        this.buildUI(currentIdx, gameLevels, finishedLevel);
    }

    buildUI(currentIdx, gameLevels, finishedLevel) {
        this.titleText = this.add.text(0, -60, 'REPAIR COMPLETE!', {
            fontFamily: 'Courier New, monospace', fontSize: '32px', color: '#ff6b8b', fontWeight: 'bold', stroke: '#1a1221', strokeThickness: 6
        }).setOrigin(0.5);

        this.subText = this.add.text(0, -10, `${finishedLevel.title} IS NOW ALIVE & HAPPY!`, {
            fontFamily: 'Courier New, monospace', fontSize: '14px', color: '#ffffff', align: 'center'
        }).setOrigin(0.5);

        this.isGameFinished = false;
        let buttonText = 'NEXT WORKSTATION';

        if (currentIdx >= gameLevels.length) {
            this.isGameFinished = true;
            buttonText = 'RESTART SYSTEM';
            this.subText.setText("CONGRATULATIONS!\nALL OLD TECH IS FULLY RESTORED! 👑");
        }

        this.btnBg = this.add.graphics();
        this.btnBg.fillStyle(0xffb7da, 1).fillRoundedRect(-130, 45, 260, 44, 10);
        this.btnBg.lineStyle(4, 0xffffff, 1).strokeRoundedRect(-130, 45, 260, 44, 10);

        this.btnText = this.add.text(0, 67, buttonText, {
            fontFamily: 'Courier New, monospace', fontSize: buttonText.length > 12 ? '14px' : '18px', color: '#2d1f38', fontWeight: 'bold'
        }).setOrigin(0.5);

        this.clickZone = this.add.zone(0, 67, 260, 44).setInteractive({ useHandCursor: true });
        this.clickZone.on('pointerdown', () => {
            this.handleContinueAction(currentIdx, this.clickZone);
        });

        this.uiContainer.add([this.titleText, this.subText, this.btnBg, this.btnText, this.clickZone]);
    }

    handleContinueAction(currentIdx, clickZone) {
        clickZone.disableInteractive();
        this.btnText.setText('LOADING...');

        // КРИТИЧЕСКИЙ ФИКС ОЧИСТКИ ТЕКСТУР:
        // Находим и полностью вычищаем ВСЕ старые процедурные текстуры из памяти Phaser,
        // чтобы избежать конфликтов дублирования ключей ("Texture key already in use") при перезапуске!
        const allKeys = this.textures.getTextureKeys();
        allKeys.forEach(key => {
            if (key.startsWith('clean_') || key.startsWith('dirty_')) {
                this.textures.remove(key);
            }
        });

        // СЦЕНАРИЙ А: Конец игры — намертво сбрасываем прогресс и уходим в Главное Меню
        if (this.isGameFinished) {
            this.registry.set('current_level_index', 0);
            try {
                localStorage.setItem('retro_repair_saved_level', '0');
            } catch (e) { console.error(e); }
            this.scene.start('MainMenu');
            return;
        }

        // СЦЕНАРИЙ Б: Обычный переход на следующий уровень гаджетов
        this.registry.set('current_level_index', currentIdx);
        try {
            localStorage.setItem('retro_repair_saved_level', currentIdx.toString());
        } catch (e) { console.error(e); }

        this.scene.start('Game');
    }
}
