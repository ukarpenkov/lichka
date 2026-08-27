/** Public API слоя features — пользовательские действия и бизнес-логика. */
export {
  scheduleNotification,
  cancelNotification,
  requestNotificationPermission,
  ensureExactAlarmPermission,
  requestBatteryOptimizationExemption,
  useNotificationNavigation,
} from './notifications';

export { useVoiceRecorder, requestMicrophonePermission } from './voice-record';
export type { VoiceRecorderState } from './voice-record';

export { useVoicePlayer } from './voice-play';
export type { VoicePlayerState } from './voice-play';

export { useEditMessage } from './edit-message';
export type { EditFields } from './edit-message';

export { exportToJSON, exportToZIP } from './export';
export { importFromJSON, importFromZIP, type ImportMode, type ImportResult, type ZipImportResult } from './import';

export {
  getGoogleToken,
  signOutGoogle,
  uploadBackup,
  downloadBackup,
  saveToGoogleDrive,
  fetchGoogleDriveBackup,
  classifyDriveError,
  isGoogleSignInCancelled,
  type DriveBackupDownload,
  type DriveErrorKind,
} from './google-drive';

export { ImageViewer, useImageViewer } from './image-viewer';
export type { ImageViewerData } from './image-viewer';

export {
  useFuturePeekGesture,
  useFuturePeekEntryGesture,
  useFuturePeekExitGesture,
  FuturePeekOverlay,
  PEEK_THRESHOLD,
  shouldCommitPeek,
  canActivatePeekGesture,
} from './chat-future-peek';
export type {
  PeekDirection,
  PeekPhase,
  FuturePeekGestureApi,
  UseFuturePeekEntryGestureOptions,
  UseFuturePeekExitGestureOptions,
} from './chat-future-peek';

export {
  syncScheduledWidgetSnapshot,
  buildScheduledWidgetSnapshot,
  useWidgetNavigation,
  handleWidgetOpen,
  SCHEDULED_WIDGET_SNAPSHOT_LIMIT,
} from './scheduled-widget';

export { getUnreadCounts, markChatAsRead } from './unread-badges';

export { RetroTextInput } from './retro-text-caret';
export type { RetroTextInputProps } from './retro-text-caret';

export {
  useShareNavigation,
  useSharePick,
  handleShareReceived,
  beginSharePick,
  cancelSharePick,
  completeSharePick,
  normalizeSharePayload,
} from './share-into-chat';
export type { ShareDraft, NativeShareEvent } from './share-into-chat';

export {
  useLauncherShortcut,
  handleLauncherShortcut,
  SAVED_MESSAGES_CHAT_ID,
  SHORTCUT_WRITE_SAVED,
} from './launcher-shortcut';
