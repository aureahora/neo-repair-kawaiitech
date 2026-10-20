import { TamagotchiDevice } from './devices/TamagotchiDevice';
import { FloppyDevice } from './devices/FloppyDevice';
import { CassetteDevice } from './devices/CassetteDevice';
import { GamepadDevice } from './devices/GamepadDevice';
import { TVDevice } from './devices/TVDevice';
import { BlowerTool } from './devices/BlowerTool';

const DEVICE_MAP = {
    'tamagotchi': TamagotchiDevice,
    'floppy': FloppyDevice,
    'cassette': CassetteDevice,
    'gamepad': GamepadDevice,
    'tv': TVDevice
};

export class PixelGenerator {
    static generate(scene, type, currentIdx) {
        const size = 64;
        const DeviceClass = DEVICE_MAP[type];

        if (DeviceClass) {
            for (let frame = 0; frame < 8; frame++) {
                const cleanKey = `clean_${currentIdx}_f${frame}`;
                const dirtyKey = `dirty_${currentIdx}_f${frame}`;

                // ЖЕЛЕЗОБЕТОННЫЙ ПРЕДОХРАНИТЕЛЬ: Если ключи текстур существуют,
                // принудительно стираем их из кэша перед созданием новых Canvas-объектов
                if (scene.textures.exists(cleanKey)) scene.textures.remove(cleanKey);
                if (scene.textures.exists(dirtyKey)) scene.textures.remove(dirtyKey);

                const cleanTex = scene.textures.createCanvas(cleanKey, size, size);
                const dirtyTex = scene.textures.createCanvas(dirtyKey, size, size);

                // Теперь объекты гарантированно не будут null
                if (cleanTex && dirtyTex) {
                    DeviceClass.draw(cleanTex.context, dirtyTex.context, size, frame);
                    cleanTex.refresh();
                    dirtyTex.refresh();
                }
            }
        }

        if (!scene.textures.exists('air_blower')) {
            const blowerTex = scene.textures.createCanvas('air_blower', 64, 64);
            BlowerTool.draw(blowerTex.context, 64);
            blowerTex.refresh();
        }
    }
}
