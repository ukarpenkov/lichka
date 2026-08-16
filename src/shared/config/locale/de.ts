import type { LocaleBundle } from './types';

export const de: LocaleBundle = {
  dictionary: {
    // Common
    cancel: 'Abbrechen',
    save: 'Speichern',
    done: 'Fertig',
    error: 'Fehler',
    loading: 'Wird geladen...',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    copy: 'Kopieren',
    replace: 'Ersetzen',
    replaceAll: 'Alles ersetzen',
    merge: 'Zusammenführen',
    change: 'Ändern',
    notSet: 'Nicht festgelegt',

    // Relative dates
    today: 'Heute',
    yesterday: 'Gestern',
    tomorrow: 'Morgen',

    // Navigation
    themeTitle: 'Design',

    // Chat List
    chats: 'Chats',
    deleteChat: 'Chat löschen',
    deleteChatConfirm: (title) => `„${title}“ löschen?`,
    createFirstChat: 'Erstelle deinen ersten Chat',
    searchMessages: 'Nachrichten suchen...',
    nothingFound: 'Nichts gefunden',

    // Chat Room
    chatNotFound: 'Chat nicht gefunden',
    deleteMessage: 'Nachricht löschen',
    deleteMessageConfirm: 'Endgültig löschen?',
    edited: 'bearbeitet',
    editMessage: 'Bearbeiten',
    messagePlaceholder: 'Nachrichtentext...',
    searchInChat: 'Im Chat suchen...',
    messageTypeReminder: 'Erinnerung',
    messageTypeAlarm: 'Wecker',
    messageTypePeriodic: 'periodisch',
    messageTypeImage: 'Bild',
    messageTypeVoice: 'Sprachnachricht',

    // Scheduled
    scheduled: 'Geplant',
    noScheduled: 'Keine geplanten Nachrichten',
    everyNMin: (n) => `alle ${n} Min.`,

    // Future Peek
    futureMode: 'Zukunft',
    futureEmptyTitle: 'Noch nichts geplant',
    futureScheduleCta: 'Planen',
    futurePeekA11y: 'Nach oben ziehen, um einen Blick in die Zukunft dieses Chats zu werfen',
    futureExitA11y: 'Nach unten ziehen, um zum Chatverlauf zurückzukehren',

    // Settings
    settings: 'Einstellungen',
    sectionTheme: 'Design',
    sectionSound: 'Ton & Haptik',
    sectionLanguage: 'Sprache',
    sectionBackup: 'Sicherung',
    sectionAbout: 'Über',
    sound: 'Ton',
    hapticFeedback: 'Haptisches Feedback',
    interfaceLanguage: 'Oberflächensprache',
    backupToGoogleDrive: 'In Google Drive sichern',
    restoreFromGoogleDrive: 'Aus Google Drive wiederherstellen',
    exportToFile: 'In Datei exportieren',
    importFromFile: 'Aus Datei importieren',
    backupSaved: 'Sicherung in Google Drive gespeichert',
    backupSavedNoMedia: 'Sicherung in Google Drive gespeichert.\nMediendateien (Fotos, Sprachnachrichten, Avatare) sind nicht enthalten — für ein vollständiges Archiv „In Datei exportieren“ (ZIP) verwenden.',
    backupFailed: 'Sicherung konnte nicht gespeichert werden',
    restoreTitle: 'Wiederherstellung',
    chooseImportMode: 'Importmodus wählen:',
    driveRestoreNoMedia: 'Hinweis: Die Google-Drive-Sicherung enthält keine Mediendateien. Fotos, Sprachnachrichten und Avatare müssen aus einem ZIP-Export wiederhergestellt werden.',
    restoreComplete: 'Wiederherstellung abgeschlossen',
    noNewData: 'Keine neuen Daten',
    replaceAllConfirm: 'Alles ersetzen?',
    replaceAllWarning: 'Alle aktuellen Daten werden gelöscht und durch die Daten der Sicherung ersetzt. Diese Aktion kann nicht rückgängig gemacht werden.',
    noBackup: 'Keine Sicherung',
    noBackupMessage: 'Keine Sicherung in Google Drive gefunden',
    restoreFailed: 'Sicherung konnte nicht wiederhergestellt werden',
    exportDone: (path) => `Datei gespeichert:\n${path}`,
    exportFailed: 'Daten konnten nicht exportiert werden',
    importComplete: 'Import abgeschlossen',
    chatsAdded: (n) => `Chats hinzugefügt: ${n}`,
    chatsUpdated: (n) => `Chats aktualisiert: ${n}`,
    messagesAdded: (n) => `Nachrichten hinzugefügt: ${n}`,
    messagesUpdated: (n) => `Nachrichten aktualisiert: ${n}`,
    settingsImported: 'Einstellungen importiert',
    mediaRestored: (n) => `Medien wiederhergestellt: ${n}`,
    importFailed: 'Daten konnten nicht importiert werden',
    notBackupFile: 'Die ausgewählte Datei ist keine Sicherung',
    version: 'Version',

    // Chat Form
    editChat: 'Chat bearbeiten',
    newChat: 'Neuer Chat',
    photo: 'Foto',
    emoji: 'Emoji',
    icon: 'Symbol',
    chatNamePlaceholder: 'Chatname',
    create: 'Erstellen',
    photoPickError: 'Foto konnte nicht ausgewählt werden',
    chatSaveError: 'Chat konnte nicht gespeichert werden',
    chooseEmoji: 'Emoji auswählen',
    chooseIcon: 'Symbol auswählen',

    // Date/Time Picker
    selectDate: 'Datum auswählen',
    selectTime: 'Uhrzeit auswählen',
    next: 'Weiter',
    back: 'Zurück',
    periodicity: 'Periodizität',
    every5Min: 'Alle 5 Min.',
    every10Min: 'Alle 10 Min.',
    every15Min: 'Alle 15 Min.',
    everyHour: 'Stündlich',
    everyDay: 'Täglich',
    customInterval: 'Eigenes Intervall:',
    minutes: 'Min.',
    hours: 'Std.',
    days: 'Tg.',

    // Voice
    voiceMessage: (sec) => `[voice:${sec}]`,
    recording: (duration) => `Aufnahme ${duration}`,
    messageInput: 'Nachricht...',

    // Image
    attachImage: 'Bild anhängen',
    imagePreview: 'Vorschau',
    removeImage: 'Entfernen',
    imagePickError: 'Bild konnte nicht ausgewählt werden',
    imageMessage: (w, h) => `[image:${w}x${h}]`,

    // Permissions
    exactAlarms: 'Exakte Wecker',
    exactAlarmsMessage: 'Damit der Wecker jederzeit funktioniert, aktivieren Sie exakte Wecker in den Einstellungen:\n\n1. Öffnen Sie „Geräteeinstellungen“ → „Apps“ → „Lichka“\n2. Aktivieren Sie „Exakte Wecker“',
    batteryOptimization: 'Akkuoptimierung',
    batteryOptimizationMessage: 'Damit der Wecker auch bei gesperrtem oder ungenutztem Telefon auslöst, deaktivieren Sie die Akkuoptimierung:\n\n1. Einstellungen → Apps → Lichka → Akku\n2. Wählen Sie „Nicht optimieren“\n\nAuf manchen Geräten ist zusätzlich nötig:\n• Autostart erlauben\n• Hintergrundbeschränkungen deaktivieren',
    alarmPermissionsGuide: 'Damit der Wecker immer auslöst (auch bei gesperrtem Bildschirm), stellen Sie sicher, dass aktiviert ist:\n\n✓ Exakte Wecker\n✓ Akkuoptimierung deaktiviert\n✓ Über Sperrbildschirm anzeigen\n✓ Autostart (Xiaomi, Huawei usw.)',
    openSettings: 'Einstellungen',

    // Import
    invalidFormat: 'Ungültiges Dateiformat',

    // Fallback
    appTitle: 'Lichka',
  },

  monthsFull: [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
  ],
  monthsShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  date: {
    dayFirst: true,
    dayMonthJoin: '. ',
    yearJoin: ' ',
    numericSeparator: '.',
    numericDayFirst: true,
    localeTag: 'de-DE',
  },
};
