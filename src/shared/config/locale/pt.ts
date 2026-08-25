import type { LocaleBundle } from './types';

export const pt: LocaleBundle = {
  nativeName: 'Português',
  dictionary: {
    // Common
    cancel: 'Cancelar',
    save: 'Salvar',
    done: 'Concluído',
    error: 'Erro',
    loading: 'Carregando...',
    delete: 'Excluir',
    edit: 'Editar',
    copy: 'Copiar',
    replace: 'Substituir',
    replaceAll: 'Substituir tudo',
    merge: 'Mesclar',
    change: 'Alterar',
    notSet: 'Não definido',

    // Relative dates
    today: 'Hoje',
    yesterday: 'Ontem',
    tomorrow: 'Amanhã',

    // Navigation
    themeTitle: 'Tema',

    // Chat List
    chats: 'Conversas',
    deleteChat: 'Excluir conversa',
    deleteChatConfirm: (title) => `Excluir «${title}»?`,
    createFirstChat: 'Crie sua primeira conversa',
    searchMessages: 'Buscar mensagens...',
    nothingFound: 'Nada encontrado',
    shareChooseChat: 'Escolher conversa',

    // Chat Room
    chatNotFound: 'Conversa não encontrada',
    deleteMessage: 'Excluir mensagem',
    deleteMessageConfirm: 'Excluir permanentemente?',
    edited: 'editado',
    editMessage: 'Editar',
    messagePlaceholder: 'Texto da mensagem...',
    searchInChat: 'Buscar na conversa...',
    messageTypeReminder: 'lembrete',
    messageTypeAlarm: 'alarme',
    messageTypePeriodic: 'periódico',
    messageTypeImage: 'imagem',
    messageTypeVoice: 'voz',

    // Scheduled
    scheduled: 'Programado',
    noScheduled: 'Nenhuma mensagem programada',
    scheduledUntitled: 'Lembrete',
    everyNMin: (n) => `a cada ${n} min`,

    // Future Peek
    futureMode: 'Futuro',
    futureEmptyTitle: 'Nada programado ainda',
    futureScheduleCta: 'Programar',
    futurePeekA11y: 'Deslize para cima para espiar o futuro desta conversa',
    futureExitA11y: 'Deslize para baixo para voltar ao histórico da conversa',

    // Settings
    settings: 'Ajustes',
    sectionTheme: 'Tema',
    sectionSound: 'Som e tato',
    sectionLanguage: 'Idioma',
    sectionBackup: 'Backup',
    sectionAbout: 'Sobre',
    sound: 'Som',
    hapticFeedback: 'Resposta tátil',
    interfaceLanguage: 'Idioma da interface',
    backupToGoogleDrive: 'Fazer backup no Google Drive',
    restoreFromGoogleDrive: 'Restaurar do Google Drive',
    exportToFile: 'Exportar para arquivo',
    importFromFile: 'Importar de arquivo',
    backupSaved: 'Backup salvo no Google Drive',
    backupFailed: 'Falha ao salvar o backup',
    restoreTitle: 'Restauração',
    chooseImportMode: 'Escolha o modo de importação:',
    driveRestoreNoMedia: 'Atenção: o backup do Google Drive não inclui arquivos de mídia. Fotos, áudios e avatares precisam ser restaurados a partir de um export ZIP.',
    restoreComplete: 'Restauração concluída',
    noNewData: 'Nenhum dado novo',
    replaceAllConfirm: 'Substituir tudo?',
    replaceAllWarning: 'Todos os dados atuais serão excluídos e substituídos pelos dados do backup. Esta ação não pode ser desfeita.',
    noBackup: 'Sem backup',
    noBackupMessage: 'Backup não encontrado no Google Drive',
    restoreFailed: 'Falha ao restaurar o backup',
    exportDone: (path) => `Arquivo salvo:\n${path}`,
    exportFailed: 'Falha ao exportar os dados',
    importComplete: 'Importação concluída',
    chatsAdded: (n) => `Conversas adicionadas: ${n}`,
    chatsUpdated: (n) => `Conversas atualizadas: ${n}`,
    messagesAdded: (n) => `Mensagens adicionadas: ${n}`,
    messagesUpdated: (n) => `Mensagens atualizadas: ${n}`,
    settingsImported: 'Ajustes importados',
    mediaRestored: (n) => `Mídia restaurada: ${n}`,
    importFailed: 'Falha ao importar os dados',
    notBackupFile: 'O arquivo selecionado não é um backup',
    version: 'Versão',

    // Chat Form
    editChat: 'Editar conversa',
    newChat: 'Nova conversa',
    photo: 'Foto',
    emoji: 'Emoji',
    icon: 'Ícone',
    chatNamePlaceholder: 'Nome da conversa',
    create: 'Criar',
    photoPickError: 'Falha ao selecionar a foto',
    chatSaveError: 'Falha ao salvar a conversa',
    chooseEmoji: 'Escolha um emoji',
    chooseIcon: 'Escolha um ícone',

    // Date/Time Picker
    selectDate: 'Selecione a data',
    selectTime: 'Selecione a hora',
    next: 'Avançar',
    back: 'Voltar',
    periodicity: 'Periodicidade',
    every5Min: 'A cada 5 min',
    every10Min: 'A cada 10 min',
    every15Min: 'A cada 15 min',
    everyHour: 'A cada hora',
    everyDay: 'Todos os dias',
    customInterval: 'Intervalo personalizado:',
    minutes: 'min',
    hours: 'h',
    days: 'd',

    // Voice
    voiceMessage: (sec) => `[voice:${sec}]`,
    recording: (duration) => `Gravando ${duration}`,
    messageInput: 'Mensagem...',

    // Image
    attachImage: 'Anexar imagem',
    imagePreview: 'Pré-visualização',
    removeImage: 'Remover',
    imagePickError: 'Falha ao selecionar a imagem',
    imageMessage: (w, h) => `[image:${w}x${h}]`,

    // Permissions
    exactAlarms: 'Alarmes exatos',
    exactAlarmsMessage: 'Para o alarme funcionar a qualquer momento, ative os alarmes exatos nas configurações:\n\n1. Abra «Configurações do dispositivo» → «Aplicativos» → «Lichka»\n2. Ative «Alarmes exatos»',
    batteryOptimization: 'Otimização de bateria',
    batteryOptimizationMessage: 'Para o alarme tocar mesmo com o telefone bloqueado ou em repouso, desative a otimização de bateria:\n\n1. Configurações → Aplicativos → Lichka → Bateria\n2. Selecione «Não otimizar»\n\nEm alguns aparelhos também pode ser necessário:\n• Permitir a inicialização automática\n• Desativar restrições em segundo plano',
    alarmPermissionsGuide: 'Para o alarme tocar sempre (mesmo com a tela bloqueada), verifique se está ativado:\n\n✓ Alarmes exatos\n✓ Otimização de bateria desativada\n✓ Exibir sobre a tela de bloqueio\n✓ Inicialização automática (Xiaomi, Huawei, etc.)',
    openSettings: 'Configurações',

    // Import
    invalidFormat: 'Formato de arquivo inválido',

    // Fallback
    appTitle: 'Lichka',
  },

  monthsFull: [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ],
  monthsShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  weekdaysShort: ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'],
  date: {
    dayFirst: true,
    dayMonthJoin: ' de ',
    yearJoin: ' de ',
    numericSeparator: '/',
    numericDayFirst: true,
    localeTag: 'pt-BR',
  },
};
