import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor () { super('Boot'); }

    preload ()
    {
        // Для Compo мы убрали загрузку внешней фоновой картинки.
        // Сцена прелоада будет создана программной графикой.
    }

    create ()
    {
        localStorage.clear();
        console.log("[Compo Boot] Инициализация локального режима...");

        // Отключаем звук по умолчанию, если это требуется настройками системы,
        // но в Compo на ПК мы просто включаем его на максимум
        this.sound.mute = false;

        let savedLevel = 0;
        try
        {
            // Проверяем наличие локального сохранения в браузере
            const localData = localStorage.getItem('retro_repair_saved_level');

            if (localData !== null)
            {
                savedLevel = parseInt(localData, 10);
                console.log('[Data Sync] Успешно загружен уровень из localStorage, индекс:', savedLevel);
            }
            else
            {
                localStorage.setItem('retro_repair_saved_level', '0');
                console.log('[Data Sync] Сохранение не найдено. Создан новый профиль.');
            }
        }
        catch (error)
        {
            console.error("[Data Sync] Ошибка чтения localStorage, сброс на уровень 0:", error);
            savedLevel = 0;
        }

        // Записываем индекс текущего уровня в глобальный регистр Phaser
        this.registry.set('current_level_index', savedLevel);

        // Мгновенно переходим в сцену предварительной загрузки
        this.scene.start('Preloader');
    }
}
