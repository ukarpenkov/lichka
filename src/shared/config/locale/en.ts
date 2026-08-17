import type { LocaleBundle } from './types';

export const en: LocaleBundle = {
  nativeName: 'English',
  dictionary: {
    // Common
    cancel: 'Cancel',
    save: 'Save',
    done: 'Done',
    error: 'Error',
    loading: 'Loading...',
    delete: 'Delete',
    edit: 'Edit',
    copy: 'Copy',
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
    messageTypeReminder: 'reminder',
    messageTypeAlarm: 'alarm',
    messageTypePeriodic: 'periodic',
    messageTypeImage: 'image',
    messageTypeVoice: 'voice',

    // Scheduled
    scheduled: 'Scheduled',
    noScheduled: 'No scheduled messages',
    everyNMin: (n) => `every ${n} min`,

    // Future Peek
    futureMode: 'Future',
    futureEmptyTitle: 'Nothing scheduled yet',
    futureScheduleCta: 'Schedule',
    futurePeekA11y: "Pull up to peek into this chat's future",
    futureExitA11y: 'Pull down to return to chat history',

    // Settings
    settings: 'Settings',
    sectionTheme: 'Theme',
    sectionSound: 'Sound & haptics',
    sectionLanguage: 'Language',
    sectionBackup: 'Backup',
    sectionAbout: 'About',
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
    driveRestoreNoMedia: 'Warning: Google Drive backup does not include media files. Photos, voice notes, and avatars require a ZIP export to restore.',
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
    mediaRestored: (n) => `Media restored: ${n}`,
    importFailed: 'Failed to import data',
    notBackupFile: 'Selected file is not a backup',
    version: 'Version',

    // Chat Form
    editChat: 'Edit chat',
    newChat: 'New chat',
    photo: 'Photo',
    emoji: 'Emoji',
    icon: 'Icon',
    chatNamePlaceholder: 'Chat name',
    create: 'Create',
    photoPickError: 'Failed to pick photo',
    chatSaveError: 'Failed to save chat',
    chooseEmoji: 'Choose emoji',
    chooseIcon: 'Choose icon',

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

    // Image
    attachImage: 'Attach image',
    imagePreview: 'Preview',
    removeImage: 'Remove',
    imagePickError: 'Failed to pick image',
    imageMessage: (w, h) => `[image:${w}x${h}]`,

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
  },

  monthsFull: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  date: {
    dayFirst: false,
    dayMonthJoin: ' ',
    yearJoin: ', ',
    numericSeparator: '/',
    numericDayFirst: false,
    localeTag: 'en-US',
  },
};
