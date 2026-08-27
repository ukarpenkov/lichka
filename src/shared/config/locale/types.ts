export interface LocaleDictionary {
  // Common
  cancel: string;
  save: string;
  done: string;
  error: string;
  loading: string;
  delete: string;
  edit: string;
  copy: string;
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
  shareChooseChat: string;

  // Chat Room
  chatNotFound: string;
  deleteMessage: string;
  deleteMessageConfirm: string;
  edited: string;
  editMessage: string;
  messagePlaceholder: string;
  searchInChat: string;
  messageTypeReminder: string;
  messageTypeAlarm: string;
  messageTypePeriodic: string;
  messageTypeImage: string;
  messageTypeVoice: string;
  openLink: string;
  linkOpenFailed: string;

  // Scheduled
  scheduled: string;
  noScheduled: string;
  scheduledUntitled: string;
  everyNMin: (n: number) => string;

  // Future Peek
  futureMode: string;
  futureEmptyTitle: string;
  futureScheduleCta: string;
  futurePeekA11y: string;
  futureExitA11y: string;

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
  backupTooLarge: string;
  driveAuthDeveloper: string;
  driveAuthPlayServices: string;
  driveAuthDenied: string;
  restoreTitle: string;
  chooseImportMode: string;
  driveRestoreNoMedia: string;
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
  mediaRestored: (n: number) => string;
  importFailed: string;
  notBackupFile: string;
  version: string;

  // Chat Form
  editChat: string;
  newChat: string;
  photo: string;
  emoji: string;
  icon: string;
  chatNamePlaceholder: string;
  create: string;
  photoPickError: string;
  chatSaveError: string;
  chooseEmoji: string;
  chooseIcon: string;

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

  // Image
  attachImage: string;
  imagePreview: string;
  removeImage: string;
  imagePickError: string;
  imageMessage: (width: number, height: number) => string;

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

/** Per-locale date formatting rules (data-driven, no code branches). */
export interface DateLocaleConfig {
  /** true = day before month ("29 мая"), false = month before day ("May 29") */
  dayFirst: boolean;
  /** joiner between day and month */
  dayMonthJoin: string;
  /** joiner before the year */
  yearJoin: string;
  /** separator for numeric dates ("15.01.2024" vs "01/15/2024") */
  numericSeparator: string;
  /** numeric date: day first ("15.01") or month first ("01/15") */
  numericDayFirst: boolean;
  /** BCP-47 tag for Intl/toLocaleDateString */
  localeTag: string;
}

/** Everything a single language needs: strings, month names, date rules. */
export interface LocaleBundle {
  /** Language name in its own language ("Русский", "English"). */
  nativeName: string;
  dictionary: LocaleDictionary;
  monthsFull: string[];
  monthsShort: string[];
  /** Short weekday names, Sunday-first (index = Date.getDay()). Already uppercase. */
  weekdaysShort: string[];
  date: DateLocaleConfig;
}
