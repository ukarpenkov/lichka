/** Утилиты и хелперы. */
export { withAlpha } from './color';
export {
  resolveMediaPath,
  ensureDir,
  saveAvatar,
  saveAvatarPng,
  saveImage,
  MEDIA_DIR,
  AVATARS_DIR,
  VOICE_DIR,
  IMAGES_DIR,
} from './mediaPath';export { cleanupOrphanMedia } from './cleanupMedia';
export { generateId } from './generateId';
export {
  registerNotificationChannels,
  scheduleReminder,
  schedulePeriodic,
  scheduleAlarm,
  cancelAlarm,
  canScheduleExactAlarms,
  requestIgnoreBatteryOptimizations,
  getInitialChatId,
  getInitialMessageId,
  consumeInitialChatId,
  CHANNEL_REMINDERS,
  CHANNEL_ALARMS,
} from './notificationChannels';
export {
  updateScheduledWidgetSnapshot,
  updateScheduledWidgetLocale,
  getInitialWidgetOpenTarget,
  getInitialWidgetMessageId,
  consumeInitialWidgetOpen,
  type ScheduledWidgetSnapshotItem,
} from './scheduledWidget';
export {
  getInitialShare,
  consumeInitialShare,
  type NativeSharePayload,
} from './shareIntent';
export {
  getInitialShortcutId,
  consumeInitialShortcut,
} from './launcherShortcut';
export { hapticTap, hapticLongPress, hapticSuccess } from './haptics';
export { setClipboardString } from './clipboard';
export { playSendSound, playReminderSound } from './sounds';
export {
  useKeyboardHeight,
  getAndroidChatAreaKeyboardPad,
  KEYBOARD_ANDROID_LIFT_FUDGE,
  KEYBOARD_COMPOSER_GAP,
  MESSAGE_LIST_BOTTOM_GAP,
  PAGER_TAB_BAR_HEIGHT,
} from './keyboard';
export { pickAndCompressImage, type CompressedImage } from './imageCompress';
export {
  parseMessageLinks,
  hasMessageLinks,
  toHttpHref,
  openExternalUrl,
  type MessageTextSegment,
} from './messageLinks';
