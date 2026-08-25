import type { LocaleBundle } from './types';

export const es: LocaleBundle = {
  nativeName: 'Español',
  dictionary: {
    // Common
    cancel: 'Cancelar',
    save: 'Guardar',
    done: 'Hecho',
    error: 'Error',
    loading: 'Cargando...',
    delete: 'Eliminar',
    edit: 'Editar',
    copy: 'Copiar',
    replace: 'Reemplazar',
    replaceAll: 'Reemplazar todo',
    merge: 'Combinar',
    change: 'Cambiar',
    notSet: 'No establecido',

    // Relative dates
    today: 'Hoy',
    yesterday: 'Ayer',
    tomorrow: 'Mañana',

    // Navigation
    themeTitle: 'Tema',

    // Chat List
    chats: 'Chats',
    deleteChat: 'Eliminar chat',
    deleteChatConfirm: (title) => `¿Eliminar «${title}»?`,
    createFirstChat: 'Crea tu primer chat',
    searchMessages: 'Buscar mensajes...',
    nothingFound: 'No se encontró nada',

    // Chat Room
    chatNotFound: 'Chat no encontrado',
    deleteMessage: 'Eliminar mensaje',
    deleteMessageConfirm: '¿Eliminar permanentemente?',
    edited: 'editado',
    editMessage: 'Editar',
    messagePlaceholder: 'Texto del mensaje...',
    searchInChat: 'Buscar en el chat...',
    messageTypeReminder: 'recordatorio',
    messageTypeAlarm: 'alarma',
    messageTypePeriodic: 'periódico',
    messageTypeImage: 'imagen',
    messageTypeVoice: 'voz',

    // Scheduled
    scheduled: 'Programado',
    noScheduled: 'No hay mensajes programados',
    everyNMin: (n) => `cada ${n} min`,

    // Future Peek
    futureMode: 'Futuro',
    futureEmptyTitle: 'Aún no hay nada programado',
    futureScheduleCta: 'Programar',
    futurePeekA11y: 'Desliza hacia arriba para ver el futuro de este chat',
    futureExitA11y: 'Desliza hacia abajo para volver al historial del chat',

    // Settings
    settings: 'Ajustes',
    sectionTheme: 'Tema',
    sectionSound: 'Sonido y háptica',
    sectionLanguage: 'Idioma',
    sectionBackup: 'Copia de seguridad',
    sectionAbout: 'Acerca de',
    sound: 'Sonido',
    hapticFeedback: 'Respuesta háptica',
    interfaceLanguage: 'Idioma de la interfaz',
    backupToGoogleDrive: 'Respaldar en Google Drive',
    restoreFromGoogleDrive: 'Restaurar desde Google Drive',
    exportToFile: 'Exportar a archivo',
    importFromFile: 'Importar desde archivo',
    backupSaved: 'Copia guardada en Google Drive',
    backupFailed: 'No se pudo guardar la copia',
    restoreTitle: 'Restaurar',
    chooseImportMode: 'Elige el modo de importación:',
    driveRestoreNoMedia: 'Aviso: la copia de Google Drive no incluye archivos multimedia. Las fotos, notas de voz y avatares deben restaurarse desde una exportación ZIP.',
    restoreComplete: 'Restauración completada',
    noNewData: 'No hay datos nuevos',
    replaceAllConfirm: '¿Reemplazar todo?',
    replaceAllWarning: 'Todos los datos actuales se eliminarán y se reemplazarán con los datos de la copia de seguridad. Esta acción no se puede deshacer.',
    noBackup: 'No hay copia',
    noBackupMessage: 'No se encontró una copia de seguridad en Google Drive',
    restoreFailed: 'No se pudo restaurar la copia',
    exportDone: (path) => `Archivo guardado:\n${path}`,
    exportFailed: 'No se pudieron exportar los datos',
    importComplete: 'Importación completada',
    chatsAdded: (n) => `Chats añadidos: ${n}`,
    chatsUpdated: (n) => `Chats actualizados: ${n}`,
    messagesAdded: (n) => `Mensajes añadidos: ${n}`,
    messagesUpdated: (n) => `Mensajes actualizados: ${n}`,
    settingsImported: 'Ajustes importados',
    mediaRestored: (n) => `Multimedia restaurado: ${n}`,
    importFailed: 'No se pudieron importar los datos',
    notBackupFile: 'El archivo seleccionado no es una copia de seguridad',
    version: 'Versión',

    // Chat Form
    editChat: 'Editar chat',
    newChat: 'Nuevo chat',
    photo: 'Foto',
    emoji: 'Emoji',
    icon: 'Icono',
    chatNamePlaceholder: 'Nombre del chat',
    create: 'Crear',
    photoPickError: 'No se pudo seleccionar la foto',
    chatSaveError: 'No se pudo guardar el chat',
    chooseEmoji: 'Elige un emoji',
    chooseIcon: 'Elige un icono',

    // Date/Time Picker
    selectDate: 'Selecciona la fecha',
    selectTime: 'Selecciona la hora',
    next: 'Siguiente',
    back: 'Atrás',
    periodicity: 'Periodicidad',
    every5Min: 'Cada 5 min',
    every10Min: 'Cada 10 min',
    every15Min: 'Cada 15 min',
    everyHour: 'Cada hora',
    everyDay: 'Cada día',
    customInterval: 'Intervalo personalizado:',
    minutes: 'min',
    hours: 'h',
    days: 'd',

    // Voice
    voiceMessage: (sec) => `[voice:${sec}]`,
    recording: (duration) => `Grabando ${duration}`,
    messageInput: 'Mensaje...',

    // Image
    attachImage: 'Adjuntar imagen',
    imagePreview: 'Vista previa',
    removeImage: 'Quitar',
    imagePickError: 'No se pudo seleccionar la imagen',
    imageMessage: (w, h) => `[image:${w}x${h}]`,

    // Permissions
    exactAlarms: 'Alarmas exactas',
    exactAlarmsMessage: 'Para que la alarma funcione en cualquier momento, activa las alarmas exactas en los ajustes:\n\n1. Abre «Ajustes del dispositivo» → «Aplicaciones» → «Lichka»\n2. Activa «Alarmas exactas»',
    batteryOptimization: 'Optimización de batería',
    batteryOptimizationMessage: 'Para que la alarma suene incluso con el teléfono bloqueado o en reposo, desactiva la optimización de batería:\n\n1. Ajustes → Aplicaciones → Lichka → Batería\n2. Selecciona «No optimizar»\n\nEn algunos dispositivos también puede ser necesario:\n• Permitir el inicio automático\n• Desactivar las restricciones en segundo plano',
    alarmPermissionsGuide: 'Para que la alarma suene siempre (incluso con la pantalla bloqueada), asegúrate de que esté activado:\n\n✓ Alarmas exactas\n✓ Optimización de batería desactivada\n✓ Mostrar sobre la pantalla de bloqueo\n✓ Inicio automático (Xiaomi, Huawei, etc.)',
    openSettings: 'Ajustes',

    // Import
    invalidFormat: 'Formato de archivo no válido',

    // Fallback
    appTitle: 'Lichka',
  },

  monthsFull: [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ],
  monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  weekdaysShort: ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SÁ'],
  date: {
    dayFirst: true,
    dayMonthJoin: ' de ',
    yearJoin: ' de ',
    numericSeparator: '/',
    numericDayFirst: true,
    localeTag: 'es-ES',
  },
};
