# Реализация push-напоминаний (reminder + periodic)

**Дата:** 2026-05-26
**Промпт/задача:** 8.2 Реализовать push-напоминания (reminder + periodic)

## Что сделано

### Kotlin native слой
- `AlarmScheduler.kt` — утилита для AlarmManager: scheduleReminder, schedulePeriodicFirst, cancel.requestCode = messageId.hashCode(), Intent extras: messageId, chatId, body, chatTitle, intervalMinutes
- `NotificationHelper.kt` — построение Notification: smallIcon, contentTitle=chatTitle, contentText=body, autoCancel, ContentIntent→MainActivity, Action: Snooze (5 мин)
- `AlarmReceiver.kt` — BroadcastReceiver: по default — показать notification + reschedule periodic; по ACTION_SNOOZE — cancel notification + schedule на now+5min
- `NotificationModule.kt` — +6 @ReactMethod: scheduleReminder, schedulePeriodic, cancelAlarm, getInitialChatId, consumeInitialChatId, addListener/removeListeners + emitNotificationOpen
- `MainActivity.kt` — onNewIntent: setIntent + emitNotificationOpen через NativeModule
- `AndroidManifest.xml` — +POST_NOTIFICATIONS permission, +receiver AlarmReceiver

### TypeScript слой
- `notificationChannels.ts` — обёртки: scheduleReminder, schedulePeriodic, cancelAlarm, getInitialChatId, consumeInitialChatId
- `features/notifications/schedulingService.ts` — scheduleNotification(message), cancelNotification(messageId)
- `features/notifications/useNotificationNavigation.ts` — хук: cold start (getInitialChatId) + warm start (NativeEventEmitter) → navigate ChatRoom
- `features/notifications/requestNotificationPermission.ts` — PermissionsAndroid.request для API 33+
- `App.tsx` — registerNotificationChannels() после runMigrations()
- `MessageComposer.tsx` — scheduleNotification(msg) после createMessage для reminder/alarm/periodic
- `ChatRoomScreen.tsx` — cancelNotification(id) после deleteMessage
- `AppNavigator.tsx` — NotificationHandler внутри NavigationContainer

## Изменённые файлы
- `android/app/src/main/java/com/lichka/AlarmScheduler.kt` — новый
- `android/app/src/main/java/com/lichka/NotificationHelper.kt` — новый
- `android/app/src/main/java/com/lichka/AlarmReceiver.kt` — новый
- `android/app/src/main/java/com/lichka/NotificationModule.kt` — расширен
- `android/app/src/main/java/com/lichka/MainActivity.kt` — onNewIntent
- `android/app/src/main/AndroidManifest.xml` — permissions + receiver
- `src/shared/lib/notificationChannels.ts` — расширен
- `src/shared/lib/index.ts` — экспорт новых функций
- `src/features/notifications/schedulingService.ts` — новый
- `src/features/notifications/useNotificationNavigation.ts` — новый
- `src/features/notifications/requestNotificationPermission.ts` — новый
- `src/features/notifications/index.ts` — новый
- `src/features/index.ts` — экспорт notifications
- `src/widgets/message-composer/MessageComposer.tsx` — scheduleNotification
- `src/pages/chat-room/ChatRoomScreen.tsx` — cancelNotification
- `src/app/AppNavigator.tsx` — NotificationHandler
- `App.tsx` — registerNotificationChannels
- `docs/tasks/promted-tasks.md` — отмечена 8.2

## Принятые решения
- requestCode = messageId.hashCode() — детерминированный, достаточно для UUID
- Данные нотификации (body, chatTitle) передаются через Intent extras, а не DB lookup из BroadcastReceiver (нет RN контекста)
- Deep link: chatId в Intent extra → getInitialChatId() (cold start) + NativeEventEmitter (warm start)
- Snooze: ACTION_SNOOZE в AlarmReceiver, 5 мин, для periodic — schedulePeriodicFirst с тем же interval
- AlarmManager.set() (inexact) — без SCHEDULE_EXACT_ALARM permission
- POST_NOTIFICATIONS runtime permission (API 33+)

## Известные ограничения
- При редактировании сообщения notification не обновляется (edit handler — TODO)
- После перезагрузки устройства alarm'ы теряются (нет BootReceiver)
- Inexact alarms могут быть отложены системой на ~10 мин

## Тестирование
- Создать reminder → notification появится в scheduledAt
- Tap notification → откроется ChatRoom с нужным чатом
- Создать periodic → notification + следующий через intervalMinutes
- Удалить scheduled message → alarm отменён
- Snooze → повтор через 5 мин
