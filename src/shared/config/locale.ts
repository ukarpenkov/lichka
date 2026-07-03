import { NativeModules, Platform } from 'react-native';

export type Locale = 'ru' | 'en';

export interface LocaleDictionary {
  // Common
  cancel: string;
  save: string;
  done: string;
  error: string;
  loading: string;
  delete: string;
  edit: string;
  replace: string;
  replaceAll: string;
  merge: string;
  change: string;
  notSet: string;

  // Relative dates
  today: string;
  yesterday: string;
  tomorrow: string;

  // Navigation
  themeTitle: string;

  // Chat List
  chats: string;
  deleteChat: string;
  deleteChatConfirm: (title: string) => string;
  createFirstChat: string;
  searchMessages: string;
  nothingFound: string;

  // Chat Room
  chatNotFound: string;
  deleteMessage: string;
  deleteMessageConfirm: string;
  edited: string;
  editMessage: string;
  messagePlaceholder: string;
  searchInChat: string;

  // Scheduled
  noScheduled: string;
  everyNMin: (n: number) => string;

  // Settings
  settings: string;
  sectionTheme: string;
  sectionSound: string;
  sectionLanguage: string;
  sectionBackup: string;
  sectionAbout: string;
  sound: string;
  hapticFeedback: string;
  interfaceLanguage: string;
  backupToGoogleDrive: string;
  restoreFromGoogleDrive: string;
  exportToFile: string;
  importFromFile: string;
  backupSaved: string;
  backupFailed: string;
  restoreTitle: string;
  chooseImportMode: string;
  restoreComplete: string;
  noNewData: string;
  replaceAllConfirm: string;
  replaceAllWarning: string;
  noBackup: string;
  noBackupMessage: string;
  restoreFailed: string;
  exportDone: (path: string) => string;
  exportFailed: string;
  importComplete: string;
  chatsAdded: (n: number) => string;
  chatsUpdated: (n: number) => string;
  messagesAdded: (n: number) => string;
  messagesUpdated: (n: number) => string;
  settingsImported: string;
  version: string;

  // Chat Form
  editChat: string;
  newChat: string;
  photo: string;
  emoji: string;
  chatNamePlaceholder: string;
  create: string;
  photoPickError: string;
  chatSaveError: string;
  chooseEmoji: string;

  // Date/Time Picker
  selectDate: string;
  selectTime: string;
  next: string;
  back: string;
  periodicity: string;
  every5Min: string;
  every10Min: string;
  every15Min: string;
  everyHour: string;
  everyDay: string;
  customInterval: string;
  minutes: string;
  hours: string;
  days: string;

  // Voice
  voiceMessage: (sec: number) => string;
  recording: (duration: string) => string;
  messageInput: string;

  // Permissions
  exactAlarms: string;
  exactAlarmsMessage: string;
  batteryOptimization: string;
  batteryOptimizationMessage: string;
  alarmPermissionsGuide: string;
  openSettings: string;

  // Import
  invalidFormat: string;

  // Fallback
  appTitle: string;
}

export const ru: LocaleDictionary = {
  // Common
  cancel: 'Отмена',
  save: 'Сохранить',
  done: 'Готово',
  error: 'Ошибка',
  loading: 'Загрузка...',
  delete: 'Удалить',
  edit: 'Редактировать',
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

  // Chat Room
  chatNotFound: 'Чат не найден',
  deleteMessage: 'Удалить сообщение',
  deleteMessageConfirm: 'Удалить без возможности восстановления?',
  edited: 'изменено',
  editMessage: 'Редактировать',
  messagePlaceholder: 'Текст сообщения...',
  searchInChat: 'Поиск по чату...',

  // Scheduled
  noScheduled: 'Нет запланированных',
  everyNMin: (n) => `каждые ${n} мин`,

  // Settings
  settings: 'Настройки',
  sectionTheme: 'ТЕМА',
  sectionSound: 'ЗВУК И ТАКТИЛЬНОСТЬ',
  sectionLanguage: 'ЯЗЫК',
  sectionBackup: 'РЕЗЕРВНАЯ КОПИЯ',
  sectionAbout: 'О ПРИЛОЖЕНИИ',
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
  version: 'Версия',

  // Chat Form
  editChat: 'Редактировать чат',
  newChat: 'Новый чат',
  photo: 'Фото',
  emoji: 'Эмодзи',
  chatNamePlaceholder: 'Название чата',
  create: 'Создать',
  photoPickError: 'Не удалось выбрать фото',
  chatSaveError: 'Не удалось сохранить чат',
  chooseEmoji: 'Выберите эмодзи',

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
};

