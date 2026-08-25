import type { LocaleBundle } from './types';

export const ru: LocaleBundle = {
  nativeName: 'Русский',
  dictionary: {
    // Common
    cancel: 'Отмена',
    save: 'Сохранить',
    done: 'Готово',
    error: 'Ошибка',
    loading: 'Загрузка...',
    delete: 'Удалить',
    edit: 'Редактировать',
    copy: 'Копировать',
    replace: 'Заменить',
    replaceAll: 'Заменить всё',
    merge: 'Объединить',
    change: 'Изменить',
    notSet: 'Не задано',

    // Relative dates
    today: 'Сегодня',
    yesterday: 'Вчера',
    tomorrow: 'Завтра',

    // Navigation
    themeTitle: 'Тема оформления',

    // Chat List
    chats: 'Чаты',
    deleteChat: 'Удалить чат',
    deleteChatConfirm: (title) => `Удалить «${title}»?`,
    createFirstChat: 'Создайте первый чат',
    searchMessages: 'Поиск по сообщениям...',
    nothingFound: 'Ничего не найдено',
    shareChooseChat: 'Выберите чат',

    // Chat Room
    chatNotFound: 'Чат не найден',
    deleteMessage: 'Удалить сообщение',
    deleteMessageConfirm: 'Удалить без возможности восстановления?',
    edited: 'изм.',
    editMessage: 'Редактировать',
    messagePlaceholder: 'Текст сообщения...',
    searchInChat: 'Поиск по чату...',
    messageTypeReminder: 'напоминание',
    messageTypeAlarm: 'будильник',
    messageTypePeriodic: 'периодическое',
    messageTypeImage: 'изображение',
    messageTypeVoice: 'голосовое',

    // Scheduled
    scheduled: 'Запланировано',
    noScheduled: 'Нет запланированных',
    scheduledUntitled: 'Напоминание',
    everyNMin: (n) => `каждые ${n} мин`,

    // Future Peek
    futureMode: 'Будущее',
    futureEmptyTitle: 'Здесь пока ничего не запланировано',
    futureScheduleCta: 'Запланировать',
    futurePeekA11y: 'Потяните вверх, чтобы открыть будущее чата',
    futureExitA11y: 'Потяните вниз, чтобы вернуться к истории чата',

    // Settings
    settings: 'Настройки',
    sectionTheme: 'Тема',
    sectionSound: 'Звук и тактильность',
    sectionLanguage: 'Язык',
    sectionBackup: 'Резервная копия',
    sectionAbout: 'О приложении',
    sound: 'Звук',
    hapticFeedback: 'Тактильная отдача',
    interfaceLanguage: 'Язык интерфейса',
    backupToGoogleDrive: 'Сохранить в Google Drive',
    restoreFromGoogleDrive: 'Восстановить из Google Drive',
    exportToFile: 'Экспорт в файл',
    importFromFile: 'Импорт из файла',
    backupSaved: 'Бэкап сохранён в Google Drive',
    backupFailed: 'Не удалось сохранить бэкап',
    restoreTitle: 'Восстановление',
    chooseImportMode: 'Выберите режим импорта:',
    driveRestoreNoMedia: 'Внимание: бэкап Google Drive не содержит медиафайлы. Фото, голосовые и аватары нужно восстанавливать из ZIP-экспорта.',
    restoreComplete: 'Восстановление завершено',
    noNewData: 'Нет новых данных',
    replaceAllConfirm: 'Заменить всё?',
    replaceAllWarning: 'Все текущие данные будут удалены и заменены данными из резервной копии. Это действие нельзя отменить.',
    noBackup: 'Нет бэкапа',
    noBackupMessage: 'Резервная копия не найдена в Google Drive',
    restoreFailed: 'Не удалось восстановить бэкап',
    exportDone: (path) => `Файл сохранён:\n${path}`,
    exportFailed: 'Не удалось экспортировать данные',
    importComplete: 'Импорт завершён',
    chatsAdded: (n) => `Добавлено чатов: ${n}`,
    chatsUpdated: (n) => `Обновлено чатов: ${n}`,
    messagesAdded: (n) => `Добавлено сообщений: ${n}`,
    messagesUpdated: (n) => `Обновлено сообщений: ${n}`,
    settingsImported: 'Настройки импортированы',
    mediaRestored: (n) => `Восстановлено медиа: ${n}`,
    importFailed: 'Не удалось импортировать данные',
    notBackupFile: 'Выбранный файл не является резервной копией',
    version: 'Версия',

    // Chat Form
    editChat: 'Редактировать чат',
    newChat: 'Новый чат',
    photo: 'Фото',
    emoji: 'Эмодзи',
    icon: 'Иконка',
    chatNamePlaceholder: 'Название чата',
    create: 'Создать',
    photoPickError: 'Не удалось выбрать фото',
    chatSaveError: 'Не удалось сохранить чат',
    chooseEmoji: 'Выберите эмодзи',
    chooseIcon: 'Выберите иконку',

    // Date/Time Picker
    selectDate: 'Выберите дату',
    selectTime: 'Выберите время',
    next: 'Далее',
    back: 'Назад',
    periodicity: 'Периодичность',
    every5Min: 'Каждые 5 мин',
    every10Min: 'Каждые 10 мин',
    every15Min: 'Каждые 15 мин',
    everyHour: 'Каждый час',
    everyDay: 'Каждый день',
    customInterval: 'Свой интервал:',
    minutes: 'мин',
    hours: 'ч',
    days: 'дн',

    // Voice
    voiceMessage: (sec) => `[voice:${sec}]`,
    recording: (duration) => `Запись ${duration}`,
    messageInput: 'Сообщение...',

    // Image
    attachImage: 'Прикрепить изображение',
    imagePreview: 'Предпросмотр',
    removeImage: 'Убрать',
    imagePickError: 'Не удалось выбрать изображение',
    imageMessage: (w, h) => `[image:${w}x${h}]`,

    // Permissions
    exactAlarms: 'Точные будильники',
    exactAlarmsMessage: 'Для работы будильника в любое время разрешите точные будильники в настройках:\n\n1. Откройте «Настройки устройства» → «Приложения» → «Lichka»\n2. Включите «Точные будильники»',
    batteryOptimization: 'Оптимизация батареи',
    batteryOptimizationMessage: 'Чтобы будильник срабатывал даже когда телефон заблокирован или не используется, отключите оптимизацию батареи:\n\n1. Настройки → Приложения → Lichka → Батарея\n2. Выберите «Не оптимизировать»\n\nНа некоторых устройствах также может потребоваться:\n• Разрешить автозапуск\n• Отключить ограничения фоновой активности',
    alarmPermissionsGuide: 'Чтобы будильник срабатывал всегда (даже при заблокированном экране), убедитесь что включены:\n\n✓ Точные будильники\n✓ Отключена оптимизация батареи\n✓ Разрешён показ поверх блокировки\n✓ Разрешён автозапуск (Xiaomi, Huawei и др.)',
    openSettings: 'Настройки',

    // Import
    invalidFormat: 'Некорректный формат файла',

    // Fallback
    appTitle: 'Lichka',
  },

  monthsFull: [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ],
  monthsShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
  weekdaysShort: ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'],
  date: {
    dayFirst: true,
    dayMonthJoin: ' ',
    yearJoin: ' ',
    numericSeparator: '.',
    numericDayFirst: true,
    localeTag: 'ru-RU',
  },
};
