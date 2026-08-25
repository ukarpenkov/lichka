import type { LocaleBundle } from './types';

export const fr: LocaleBundle = {
  nativeName: 'Français',
  dictionary: {
    // Common
    cancel: 'Annuler',
    save: 'Enregistrer',
    done: 'Terminé',
    error: 'Erreur',
    loading: 'Chargement...',
    delete: 'Supprimer',
    edit: 'Modifier',
    copy: 'Copier',
    replace: 'Remplacer',
    replaceAll: 'Tout remplacer',
    merge: 'Fusionner',
    change: 'Changer',
    notSet: 'Non défini',

    // Relative dates
    today: "Aujourd'hui",
    yesterday: 'Hier',
    tomorrow: 'Demain',

    // Navigation
    themeTitle: 'Thème',

    // Chat List
    chats: 'Discussions',
    deleteChat: 'Supprimer la discussion',
    deleteChatConfirm: (title) => `Supprimer « ${title} » ?`,
    createFirstChat: 'Créez votre première discussion',
    searchMessages: 'Rechercher des messages...',
    nothingFound: 'Rien trouvé',
    shareChooseChat: 'Choisir une discussion',

    // Chat Room
    chatNotFound: 'Discussion introuvable',
    deleteMessage: 'Supprimer le message',
    deleteMessageConfirm: 'Supprimer définitivement ?',
    edited: 'modifié',
    editMessage: 'Modifier',
    messagePlaceholder: 'Texte du message...',
    searchInChat: 'Rechercher dans la discussion...',
    messageTypeReminder: 'rappel',
    messageTypeAlarm: 'alarme',
    messageTypePeriodic: 'périodique',
    messageTypeImage: 'image',
    messageTypeVoice: 'vocal',

    // Scheduled
    scheduled: 'Programmé',
    noScheduled: 'Aucun message programmé',
    scheduledUntitled: 'Rappel',
    everyNMin: (n) => `toutes les ${n} min`,

    // Future Peek
    futureMode: 'Futur',
    futureEmptyTitle: "Rien n'est encore programmé",
    futureScheduleCta: 'Programmer',
    futurePeekA11y: 'Faites glisser vers le haut pour voir le futur de cette discussion',
    futureExitA11y: "Faites glisser vers le bas pour revenir à l'historique de la discussion",

    // Settings
    settings: 'Réglages',
    sectionTheme: 'Thème',
    sectionSound: 'Son et haptique',
    sectionLanguage: 'Langue',
    sectionBackup: 'Sauvegarde',
    sectionAbout: 'À propos',
    sound: 'Son',
    hapticFeedback: 'Retour haptique',
    interfaceLanguage: "Langue de l'interface",
    backupToGoogleDrive: 'Sauvegarder dans Google Drive',
    restoreFromGoogleDrive: 'Restaurer depuis Google Drive',
    exportToFile: 'Exporter vers un fichier',
    importFromFile: 'Importer depuis un fichier',
    backupSaved: 'Sauvegarde enregistrée dans Google Drive',
    backupFailed: "Échec de l'enregistrement de la sauvegarde",
    restoreTitle: 'Restauration',
    chooseImportMode: "Choisissez le mode d'import :",
    driveRestoreNoMedia: 'Attention : la sauvegarde Google Drive ne contient pas de fichiers média. Les photos, messages vocaux et avatars doivent être restaurés depuis un export ZIP.',
    restoreComplete: 'Restauration terminée',
    noNewData: 'Aucune nouvelle donnée',
    replaceAllConfirm: 'Tout remplacer ?',
    replaceAllWarning: 'Toutes les données actuelles seront supprimées et remplacées par les données de la sauvegarde. Cette action est irréversible.',
    noBackup: 'Aucune sauvegarde',
    noBackupMessage: 'Aucune sauvegarde trouvée dans Google Drive',
    restoreFailed: 'Échec de la restauration de la sauvegarde',
    exportDone: (path) => `Fichier enregistré :\n${path}`,
    exportFailed: "Échec de l'export des données",
    importComplete: 'Import terminé',
    chatsAdded: (n) => `Discussions ajoutées : ${n}`,
    chatsUpdated: (n) => `Discussions mises à jour : ${n}`,
    messagesAdded: (n) => `Messages ajoutés : ${n}`,
    messagesUpdated: (n) => `Messages mis à jour : ${n}`,
    settingsImported: 'Réglages importés',
    mediaRestored: (n) => `Médias restaurés : ${n}`,
    importFailed: "Échec de l'import des données",
    notBackupFile: "Le fichier sélectionné n'est pas une sauvegarde",
    version: 'Version',

    // Chat Form
    editChat: 'Modifier la discussion',
    newChat: 'Nouvelle discussion',
    photo: 'Photo',
    emoji: 'Emoji',
    icon: 'Icône',
    chatNamePlaceholder: 'Nom de la discussion',
    create: 'Créer',
    photoPickError: 'Échec de la sélection de la photo',
    chatSaveError: "Échec de l'enregistrement de la discussion",
    chooseEmoji: 'Choisir un emoji',
    chooseIcon: 'Choisir une icône',

    // Date/Time Picker
    selectDate: 'Sélectionnez la date',
    selectTime: "Sélectionnez l'heure",
    next: 'Suivant',
    back: 'Retour',
    periodicity: 'Périodicité',
    every5Min: 'Toutes les 5 min',
    every10Min: 'Toutes les 10 min',
    every15Min: 'Toutes les 15 min',
    everyHour: 'Toutes les heures',
    everyDay: 'Tous les jours',
    customInterval: 'Intervalle personnalisé :',
    minutes: 'min',
    hours: 'h',
    days: 'j',

    // Voice
    voiceMessage: (sec) => `[voice:${sec}]`,
    recording: (duration) => `Enregistrement ${duration}`,
    messageInput: 'Message...',

    // Image
    attachImage: 'Joindre une image',
    imagePreview: 'Aperçu',
    removeImage: 'Retirer',
    imagePickError: "Échec de la sélection de l'image",
    imageMessage: (w, h) => `[image:${w}x${h}]`,

    // Permissions
    exactAlarms: 'Alarmes exactes',
    exactAlarmsMessage: "Pour que l'alarme fonctionne à tout moment, activez les alarmes exactes dans les réglages :\n\n1. Ouvrez « Réglages de l'appareil » → « Applications » → « Lichka »\n2. Activez « Alarmes exactes »",
    batteryOptimization: 'Optimisation de la batterie',
    batteryOptimizationMessage: "Pour que l'alarme se déclenche même lorsque le téléphone est verrouillé ou inutilisé, désactivez l'optimisation de la batterie :\n\n1. Réglages → Applications → Lichka → Batterie\n2. Sélectionnez « Ne pas optimiser »\n\nSur certains appareils, il peut aussi être nécessaire :\n• D'autoriser le démarrage automatique\n• De désactiver les restrictions d'arrière-plan",
    alarmPermissionsGuide: "Pour que l'alarme se déclenche toujours (même écran verrouillé), assurez-vous que sont activés :\n\n✓ Alarmes exactes\n✓ Optimisation de la batterie désactivée\n✓ Affichage par-dessus l'écran de verrouillage\n✓ Démarrage automatique (Xiaomi, Huawei, etc.)",
    openSettings: 'Réglages',

    // Import
    invalidFormat: 'Format de fichier invalide',

    // Fallback
    appTitle: 'Lichka',
  },

  monthsFull: [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ],
  monthsShort: ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'],
  weekdaysShort: ['DI', 'LU', 'MA', 'ME', 'JE', 'VE', 'SA'],
  date: {
    dayFirst: true,
    dayMonthJoin: ' ',
    yearJoin: ' ',
    numericSeparator: '/',
    numericDayFirst: true,
    localeTag: 'fr-FR',
  },
};