export const en: LocaleDictionary = {
  // Common
  cancel: 'Cancel',
  save: 'Save',
  done: 'Done',
  error: 'Error',
  loading: 'Loading...',
  delete: 'Delete',
  edit: 'Edit',
  replace: 'Replace',
  replaceAll: 'Replace all',
  merge: 'Merge',
  change: 'Change',
  notSet: 'Not set',

  // Relative dates
  today: 'Today',
  yesterday: 'Yesterday',
  tomorrow: 'Tomorrow',

  // Navigation
  themeTitle: 'Theme',

  // Chat List
  chats: 'Chats',
  deleteChat: 'Delete chat',
  deleteChatConfirm: (title) => `Delete "${title}"?`,
  createFirstChat: 'Create your first chat',
  searchMessages: 'Search messages...',
  nothingFound: 'Nothing found',

  // Chat Room
  chatNotFound: 'Chat not found',
  deleteMessage: 'Delete message',
  deleteMessageConfirm: 'Delete permanently?',
  edited: 'edited',
  editMessage: 'Edit',
  messagePlaceholder: 'Message text...',
  searchInChat: 'Search in chat...',

  // Scheduled
  noScheduled: 'No scheduled messages',
  everyNMin: (n) => `every ${n} min`,

  // Settings
  settings: 'Settings',
  sectionTheme: 'THEME',
  sectionSound: 'SOUND & HAPTICS',
  sectionLanguage: 'LANGUAGE',
  sectionBackup: 'BACKUP',
  sectionAbout: 'ABOUT',
  sound: 'Sound',
  hapticFeedback: 'Haptic feedback',
  interfaceLanguage: 'Interface language',
  backupToGoogleDrive: 'Backup to Google Drive',
  restoreFromGoogleDrive: 'Restore from Google Drive',
  exportToFile: 'Export to file',
  importFromFile: 'Import from file',
  backupSaved: 'Backup saved to Google Drive',
  backupFailed: 'Failed to save backup',
  restoreTitle: 'Restore',
  chooseImportMode: 'Choose import mode:',
  restoreComplete: 'Restore complete',
  noNewData: 'No new data',
  replaceAllConfirm: 'Replace all?',
  replaceAllWarning: 'All current data will be deleted and replaced with the backup data. This action cannot be undone.',
  noBackup: 'No backup',
  noBackupMessage: 'Backup not found in Google Drive',
  restoreFailed: 'Failed to restore backup',
  exportDone: (path) => `File saved:\n${path}`,
  exportFailed: 'Failed to export data',
  importComplete: 'Import complete',
  chatsAdded: (n) => `Chats added: ${n}`,
  chatsUpdated: (n) => `Chats updated: ${n}`,
  messagesAdded: (n) => `Messages added: ${n}`,
  messagesUpdated: (n) => `Messages updated: ${n}`,
  settingsImported: 'Settings imported',
  version: 'Version',

  // Chat Form
  editChat: 'Edit chat',
  newChat: 'New chat',
  photo: 'Photo',
  emoji: 'Emoji',
  chatNamePlaceholder: 'Chat name',
  create: 'Create',
  photoPickError: 'Failed to pick photo',
  chatSaveError: 'Failed to save chat',
  chooseEmoji: 'Choose emoji',

  // Date/Time Picker
  selectDate: 'Select date',
  selectTime: 'Select time',
  next: 'Next',
  back: 'Back',
  periodicity: 'Periodicity',
  every5Min: 'Every 5 min',
  every10Min: 'Every 10 min',
  every15Min: 'Every 15 min',
  everyHour: 'Every hour',
  everyDay: 'Every day',
  customInterval: 'Custom interval:',
  minutes: 'min',
  hours: 'h',
  days: 'd',

  // Voice
  voiceMessage: (sec) => `[voice:${sec}]`,
  recording: (duration) => `Recording ${duration}`,
  messageInput: 'Message...',

  // Permissions
  exactAlarms: 'Exact alarms',
  exactAlarmsMessage: 'For the alarm to work at any time, please enable exact alarms in settings:\n\n1. Open «Device Settings» → «Apps» → «Lichka»\n2. Enable «Exact alarms»',
  batteryOptimization: 'Battery optimization',
  batteryOptimizationMessage: 'To ensure the alarm fires even when the phone is locked or idle, disable battery optimization:\n\n1. Settings → Apps → Lichka → Battery\n2. Select «Don\'t optimize»\n\nOn some devices you may also need:\n• Enable auto-start\n• Disable background restrictions',
  alarmPermissionsGuide: 'To make sure the alarm always fires (even when screen is locked), ensure these are enabled:\n\n✓ Exact alarms\n✓ Battery optimization disabled\n✓ Show over lock screen\n✓ Auto-start (Xiaomi, Huawei, etc.)',
  openSettings: 'Settings',

  // Import
  invalidFormat: 'Invalid file format',

  // Fallback
  appTitle: 'Lichka',
};

export const dictionaries: Record<Locale, LocaleDictionary> = { ru, en };

export const SUPPORTED_LOCALES: Locale[] = ['ru', 'en'];

/** Get dictionary for any locale string (safe for non-React modules) */
export function getDictionary(locale: string): LocaleDictionary {
  return dictionaries[locale as Locale] ?? en;
}

/** Detect system locale, fallback to 'en' */
export function getSystemLocale(): Locale {
  try {
    const deviceLocale =
      Platform.OS === 'ios'
        ? NativeModules.SettingsManager?.settings?.AppleLocale ||
          NativeModules.SettingsManager?.settings?.AppleLanguages?.[0]
        : NativeModules.I18nManager?.localeIdentifier;

    if (typeof deviceLocale === 'string') {
      const lang = deviceLocale.split(/[-_]/)[0].toLowerCase();
      if (lang === 'ru') return 'ru';
    }
  } catch {
    // ignore
  }
  return 'en';
}
