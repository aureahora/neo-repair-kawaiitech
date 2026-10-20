import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';

const config = {
    type: Phaser.AUTO,
    parent: 'gameParent',
    backgroundColor: '#2d1f38',
    manageVisibility: true,

    render: {
        pixelArt: true,          // Четкие пиксели
        antialias: false,        // Отключение сглаживания
        mipmapFilter: 'nearest'  // Ретро-масштабирование
    },

    scale: {
        mode: Phaser.Scale.FIT,  // Игра растягивается, сохраняя пропорции 16:9
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 640,              // ЛАНДШАФТ: Ширина 640
        height: 360              // ЛАНДШАФТ: Высота 360
    },

    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },

    scene: [ Boot, Preloader, MainMenu, Game, GameOver ]
};

let gameInstance = new Phaser.Game(config);

window.addEventListener('resize', () => {
    if (gameInstance && gameInstance.scale) {
        gameInstance.scale.refresh();
    }
});
