# Full-screen Alarm (AlarmActivity) — Task 8.3

**Дата:** 2026-05-26
**Промпт/задача:** Реализовать full-screen alarm (будильник) — задача 8.3 из docs/tasks/promted-tasks.md

## Что сделано

- **AlarmActivity.kt** — полноэкранная Activity поверх lock screen (`showWhenLocked`, `turnScreenOn`). Воспроизводит звук будильника через `MediaPlayer` на `STREAM_ALARM` с вибрацией. Кнопки «Отключить» и «Snooze (5 мин)».
- **AlarmScheduler.kt** — добавлен метод `scheduleAlarm()` с `AlarmManager.setAlarmClock()` для точного времени. Отдельный `buildAlarmPendingIntent()` с `EXTRA_IS_ALARM = true`.
- **AlarmReceiver.kt** — при срабатывании alarm-типа запускает `AlarmActivity` вместо показа Notification. `handleSnooze()` для alarm перепланирует через `scheduleAlarm()`.
- **NotificationModule.kt** — новые `@ReactMethod`: `scheduleAlarm()`, `canScheduleExactAlarms()`, `requestIgnoreBatteryOptimizations()`.
- **AndroidManifest.xml** — добавлены `SCHEDULE_EXACT_ALARM`, `USE_FULL_SCREEN_INTENT` пермишены и `AlarmActivity` declaration.
- **activity_alarm.xml** — layout с иконкой будильника, текстом сообщения, кнопками «Отключить» и «Snooze».
- **notificationChannels.ts** — JS bridge обёртки для `scheduleAlarm`, `canScheduleExactAlarms`, `requestIgnoreBatteryOptimizations`.
- **schedulingService.ts** — `alarm` тип теперь маршрутизируется через `scheduleAlarm()` (точный) вместо `scheduleReminder()` (inexact).
- **requestExactAlarmPermission.ts** — permission flow: проверка `canScheduleExactAlarms()`, rationale Alert, запрос battery optimization exemption (один раз).
- **MessageComposer.tsx** — перед scheduling alarm: проверка `ensureExactAlarmPermission()`, затем `requestBatteryOptimizationExemption()`.

## Изменённые файлы

- `android/app/src/main/AndroidManifest.xml` — permissions + AlarmActivity
- `android/app/src/main/java/com/lichka/AlarmScheduler.kt` — `scheduleAlarm()`, `cancelAlarm()`, `EXTRA_IS_ALARM`
- `android/app/src/main/java/com/lichka/AlarmReceiver.kt` — запуск AlarmActivity для alarm
- `android/app/src/main/java/com/lichka/AlarmActivity.kt` — **новый** full-screen Activity
- `android/app/src/main/java/com/lichka/NotificationModule.kt` — 3 новых @ReactMethod
- `android/app/src/main/res/layout/activity_alarm.xml` — **новый** layout
- `src/shared/lib/notificationChannels.ts` — обёртки
- `src/shared/lib/index.ts` — экспорт новых функций
- `src/features/notifications/schedulingService.ts` — маршрутизация alarm
- `src/features/notifications/requestExactAlarmPermission.ts` — **новый** permission flow
- `src/features/notifications/index.ts` — экспорт
- `src/features/index.ts` — экспорт
- `src/widgets/message-composer/MessageComposer.tsx` — permission check перед alarm

## Принятые решения

- `setAlarmClock()` вместо `setExact()` — показывает иконку будильника в статус-баре и гарантирует точное срабатывание даже в Doze mode
- Звук через `RingtoneManager.getDefaultUri(TYPE_ALARM)` — использует системный звук будильника, не требует кастомного ресурса
- `EXTRA_IS_ALARM` флаг в PendingIntent — позволяет `AlarmReceiver` отличать alarm от reminder без изменения request code
- Battery optimization запрашивается один раз (флаг `batteryOptimizationRequested` в модуле)
- Permission flow: если `canScheduleExactAlarms()` возвращает `false` — показываем Alert с предложением открыть настройки, scheduling не происходит

## Известные ограничения

- После перезагрузки устройства запланированные будильники теряется (нет `BootReceiver`)
- На Android < 12 `SCHEDULE_EXACT_ALARM` не требуется, но `setAlarmClock()` работает и там
- Кастомный звук будильника не поддержан — только системный default

## Тестирование

- Сборка `./gradlew assembleDebug` — без ошибок
- Ручное тестирование: создание alarm-сообщения → точное срабатывание → full-screen Activity со звуком и вибрацией
- Кнопка «Отключить» — останавливает звук, закрывает экран
- Кнопка «Snooze» — повтор через 5 мин через `setAlarmClock()`
- Без `SCHEDULE_EXACT_ALARM` permission — Alert с предложением открыть настройки
