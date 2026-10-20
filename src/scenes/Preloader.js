import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor () { super('Preloader'); }

    init ()
    {
        // Создаем контейнер и центрируем его на экране 640x360
        this.preloadContainer = this.add.container(320, 180);

        // Задняя подложка прогресс-бара (длина 400 пикселей, высота 20)
        this.barBg = this.add.graphics();
        this.barBg.fillStyle(0x1a1221, 1).fillRoundedRect(-200, 40, 400, 20, 10);

        // Сам заполняющийся прогресс-бар
        this.progressBar = this.add.graphics();

        // Текст загрузки (шрифт Arial, оптимизированный под ретро-стиль)
        this.loadingText = this.add.text(0, -10, 'BOOTING RETRO SYSTEM...', {
            fontFamily: 'Courier New, Arial Black, monospace',
            fontSize: '24px',
            color: '#ffccd5',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        this.preloadContainer.add([this.barBg, this.progressBar, this.loadingText]);

        // Логика заполнения полосы загрузки
        this.load.on('progress', (value) => {
            this.progressBar.clear().fillStyle(0xffb7da, 1);
            this.progressBar.fillRoundedRect(-196, 44, 392 * value, 12, 6);
        });
    }

    preload ()
    {
        // Загружаем только новые, созданные на джеме звуки из bfxr
        this.load.audio('click_sound', 'assets/sounds/click.wav');
        this.load.audio('firework_sound', 'assets/sounds/win_firework.wav');
        this.load.audio('boing_sound', 'assets/sounds/boing.wav');

        // Создаем структуру из 5 Ретро-Гаджетов
        const retroIds = ["tamagotchi", "floppy", "cassette", "gamepad", "tv"];
        const retroNames = ["TAMAGOTCHI", "FLOPPY DISK", "AUDIO CASSETTE", "RETRO GAMEPAD", "OLD TV"];

        this.gameLevels = [];
        for (let i = 0; i < retroIds.length; i++) {
            this.gameLevels.push({
                id: retroIds[i],
                title: retroNames[i],
                rank: "RETRO REPAIR 🛠️"
            });
        }

        // Записываем массив уровней в глобальный регистр игры
        this.registry.set('game_levels_data', this.gameLevels);
    }
    create ()
    {
        // Переходим в Главное меню сразу после загрузки звуков
        this.scene.start('MainMenu');
    }
}
