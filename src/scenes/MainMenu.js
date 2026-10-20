import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    constructor () { super('MainMenu'); }

    create()
    {
        this.cameras.main.setBackgroundColor('#2d1f38');
        this.uiContainer = this.add.container(320, 180);
        this.buildUI();
    }

    buildUI()
    {
        let bgFix = this.add.graphics();
        bgFix.clear().fillStyle(0x2d1f38, 1).fillRect(-320, -180, 640, 360);

        this.logoText = this.add.text(0, -110, '🤖 NEO REPAIR: KAWAIITECH ⚡', {
            fontFamily: 'Courier New, monospace', fontSize: '26px', color: '#00ffff',
            fontWeight: 'bold', stroke: '#1a1221', strokeThickness: 5, align: 'center'
        }).setOrigin(0.5);

        this.titleText = this.add.text(0, -65, 'RETRO TECH RESTORATION', {
            fontFamily: 'Courier New, monospace', fontSize: '18px', color: '#ffccd5',
            fontWeight: 'bold', stroke: '#1a1221', strokeThickness: 4, align: 'center'
        }).setOrigin(0.5);

        let currentLvlIndex = this.registry.get('current_level_index');
        if (currentLvlIndex === undefined || currentLvlIndex >= 5) {
            currentLvlIndex = 0;
            this.registry.set('current_level_index', 0);
        }

        const gameLevels = this.registry.get('game_levels_data') || [];
        let currentLevel = gameLevels[currentLvlIndex];

        if (!currentLevel) {
            currentLevel = { title: "TAMAGOTCHI", rank: "RETRO REPAIR 🛠️" };
        }

        this.subTitleText = this.add.text(0, -10, `STATION ${currentLvlIndex + 1}: ${currentLevel.title}\n[ ${currentLevel.rank} ]`, {
            fontFamily: 'Courier New, monospace', fontSize: '14px', color: '#ffffff', align: 'center', lineSpacing: 6
        }).setOrigin(0.5);

        this.btnBg = this.add.graphics();
        this.btnBg.clear().fillStyle(0xffb7da, 1).fillRoundedRect(-120, 50, 240, 50, 10);
        this.btnBg.lineStyle(4, 0xffffff, 1).strokeRoundedRect(-120, 50, 240, 50, 10);

        this.playText = this.add.text(0, 75, 'START', {
            fontFamily: 'Courier New, monospace', fontSize: '22px', color: '#2d1f38', fontWeight: 'bold'
        }).setOrigin(0.5);

        this.blinkTimer = this.time.addEvent({
            delay: 600, callback: () => { if (this.playText && this.playText.text === 'START') this.playText.setVisible(!this.playText.visible); }, loop: true
        });

        this.clickZone = this.add.zone(0, 75, 240, 50).setInteractive({ useHandCursor: true });
        this.clickZone.on('pointerdown', () => {
            if (this.blinkTimer) this.blinkTimer.destroy();
            this.clickZone.disableInteractive();
            this.playText.setVisible(true).setText('BOOTING...');

            // ВКУСНЫЙ ЗВУК: Проигрываем звук клика по кнопке из bfxr
            this.sound.play('click_sound', { volume: 0.4 });

            this.scene.start('Game');
        });

        this.uiContainer.add([bgFix, this.logoText, this.titleText, this.subTitleText, this.btnBg, this.playText, this.clickZone]);
    }
}
